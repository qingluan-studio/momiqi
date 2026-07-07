import type { ProviderAPI } from '../../types'

export const deepseekAPI: ProviderAPI = {
  name: 'DeepSeek',
  basePath: '/api/deepseek',
  chatEndpoint: '/chat/completions',
  modelsEndpoint: '/models',
  defaultModel: 'deepseek-chat',

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
    throw new Error('DeepSeek 返回格式异常')
  },
}
