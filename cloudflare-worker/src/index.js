export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
    }

    let target = ''

    if (path.startsWith('/api/deepseek')) {
      target = 'https://api.deepseek.com/v1' + path.replace('/api/deepseek', '')
    } else if (path.startsWith('/api/gemini')) {
      target = 'https://generativelanguage.googleapis.com/v1beta' + path.replace('/api/gemini', '')
    } else if (path.startsWith('/api/groq')) {
      target = 'https://api.groq.com/openai/v1' + path.replace('/api/groq', '')
    } else {
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders,
      })
    }

    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.delete('origin')
    headers.delete('referer')

    const fetchOptions = {
      method: request.method,
      headers,
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = request.body
    }

    try {
      const response = await fetch(target, fetchOptions)
      const responseHeaders = new Headers(response.headers)
      responseHeaders.set('Access-Control-Allow-Origin', '*')
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: '代理请求失败: ' + err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }
  },
}
