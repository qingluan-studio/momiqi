import type { ProviderAPI } from '../../types'

export const geminiAPI: ProviderAPI = {
  name: 'Gemini',
  basePath: '/api/gemini',
  chatEndpoint: '/models/',
  modelsEndpoint: '/models',
  defaultModel: 'gemini-2.0-flash',

  buildHeaders(_apiKey: string) {
    return {
      'Content-Type': 'application/json',
    }
  },

  buildBody(_model: string, messages: { role: string; content: string }[]) {
    const systemMsgs = messages.filter((m) => m.role === 'system')
    const userMsgs = messages.filter((m) => m.role === 'user')
    const assistantMsgs = messages.filter((m) => m.role === 'assistant')

    const contents: { role: string; parts: { text: string }[] }[] = []

    for (let i = 0; i < userMsgs.length; i++) {
      contents.push({
        role: 'user',
        parts: [{ text: userMsgs[i].content }],
      })
      if (assistantMsgs[i]) {
        contents.push({
          role: 'model',
          parts: [{ text: assistantMsgs[i].content }],
        })
      }
    }

    return {
      contents,
      systemInstruction: systemMsgs.length > 0
        ? { parts: { text: systemMsgs.map((m) => m.content).join('\n') } }
        : undefined,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }
  },

  parseResponse(data: any) {
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return { text: data.candidates[0].content.parts[0].text, tokens: data.usageMetadata?.totalTokenCount }
    }
    throw new Error('Gemini 返回格式异常')
  },
}
