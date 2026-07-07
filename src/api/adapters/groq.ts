import type { ProviderAPI } from '../../types'

export const groqAPI: ProviderAPI = {
  name: 'Groq',
  basePath: '/api/groq',
  chatEndpoint: '/chat/completions',
  modelsEndpoint: '/models',
  defaultModel: 'llama-3.3-70b-versatile',

  buildHeaders(apiKey: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }
  },

  buildBody(model: string, messages: { role: string; content: string }[]) {
    return {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      stream: false,
    }
  },

  parseResponse(data: any) {
    if (data?.choices?.[0]?.message?.content) {
      return { text: data.choices[0].message.content, tokens: data.usage?.total_tokens }
    }
    throw new Error('Groq 返回格式异常')
  },
}
