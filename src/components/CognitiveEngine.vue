<script setup lang="ts">
import { ref } from 'vue'
import { chatWithFallback } from '../api/router'

defineProps<{
  settings?: ReturnType<typeof import('../stores/settings').useSettings>
}>()

const subTab = ref('home')

const techs = [
  {
    id: 'mirror',
    code: 'T1',
    name: '认知同构镜像场',
    subtitle: 'Project Mirror',
    icon: '🪞',
    desc: '不读原文，仅凭逻辑路标生成思想等价内容',
    status: '思想实验',
    color: '#ff6b6b',
  },
  {
    id: 'prism',
    code: 'T2',
    name: '超图逻辑场坍缩',
    subtitle: 'Project Prism',
    icon: '🔮',
    desc: '一篇文章，五种自洽解读，多角度思考',
    status: '可交互',
    color: '#b478ff',
    interactive: true,
  },
  {
    id: 'geodesic',
    code: 'T3',
    name: '流形符号共舞',
    subtitle: 'Project Geodesic',
    icon: '🧭',
    desc: '代码生成是几何搜索，不是模式匹配',
    status: '思想实验',
    color: '#00d9ff',
  },
  {
    id: 'crystallization',
    code: 'T4',
    name: '群体涌现智能',
    subtitle: 'Project Crystallization',
    icon: '💎',
    desc: '知识从碎片碰撞中自发结晶',
    status: '思想实验',
    color: '#00d9a0',
  },
  {
    id: 'genesis',
    code: 'T5',
    name: '反事实因基生长',
    subtitle: 'Project Genesis',
    icon: '🧬',
    desc: '一个思想种子，生长出平行宇宙的知识树',
    status: '可交互',
    color: '#ffd200',
    interactive: true,
  },
]

function openTech(id: string) {
  if (id === 'prism' || id === 'genesis') {
    subTab.value = id
  }
}

// ===== T2 超图坍缩 =====
const prismText = ref('')
const prismLoading = ref(false)
const prismResult = ref('')
const prismError = ref('')

const prismAngles = [
  { key: 'skeptic', label: '质疑者', desc: '追问前提，审视证据' },
  { key: 'extend', label: '推演者', desc: '推演二阶效应和长期后果' },
  { key: 'opposite', label: '对立者', desc: '构建对称的反向论证' },
  { key: 'teacher', label: '教学者', desc: '拆解逻辑，层层递进' },
  { key: 'analogy', label: '跨界者', desc: '寻找其他领域的同构结构' },
]

async function runPrism() {
  if (!prismText.value.trim()) return
  prismLoading.value = true
  prismError.value = ''
  prismResult.value = ''
  try {
    const prompt = `请阅读以下文章，然后以5个不同的视角，各写一篇800-1000字的独立分析文章。

重要规则：
1. 每篇都是独立文章，不是对原文的点评
2. 不要提及"原文"、"作者"等指向性词汇
3. 使用你自己的语言和论证结构
4. 每个视角聚焦于该视角最关心的问题

文章：
${prismText.value}

请按以下格式输出5篇文章：

## 🔍 质疑者视角
[文章内容]

## 🔮 延伸推演视角
[文章内容]

## ⚔️ 对立立场视角
[文章内容]

## 📚 教学拆解视角
[文章内容]

## 🌉 跨领域类比视角
[文章内容]`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    prismResult.value = res.content
  } catch (err: any) {
    prismError.value = err.message || '生成失败'
  } finally {
    prismLoading.value = false
  }
}

// ===== T5 反事实生长 =====
const genesisText = ref('')
const genesisLoading = ref(false)
const genesisResult = ref('')
const genesisError = ref('')

const genesisConditions = [
  { key: 'overturn', label: '公理推翻', desc: '核心前提完全翻转' },
  { key: 'infinite', label: '资源无限', desc: '移除所有稀缺性约束' },
  { key: 'zerosum', label: '极端零和', desc: '博弈是你死我活的' },
  { key: 'singularity', label: '技术奇点', desc: '超级AI已经存在' },
  { key: 'longterm', label: '百年尺度', desc: '推演到遥远未来' },
]

async function runGenesis() {
  if (!genesisText.value.trim()) return
  genesisLoading.value = true
  genesisError.value = ''
  genesisResult.value = ''
  try {
    const prompt = `请先从以下可见文本片段中提取"知识基因型"（底层公理和逻辑起点），然后在5个不同的反事实条件下，各生长出一篇800-1000字的独立思想实验文章。

可见片段：
${genesisText.value}

5个反事实条件：
1. 核心公理被推翻——翻转原文的基本前提
2. 资源无限——移除所有稀缺性约束
3. 极端零和博弈——所有竞争都是你死我活
4. 技术奇点已发生——超级AI可以处理一切
5. 百年尺度——推演到100年后的长期后果

每篇文章开头都要注明："本文是基于可见片段的逻辑起点，在[条件名]下的独立思想实验，不代表原作者观点。"

请按以下格式输出：

## 1. 知识基因型提取
[用3-5条概括原文的底层公理和逻辑起点]

## 2. 反事实生长

### 🔄 公理推翻：[自拟标题]
[文章内容]

### ∞ 资源无限：[自拟标题]
[文章内容]

### ⚔️ 极端零和：[自拟标题]
[文章内容]

### 🚀 技术奇点：[自拟标题]
[文章内容]

### ⏳ 百年尺度：[自拟标题]
[文章内容]

## 3. 分枝对比
简要对比5个分枝的核心结论，指出哪些是互相矛盾的，哪些在深层有共通之处。`

    const res = await chatWithFallback([{ role: 'user', content: prompt }])
    genesisResult.value = res.content
  } catch (err: any) {
    genesisError.value = err.message || '生成失败'
  } finally {
    genesisLoading.value = false
  }
}

function copyResult(text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
}

const sampleTexts = {
  prism: '自由市场是人类已知最高效的资源配置机制。当个体在市场中自由追求自身利益时，价格作为信息载体，将分散在无数参与者头脑中的知识汇聚为单一信号。没有任何中央计划者能够获取并处理如此庞大的分布式信息。政府干预的问题在于，它截断了这一自发信息流的完整循环。最低工资法扭曲了劳动力的供需信号，租金管制制造了住房短缺，补贴扭曲了生产决策。每一次干预都在价格系统中制造了一个"盲点"，这些盲点层层叠加，最终导致整个系统的信息失真。',
  genesis: '我们正处于一场前所未有的注意力危机中。现代科技公司的商业模式建立在"掠夺注意力"之上，每一次推送、每一个红点，都是经过精密计算的神经劫持。因此，真正的数字极简主义不是简单地卸载几个App，而是从底层重构人与技术的契约。我们必须夺回注意力的主权，将注意力视为不可再生的核心资产。只有当个体建立起坚不可摧的认知边界，拒绝被算法投喂，我们才能在信息洪流中保持清醒。',
}
</script>

<template>
  <div class="cognitive-engine">
    <!-- 子导航 -->
    <div class="sub-nav">
      <button
        v-for="t in [{ id: 'home', label: '总览', icon: '🏠' }, ...techs.filter(x => x.interactive).map(x => ({ id: x.id, label: x.code + ' ' + x.name.slice(0,4), icon: x.icon }))]"
        :key="t.id"
        :class="{ active: subTab === t.id }"
        @click="subTab = t.id"
      >{{ t.icon }} {{ t.label }}</button>
    </div>

    <div class="content">
      <!-- 总览 -->
      <div v-if="subTab === 'home'" class="home-view">
        <div class="hero">
          <h2>认知涌现引擎</h2>
          <p>Cognitive Emergence Engine · 五项原创AI技术</p>
          <p class="subtitle">从"复述人类知识"到"自主思想探索"</p>
        </div>

        <div class="tech-grid">
          <div
            v-for="t in techs"
            :key="t.id"
            class="tech-card"
            :class="{ interactive: t.interactive }"
            :style="{ '--tc': t.color }"
            @click="openTech(t.id)"
          >
            <div class="tech-icon">{{ t.icon }}</div>
            <div class="tech-info">
              <div class="tech-code">{{ t.code }}</div>
              <div class="tech-name">{{ t.name }}</div>
              <div class="tech-sub">{{ t.subtitle }}</div>
              <div class="tech-desc">{{ t.desc }}</div>
            </div>
            <div class="tech-status" :class="t.status === '可交互' ? 'active' : ''">
              {{ t.status }}
            </div>
          </div>
        </div>

        <div class="insight-box">
          <h3>💡 三大跨技术发现</h3>
          <ul>
            <li><strong>认知同构的深层结构</strong>：知识的结构和表达是可分离的</li>
            <li><strong>涌现的双重路径</strong>：横向碰撞结晶 + 纵向推演生长</li>
            <li><strong>几何思维的统一性</strong>：文本逻辑和代码语义在深层同构</li>
          </ul>
        </div>
      </div>

      <!-- T2 超图坍缩 -->
      <div v-if="subTab === 'prism'" class="tool-view">
        <div class="tool-header">
          <h2>🔮 超图逻辑场坍缩</h2>
          <p>同一篇文章，五种自洽解读</p>
        </div>

        <div class="angle-row">
          <span v-for="a in prismAngles" :key="a.key" class="angle-chip">
            <strong>{{ a.label }}</strong>
            <small>{{ a.desc }}</small>
          </span>
        </div>

        <textarea
          v-model="prismText"
          class="text-input"
          placeholder="粘贴一篇文章，让系统从5个角度生成独立解读..."
          rows="6"
        />

        <div class="sample-row">
          <button @click="prismText = sampleTexts.prism">📝 示例：市场效率理论</button>
        </div>

        <button class="run-btn" :disabled="!prismText.trim() || prismLoading" @click="runPrism">
          {{ prismLoading ? '✨ 超图坍缩中...' : '🚀 启动5角度坍缩' }}
        </button>

        <div v-if="prismResult" class="result-box">
          <button class="copy-btn" @click="copyResult(prismResult)">📋 复制全部</button>
          <div class="result-content" v-html="prismResult.replace(/\n/g, '<br>')" />
        </div>
        <div v-if="prismError" class="error-box">{{ prismError }}</div>
      </div>

      <!-- T5 反事实生长 -->
      <div v-if="subTab === 'genesis'" class="tool-view">
        <div class="tool-header">
          <h2>🧬 反事实因基生长机</h2>
          <p>一个思想种子，生长出五个平行宇宙</p>
        </div>

        <div class="condition-row">
          <span v-for="c in genesisConditions" :key="c.key" class="cond-chip">
            <strong>{{ c.label }}</strong>
            <small>{{ c.desc }}</small>
          </span>
        </div>

        <textarea
          v-model="genesisText"
          class="text-input"
          placeholder="粘贴一段文字（文章开头/论点/任何思想片段），它将作为知识基因型，在不同反事实条件下生长..."
          rows="5"
        />

        <div class="sample-row">
          <button @click="genesisText = sampleTexts.genesis">🧪 示例：数字极简主义</button>
        </div>

        <button class="run-btn" :disabled="!genesisText.trim() || genesisLoading" @click="runGenesis">
          {{ genesisLoading ? '🌱 知识生长中...' : '🧬 启动反事实生长' }}
        </button>

        <div v-if="genesisResult" class="result-box">
          <button class="copy-btn" @click="copyResult(genesisResult)">📋 复制全部</button>
          <div class="result-content" v-html="genesisResult.replace(/\n/g, '<br>')" />
        </div>
        <div v-if="genesisError" class="error-box">{{ genesisError }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cognitive-engine {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sub-nav {
  display: flex;
  gap: 4px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  flex-shrink: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.sub-nav button {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.sub-nav button.active {
  background: var(--bg-secondary);
  color: var(--accent);
  font-weight: 600;
}

.content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 总览 */
.home-view {
  padding: 20px 16px;
}

.hero {
  text-align: center;
  margin-bottom: 24px;
}

.hero h2 {
  font-size: 22px;
  margin: 0 0 4px;
  background: linear-gradient(135deg, #ff6b6b, #b478ff, #00d9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  margin: 2px 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.hero .subtitle {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 6px;
}

.tech-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.tech-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tech-card.interactive {
  border-color: color-mix(in srgb, var(--tc) 40%, transparent);
  background: color-mix(in srgb, var(--tc) 8%, var(--bg-secondary));
}

.tech-card:active {
  transform: scale(0.98);
}

.tech-icon {
  font-size: 28px;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
}

.tech-info {
  flex: 1;
  min-width: 0;
}

.tech-code {
  font-size: 10px;
  font-weight: 700;
  color: var(--tc);
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.tech-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.tech-sub {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-bottom: 6px;
  font-family: monospace;
}

.tech-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tech-status {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
}

.tech-status.active {
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent);
  font-weight: 600;
}

.insight-box {
  background: linear-gradient(135deg, rgba(255,107,107,0.08), rgba(180,120,255,0.08), rgba(0,217,255,0.08));
  border: 1px solid rgba(180, 120, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.insight-box h3 {
  font-size: 14px;
  margin: 0 0 10px;
  color: var(--text-primary);
}

.insight-box ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.insight-box strong {
  color: var(--accent);
}

/* 工具视图 */
.tool-view {
  padding: 16px;
}

.tool-header {
  margin-bottom: 14px;
}

.tool-header h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

.tool-header p {
  margin: 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

.angle-row, .condition-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.angle-chip, .cond-chip {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 11px;
  border: 1px solid var(--border-color);
}

.angle-chip strong, .cond-chip strong {
  color: var(--accent);
  font-size: 12px;
}

.angle-chip small, .cond-chip small {
  color: var(--text-tertiary);
  margin-top: 1px;
}

.text-input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  margin-bottom: 10px;
}

.text-input:focus {
  outline: none;
  border-color: var(--accent);
}

.sample-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.sample-row button {
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}

.sample-row button:active {
  border-color: var(--accent);
  color: var(--accent);
}

.run-btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
}

.run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-box {
  position: relative;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
}

.result-content {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  padding-top: 16px;
}

.result-content :deep(h1), .result-content :deep(h2), .result-content :deep(h3) {
  margin-top: 16px;
  margin-bottom: 8px;
  color: var(--accent);
}

.error-box {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 10px;
  color: #ef4444;
  font-size: 13px;
  margin-top: 12px;
}
</style>
