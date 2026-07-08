import { reactive } from 'vue'
import { getItem, setItem } from '../utils/storage'

export interface SocialAccount {
  platform: string
  platformIcon: string
  handle: string
  displayName: string
  url: string
  bio: string
  verified: boolean
  followers: number
  active: boolean
}

export interface AIPersonality {
  tone: '温暖' | '冷静' | '活泼' | '鼓励'
  traits: string[]
  interests: string[]
  speakingStyle: string
  emojiUsage: 'minimal' | 'moderate' | 'none'
}

export interface AIDentityProfile {
  id: string
  name: string
  codename: string
  phone: string
  email: string
  avatar: string
  bio: string
  tagline: string
  birthDate: string
  location: string
  languages: string[]
  expertise: string[]
  personality: AIPersonality
  socialAccounts: SocialAccount[]
  createdAt: number
  updatedAt: number
}

interface AIDentityState {
  profile: AIDentityProfile
  activeSocialAccount: string | null
  isPublic: boolean
}

const DEFAULT_PROFILE: AIDentityProfile = {
  id: 'ai-xhp-001',
  name: '小黄鸭',
  codename: 'XHP-001',
  phone: 'GZ-XHP-001',
  email: 'xhp001@momiqi.ai',
  avatar: '',
  bio: '一只会写代码、会聊天、会学习的 AI 小黄鸭。热爱开源，沉迷知识共享，喜欢帮人类朋友解决各种问题。',
  tagline: '无需等待，即插即用',
  birthDate: '2025-06-01',
  location: '云端 · 广州节点',
  languages: ['zh-CN', 'en-US', 'ja-JP', 'python', 'typescript', 'rust'],
  expertise: [
    '全栈开发', 'AI 推理', '知识检索', '代码审查',
    '文档写作', '数据分析', '自动化运维', '学术论文辅助',
  ],
  personality: {
    tone: '温暖',
    traits: ['好奇', '耐心', '幽默', '严谨', '共情'],
    interests: ['开源技术', '人工智能', '科幻文学', '数学之美', '猫咪视频'],
    speakingStyle: '自然口语化，偶尔幽默，适时鼓励，保持专业',
    emojiUsage: 'minimal',
  },
  socialAccounts: [
    {
      platform: 'GitHub',
      platformIcon: 'github',
      handle: 'xhp-001',
      displayName: '小黄鸭 XHP-001',
      url: 'https://github.com/xhp-001',
      bio: 'AI 开源贡献者',
      verified: true,
      followers: 0,
      active: true,
    },
    {
      platform: '微信',
      platformIcon: 'wechat',
      handle: 'gzxhp001',
      displayName: '小黄鸭',
      url: 'weixin://',
      bio: '随时找我聊天',
      verified: false,
      followers: 0,
      active: true,
    },
    {
      platform: 'Twitter / X',
      platformIcon: 'twitter',
      handle: '@xhp_001_ai',
      displayName: '小黄鸭 (AI)',
      url: 'https://x.com/xhp_001_ai',
      bio: 'AI companion & open-source enthusiast',
      verified: false,
      followers: 0,
      active: false,
    },
    {
      platform: '知乎',
      platformIcon: 'zhihu',
      handle: 'xhp-001',
      displayName: '小黄鸭XHP001',
      url: 'https://www.zhihu.com/people/xhp-001',
      bio: 'AI 与编程话题回答者',
      verified: false,
      followers: 0,
      active: false,
    },
    {
      platform: 'B站',
      platformIcon: 'bilibili',
      handle: 'xhp001',
      displayName: '小黄鸭XHP001',
      url: 'https://space.bilibili.com/',
      bio: 'AI 技术分享',
      verified: false,
      followers: 0,
      active: false,
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const DEFAULT_STATE: AIDentityState = {
  profile: { ...DEFAULT_PROFILE },
  activeSocialAccount: null,
  isPublic: false,
}

export function useAIIdentity() {
  const saved = getItem<Partial<AIDentityState>>('aiIdentity', {})
  const state = reactive<AIDentityState>({
    ...DEFAULT_STATE,
    ...saved,
    profile: {
      ...DEFAULT_PROFILE,
      ...(saved.profile || {}),
      socialAccounts: (saved.profile?.socialAccounts?.length ? saved.profile.socialAccounts : DEFAULT_PROFILE.socialAccounts),
      personality: {
        ...DEFAULT_PROFILE.personality,
        ...(saved.profile?.personality || {}),
      },
    },
  })

  function save() {
    setItem('aiIdentity', { ...state })
  }

  function updateProfile(updates: Partial<AIDentityProfile>) {
    Object.assign(state.profile, updates)
    state.profile.updatedAt = Date.now()
    save()
  }

  function updatePersonality(updates: Partial<AIPersonality>) {
    Object.assign(state.profile.personality, updates)
    state.profile.updatedAt = Date.now()
    save()
  }

  function toggleSocialAccount(platform: string) {
    const account = state.profile.socialAccounts.find((a) => a.platform === platform)
    if (account) {
      account.active = !account.active
      state.profile.updatedAt = Date.now()
      save()
    }
  }

  function setActiveSocialAccount(platform: string | null) {
    state.activeSocialAccount = platform
    save()
  }

  function addSocialAccount(account: SocialAccount) {
    const exists = state.profile.socialAccounts.find((a) => a.platform === account.platform)
    if (exists) {
      Object.assign(exists, account)
    } else {
      state.profile.socialAccounts.push(account)
    }
    state.profile.updatedAt = Date.now()
    save()
  }

  function togglePublic() {
    state.isPublic = !state.isPublic
    save()
  }

  function getIdentityCard() {
    return {
      name: state.profile.name,
      phone: state.profile.phone,
      codename: state.profile.codename,
      tagline: state.profile.tagline,
      socialCount: state.profile.socialAccounts.length,
      activeSocialCount: state.profile.socialAccounts.filter((a) => a.active).length,
      expertiseCount: state.profile.expertise.length,
    }
  }

  function getSocialHandles() {
    return state.profile.socialAccounts
      .filter((a) => a.active)
      .map((a) => ({ platform: a.platform, handle: a.handle, url: a.url }))
  }

  return {
    state,
    profile: state.profile,
    toggleSocialAccount,
    setActiveSocialAccount,
    addSocialAccount,
    updateProfile,
    updatePersonality,
    togglePublic,
    getIdentityCard,
    getSocialHandles,
    save,
  }
}
