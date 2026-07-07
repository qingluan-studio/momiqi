import type { ProviderAPI } from '../../types'

export const kimiAPI: ProviderAPI = {
  name: 'Kimi',
  basePath: '/api/kimi',
  chatEndpoint: '/chat/completions',
  modelsEndpoint: '/models',
  defaultModel: 'moonshot-v1-8k',

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
    throw new Error('Kimi 返回格式异常')
  },
}
