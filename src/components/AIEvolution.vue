<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visibleSections = ref<Record<string, boolean>>({})

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).dataset.section
        if (entry.isIntersecting && id) {
          visibleSections.value[id] = true
        }
      })
    },
    { threshold: 0.15 }
  )

  setTimeout(() => {
    document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el))
  }, 100)
})

const levels = [
  {
    id: 'L1',
    title: '聊天机器人',
    subtitle: '基础对话交互',
    desc: '完成简单问答、文本生成、翻译等对话任务。具备基本的语言理解和生成能力，能进行上下文相关的多轮对话。如同早期的 ChatGPT，是 AI 面向大众的第一扇门。',
    color: '#22c55e',
    icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  },
  {
    id: 'L2',
    title: '推理器',
    subtitle: '复杂逻辑推理',
    desc: '具备链式思维，能处理数学证明、代码调试、逻辑推演等需要深度思考的任务。通过思维链内部推理，在科学、编程、法律等专业领域展现出接近专家的分析能力。',
    color: '#3b82f6',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    id: 'L3',
    title: '智能体',
    subtitle: '自主决策与工具调用',
    desc: '能自主规划并执行多步骤任务：调用 API、操作文件、浏览网页、控制软件。这是 2026 年正在突破的前沿——从被动响应进化为主动执行。Agent 可以分解目标、选择工具链、验证结果并自我纠错。',
    color: '#8b5cf6',
    icon: 'M12 2a4 4 0 014 4v2a4 4 0 01-4 4 4 4 0 01-4-4V6a4 4 0 014-4zm0 14c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4z M9 14.5l1.5 1.5 4.5-4.5',
  },
  {
    id: 'L4',
    title: '创新者',
    subtitle: '提出新假设与科学发现',
    desc: '能独立提出新理论、设计实验、发现科学规律。不仅解决已知问题，更能提出有价值的新问题。在药物研发、材料科学、数学定理证明等领域展现出创造性突破能力。',
    color: '#f59e0b',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z',
  },
  {
    id: 'L5',
    title: '组织',
    subtitle: '管理复杂系统',
    desc: '能替代整个组织的职能：统筹资源、协调多智能体协作、制定战略规划。多个 L4 级 AI 在 L5 级治理框架下形成自组织系统，具备企业级甚至城市级的运营管理能力。',
    color: '#ef4444',
    icon: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v.01M12 14v.01M16 14v.01M8 17v.01M12 17v.01M16 17v.01',
  },
]

const deepmindLevels = [
  { level: 'Level 0', title: '无 AI', desc: '传统软件，按预设规则运行，无学习能力', color: '#6b7280' },
  { level: 'Level 1', title: '新兴 AGI', desc: '简单规则系统，刚刚跨越传统程序边界', color: '#22c55e' },
  { level: 'Level 2', title: '熟练 AGI', desc: '如 Siri、Alexa 等语音助手，能理解并执行常见指令', color: '#3b82f6' },
  { level: 'Level 3', title: '专业 AGI', desc: '在特定领域达到专业水平，可替代初级专业人员', color: '#8b5cf6' },
  { level: 'Level 4', title: '大师 AGI', desc: '超越 90% 人类，达到领域顶尖专家水平', color: '#f59e0b' },
  { level: 'Level 5', title: '超越人类 AGI / ASI', desc: '超越 99% 人类，具备超人类级智能', color: '#ef4444' },
]

const horizontalDimensions = [
  {
    icon: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z',
    title: '具身智能',
    subtitle: 'Embodied AI',
    desc: '从"纯大脑"进化为有物理身体的智能体。通过机器人、传感器与真实世界交互，理解物理规律、空间关系和因果关系。这是 AGI 落地的关键一环。',
    color: '#06b6d4',
  },
  {
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 11a4 4 0 100-8 4 4 0 000 8z',
    title: '多智能体集体智能',
    subtitle: 'Multi-Agent ASI',
    desc: 'Google DeepMind 提出的 ASI 四大路径之一。大量 AGI 实例通过协作、市场机制或自组织形成集体，可能涌现出超越任何个体的超级智能。',
    color: '#a855f7',
  },
  {
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    title: '递归自我改进',
    subtitle: 'Recursive Self-Improvement',
    desc: 'AI 系统自主进行 AI 研发，形成"越聪明就越能让自己更聪明"的正反馈循环。这是 Nick Bostrom 提出的"智能爆炸"核心机制，可能让 AGI 到 ASI 的过渡在极短时间内完成。',
    color: '#f43f5e',
  },
  {
    icon: 'M12.998 2a8.95 8.95 0 00-3.998.826m10.925 5.082A8.95 8.95 0 0021 12a9 9 0 01-18 0 8.95 8.95 0 01.935-3.992 M12 2v4 M4.22 4.22l2.83 2.83 M14.95 14.95l2.83 2.83',
    title: '世界模型 / 物理 AI',
    subtitle: 'World Models',
    desc: '从语言模型进化为能模拟物理世界因果关系的模型。让 AI 真正"理解"现实世界，而非仅仅"预测"下一个 token。视频生成模型正在向世界模型演进。',
    color: '#10b981',
  },
]
</script>

<template>
  <div class="evolution-panel">
    <div class="evo-hero">
      <div class="hero-glow" />
      <h1 class="hero-title">AI 进化之路</h1>
      <p class="hero-subtitle">从对话到文明 — 理解人工智能的能力阶梯</p>
    </div>

    <div class="evo-content">
      <section data-section="5levels" class="evo-section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          五级进化框架
        </h2>
        <p class="section-desc">从基础对话到组织级智能，能力逐层解锁。这不是一次性跃迁到 AGI，而是一场渐进的进化之旅。</p>

        <div class="level-stairs">
          <div
            v-for="(lv, i) in levels"
            :key="lv.id"
            class="level-card"
            :class="{ visible: visibleSections['5levels'] }"
            :style="{ '--color': lv.color, '--delay': `${i * 0.12}s`, borderLeftColor: lv.color }"
          >
            <div class="level-badge" :style="{ background: lv.color }">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path :d="lv.icon" />
              </svg>
            </div>
            <div class="level-body">
              <div class="level-head">
                <span class="level-id" :style="{ color: lv.color }">{{ lv.id }}</span>
                <span class="level-title">{{ lv.title }}</span>
                <span class="level-subtitle">{{ lv.subtitle }}</span>
              </div>
              <p class="level-desc">{{ lv.desc }}</p>
            </div>
            <div class="level-line" :class="{ 'last': i === levels.length - 1 }" />
          </div>
        </div>
      </section>

      <section data-section="deepmind" class="evo-section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" />
          </svg>
          Google DeepMind AGI 六级量表
        </h2>
        <p class="section-desc">从"与人类对比"的角度，DeepMind 将 AGI 细分为 6 个等级。即使进入"AGI 时代"，内部仍有漫长的进化空间。</p>

        <div class="deepmind-gauge" :class="{ visible: visibleSections['deepmind'] }">
          <div class="gauge-track">
            <div
              v-for="(dl, i) in deepmindLevels"
              :key="dl.level"
              class="gauge-step"
              :style="{ '--color': dl.color, '--delay': `${i * 0.12}s` }"
            >
              <div class="gauge-dot" :style="{ background: dl.color }">
                <span class="gauge-num">{{ i }}</span>
              </div>
              <div class="gauge-info">
                <span class="gauge-level" :style="{ color: dl.color }">{{ dl.level }}</span>
                <span class="gauge-title">{{ dl.title }}</span>
                <span class="gauge-desc">{{ dl.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-section="horizontal" class="evo-section">
        <h2 class="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 M12 2a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10" />
            <path d="M2 12h20" />
          </svg>
          横向进化：不是"更聪明"，而是"更完整"
        </h2>
        <p class="section-desc">除了纵向智力提升，AI 还在多个横向维度上进化，走向真正的通用智能。</p>

        <div class="horizontal-grid">
          <div
            v-for="(hd, i) in horizontalDimensions"
            :key="hd.title"
            class="h-card"
            :class="{ visible: visibleSections['horizontal'] }"
            :style="{ '--color': hd.color, '--delay': `${i * 0.1}s` }"
          >
            <div class="h-icon" :style="{ background: hd.color }">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path :d="hd.icon" />
              </svg>
            </div>
            <div class="h-text">
              <span class="h-title">{{ hd.title }}</span>
              <span class="h-subtitle">{{ hd.subtitle }}</span>
              <p class="h-desc">{{ hd.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <section data-section="summary" class="evo-section summary-section">
        <div class="summary-card" :class="{ visible: visibleSections['summary'] }">
          <svg class="summary-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <p>AI 的进化不是单一维度上"变聪明"，而是在<strong>纵向深度</strong>与<strong>横向广度</strong>上的协同跃迁。从 L1 聊天机器人到 L5 组织智能，从纯语言模型到具身智能与世界模型——每一步都在解锁新的可能性。</p>
          <p class="summary-attribution">参考来源：Google DeepMind、OpenAI 分级框架、Nick Bostrom 智能爆炸理论</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.evolution-panel {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.evo-hero {
  position: relative;
  padding: 32px 20px 28px;
  text-align: center;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -40%;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
  position: relative;
}

.hero-subtitle {
  font-size: 13px;
  color: var(--text-tertiary);
  position: relative;
}

.evo-content {
  padding: 0 16px 40px;
}

.evo-section {
  margin-bottom: 36px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.section-title svg {
  color: var(--accent);
  flex-shrink: 0;
}

.section-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 18px;
  line-height: 1.6;
  padding-left: 34px;
}

.level-stairs {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.level-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 16px 4px 16px 0;
  border-left: 2px solid transparent;
  opacity: 0;
  transform: translateX(-16px);
  transition: all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
  transition-delay: var(--delay);
}

.level-card.visible {
  opacity: 1;
  transform: translateX(0);
}

.level-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  margin-left: -23px;
  z-index: 1;
}

.level-body {
  flex: 1;
  min-width: 0;
}

.level-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.level-id {
  font-size: 15px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.level-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.level-subtitle {
  font-size: 11px;
  color: var(--text-tertiary);
}

.level-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.level-line {
  position: absolute;
  left: 0;
  top: 52px;
  bottom: -8px;
  width: 2px;
  background: linear-gradient(to bottom, var(--color), var(--color), transparent);
  opacity: 0.3;
}

.level-line.last {
  display: none;
}

.deepmind-gauge {
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.deepmind-gauge.visible {
  opacity: 1;
  transform: translateY(0);
}

.gauge-track {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}

.gauge-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  opacity: 0;
  transform: translateX(-12px);
  transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  transition-delay: var(--delay);
}

.deepmind-gauge.visible .gauge-step {
  opacity: 1;
  transform: translateX(0);
}

.gauge-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.gauge-num {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
}

.gauge-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.gauge-level {
  font-size: 12px;
  font-weight: 700;
}

.gauge-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.gauge-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.horizontal-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.h-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 14px;
  border: 1px solid var(--border-color);
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.45s cubic-bezier(0.22, 0.61, 0.36, 1);
  transition-delay: var(--delay);
}

.h-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.h-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.h-text {
  flex: 1;
  min-width: 0;
}

.h-title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1px;
}

.h-subtitle {
  display: block;
  font-size: 11px;
  color: var(--color);
  font-weight: 500;
  margin-bottom: 6px;
}

.h-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.65;
}

.summary-section {
  margin-top: 8px;
  margin-bottom: 8px;
}

.summary-card {
  background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08));
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.summary-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.summary-icon {
  margin-bottom: 12px;
}

.summary-card p {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.summary-attribution {
  margin-top: 12px;
  font-size: 11px !important;
  color: var(--text-tertiary) !important;
}
</style>
