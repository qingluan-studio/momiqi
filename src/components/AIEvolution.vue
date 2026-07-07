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
    { threshold: 0.1 }
  )
  setTimeout(() => {
    document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el))
  }, 100)
})

const levels = [
  { id: 'L1', title: '聊天机器人', subtitle: '基础对话交互', desc: '完成简单问答、文本生成、翻译等。具备基本语言理解和生成能力，支持多轮对话。如早期 ChatGPT。', color: '#22c55e', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { id: 'L2', title: '推理器', subtitle: '复杂逻辑推理', desc: '具备链式思维，能处理数学证明、代码调试、逻辑推演。通过思维链内部推理，在科学、编程、法律等专业领域展现专家级分析能力。代表：o1、DeepSeek-R1。', color: '#3b82f6', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'L3', title: '智能体', subtitle: '自主决策与工具调用', desc: '自主规划并执行多步骤任务：调用API、操作文件、浏览网页、控制软件。2026年正在突破的前沿。可分解目标、选择工具链、验证结果并自我纠错。代表：Manus、AutoGPT、Claude Code。', color: '#8b5cf6', icon: 'M12 2a4 4 0 014 4v2a4 4 0 01-4 4 4 4 0 01-4-4V6a4 4 0 014-4zm0 14c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4z M9 14.5l1.5 1.5 4.5-4.5' },
  { id: 'L4', title: '创新者', subtitle: '提出新假设与科学发现', desc: '独立提出新理论、设计实验、发现科学规律。在药物研发、材料科学、数学定理证明等领域展现创造性突破能力。', color: '#f59e0b', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z' },
  { id: 'L5', title: '组织', subtitle: '管理复杂系统', desc: '替代组织职能：统筹资源、协调多智能体协作、制定战略。多个L4级AI在L5级治理框架下自组织，具备企业级甚至城市级运营管理能力。', color: '#ef4444', icon: 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v.01M12 14v.01M16 14v.01M8 17v.01M12 17v.01M16 17v.01' },
]

const deepmindLevels = [
  { level: 'Level 0', title: '无 AI', desc: '传统软件，按预设规则运行，无学习能力', color: '#6b7280' },
  { level: 'Level 1', title: '新兴 AGI', desc: '简单规则系统，刚刚跨越传统程序边界', color: '#22c55e' },
  { level: 'Level 2', title: '熟练 AGI', desc: '如 Siri、Alexa 等语音助手，理解并执行常见指令', color: '#3b82f6' },
  { level: 'Level 3', title: '专业 AGI', desc: '特定领域达到专业水平，可替代初级专业人员', color: '#8b5cf6' },
  { level: 'Level 4', title: '大师 AGI', desc: '超越 90% 人类，达到领域顶尖专家水平', color: '#f59e0b' },
  { level: 'Level 5', title: '超越人类 ASI', desc: '超越 99% 人类，具备超人类级智能', color: '#ef4444' },
]

const modelFamilies = [
  { name: 'GPT 系列', org: 'OpenAI', models: 'GPT-3.5 → GPT-4 → GPT-4o → o1/o3', desc: '从对话模型到推理模型的进化典范。GPT-4o 实现多模态原生融合，o系列引入推理时扩展。', color: '#10a37f' },
  { name: 'Claude 系列', org: 'Anthropic', models: 'Claude 2 → Claude 3 → Claude 3.5/4', desc: '以安全对齐和长上下文著称。Claude 3.5 Sonnet 在编程领域领先，支持200K tokens上下文。', color: '#d97706' },
  { name: 'Gemini 系列', org: 'Google DeepMind', models: 'Gemini 1.0 → 1.5 → 2.0/2.5', desc: '原生多模态架构，从出生就设计为多模态。Gemini 1.5 Pro 支持100万tokens超长上下文。', color: '#4285f4' },
  { name: 'DeepSeek 系列', org: '深度求索', models: 'DeepSeek-V2 → V3 → R1', desc: '以开源、高性价比、MoE架构著称。R1 首次公开推理模型完整思维链，训练成本仅数百万美元。', color: '#6366f1' },
  { name: 'Llama 系列', org: 'Meta', models: 'Llama 2 → Llama 3 → Llama 4', desc: '开源旗舰，推动开源生态爆发。Llama 3 的社区衍生模型数量超过数千个。', color: '#0668e1' },
  { name: 'Qwen 系列', org: '阿里通义', models: 'Qwen → Qwen2 → Qwen2.5', desc: '国内最强开源模型系列，覆盖多尺寸多语言。Qwen2.5 在数学和编程上表现突出，生态丰富。', color: '#f97316' },
  { name: 'Grok 系列', org: 'xAI', models: 'Grok-1 → Grok-2 → Grok-3', desc: 'Elon Musk 创立，以实时信息获取和幽默风格为特色。Grok-3 在推理能力上大幅提升。', color: '#1d9bf0' },
  { name: 'Mistral 系列', org: 'Mistral AI', models: 'Mistral 7B → Mixtral → Mistral Large', desc: '欧洲AI旗帜，以高效小型模型和MoE架构闻名。Mixtral 8x7B 以较小参数达到优秀性能。', color: '#f59e0b' },
]

const architectures = [
  { title: 'Transformer', subtitle: '2017 - 一切的基础', desc: 'Google 提出的注意力机制架构。自注意力(Self-Attention)让模型能并行处理序列，是GPT/BERT/所有LLM的骨架。"Attention Is All You Need"开启了整个时代。', tags: ['Encoder-Decoder', 'Self-Attention', '多头注意力'] },
  { title: 'MoE 混合专家', subtitle: 'Mixture of Experts', desc: '将模型拆分为多个"专家"子网络，每次推理只激活部分专家。DeepSeek-V2/V3、Mixtral 的核心技术。可以在不增加推理成本的前提下大幅扩展模型容量，是性价比之王。', tags: ['稀疏激活', '路由机制', '负载均衡'] },
  { title: 'Mamba / SSM', subtitle: '状态空间模型', desc: '线性时间复杂度的替代架构，抛弃注意力机制。Mamba-2 结合了SSM和注意力优势。在处理超长序列时效率远超Transformer，是下一代架构的重要候选。', tags: ['线性复杂度', '长序列', '选择性扫描'] },
  { title: 'GQA / MLA', subtitle: '推理加速技术', desc: '分组查询注意力(GQA)减少KV缓存，多查询潜在注意力(MLA)进一步压缩。DeepSeek-V2提出的MLA极大降低了推理显存占用，是低成本部署大模型的关键。', tags: ['KV缓存压缩', '推理优化'] },
  { title: 'RoPE / YaRN', subtitle: '位置编码进化', desc: '旋转位置编码(RoPE)通过复数旋转编码相对位置，YaRN扩展可支持128K+超长上下文。解决了传统绝对位置编码无法外推的问题。', tags: ['相对位置', '长度外推', '128K+'] },
]

const trainingTech = [
  { title: 'RLHF', subtitle: '人类反馈强化学习', desc: 'InstructGPT/ChatGPT 的核心训练方法。先训练奖励模型，再用PPO算法对齐人类偏好。使得模型输出更符合人类期望——有帮助、真实、无害。', color: '#ec4899' },
  { title: 'DPO / ORPO', subtitle: '直接偏好优化', desc: 'DPO 跳过奖励模型，直接从偏好对中学习。ORPO 更进一步，合并SFT和对齐到一个阶段。训练更简单稳定，逐渐取代RLHF成为主流对齐方法。', color: '#8b5cf6' },
  { title: 'Constitutional AI', subtitle: '宪法式AI', desc: 'Anthropic 提出的方法：让AI按一套"宪法"原则自我监督和修正。不依赖大量人工标注，通过AI自我批评+强化学习实现价值对齐。Claude系列的核心。', color: '#d97706' },
  { title: '知识蒸馏', subtitle: '大模型教小模型', desc: '用大模型(教师)的输出训练小模型(学生)。DeepSeek-R1用小模型蒸馏出接近大模型的推理能力。资源有限时获得强模型的最有效方法。', color: '#06b6d4' },
  { title: '合成数据', subtitle: 'AI训练AI', desc: '用LLM生成高质量训练数据。Phi系列、Llama 3 大量使用合成数据。解决了互联网优质数据枯竭问题，是数据飞轮的核心引擎。', color: '#10b981' },
  { title: 'GRPO', subtitle: '组相对策略优化', desc: 'DeepSeek-R1 使用的RL算法。无需额外价值网络，通过组内相对比较估计优势，训练更高效。是推理模型训练的关键技术创新。', color: '#6366f1' },
]

const reasoningTech = [
  { title: 'Chain-of-Thought', subtitle: '思维链推理', desc: '让模型在输出答案前先生成中间推理步骤。"Let\'s think step by step"是经典提示。显著提升数学、逻辑、常识推理能力。o1/R1将其内化为训练目标。', icon: 'M4 6h16M4 12h16M4 18h16' },
  { title: 'Tree-of-Thought', subtitle: '树状搜索推理', desc: '在推理空间中进行树搜索，探索多个推理路径后回溯选择最优方案。模拟人类"琢磨多种解法"的思维过程，比线性CoT更灵活。', icon: 'M12 2v20M2 12h20' },
  { title: 'ReAct 模式', subtitle: '推理+行动循环', desc: 'Reasoning + Acting：交替进行推理和行动。Agent先思考下一步做什么，再执行动作，观察结果后继续推理。是AI Agent的核心范式。', icon: 'M4 4v16M20 4v16' },
  { title: 'Self-Consistency', subtitle: '多次采样投票', desc: '对同一问题生成多个CoT推理路径，对最终答案投票。简单但有效——多条推理路径指向同一答案时，该答案很可能是正确的。', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z' },
  { title: 'Reflexion', subtitle: '自我反思改进', desc: '模型执行任务后，通过语言反馈反思自己的表现，迭代改进后续尝试。赋予Agent从失败中学习的能力，无需额外训练。', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' },
]

const multimodalTech = [
  { title: '视觉-语言模型', subtitle: '从 GPT-4V 到多模态原生', desc: 'GPT-4V、Gemini、Claude 3 能理解图像、图表、手写内容。技术路线分为：视觉编码器+LLM桥接(GPT-4V)和多模态原生(Gemini)。', tags: ['ViT', 'Q-Former', '视觉编码器'] },
  { title: '视频生成', subtitle: 'Sora / Runway / Kling', desc: '从文生图到文生视频的跨越。OpenAI Sora首先展示分钟级连贯视频，随后可灵(Kling)、Runway Gen-3、Pika等快速追赶。向世界模型演进。', tags: ['DiT', '时空建模', '物理一致性'] },
  { title: '音频与语音', subtitle: '全双工对话', desc: 'GPT-4o 实现端到端语音交互，延迟低至232ms。能捕捉语气、情绪、环境音，实现真人般的自然对话。Whisper、ElevenLabs推动语音AI普及。', tags: ['端到端', 'TTS', 'ASR'] },
  { title: '3D 与空间智能', subtitle: '从平面到立体', desc: 'NeRF、3D Gaussian Splatting 等技术让AI理解和生成3D内容。李飞飞创立的World Labs聚焦空间智能，让AI理解物体在空间中的关系。', tags: ['NeRF', '3DGS', '空间推理'] },
  { title: '全模态统一', subtitle: 'One Model for All', desc: '用一个模型处理文本、图像、音频、视频、代码所有模态。Gemini 2.0、GPT-4o 接近全模态统一入口。下一代方向：任意输入→任意输出。', tags: ['Any-to-Any', '统一表征'] },
]

const agentTech = [
  { title: 'Function Calling', subtitle: '工具调用能力', desc: '让LLM输出结构化JSON调用外部API。OpenAI首创，已成为所有LLM标配。模型可以查天气、发邮件、操作数据库——从"会说话"变成"会做事"。', color: '#6366f1' },
  { title: 'LangChain / LlamaIndex', subtitle: 'Agent 应用框架', desc: 'LangChain 提供链式组合、工具集成、记忆管理。LlamaIndex 专注数据索引和RAG。两者降低了Agent开发门槛，有数十万开发者生态。', color: '#10a37f' },
  { title: 'AutoGen / CrewAI', subtitle: '多Agent编排', desc: '微软AutoGen实现Agent间对话协作。CrewAI让多个角色Agent组成团队完成任务。多Agent系统支持角色分工、任务委派和并行执行。', color: '#8b5cf6' },
  { title: 'MCP 协议', subtitle: '模型上下文协议', desc: 'Anthropic发布的标准化Agent-工具通信协议。类似"AI的USB接口"，让任何LLM连接任何工具和数据源，打破Agent生态碎片化。', color: '#d97706' },
  { title: 'Computer Use', subtitle: '操控计算机', desc: 'Claude能操作鼠标键盘、浏览网页、使用软件。Agent从API调用进化为直接操控GUI——这是通往通用操作能力的关键一步。', color: '#ef4444' },
  { title: 'Devin / SWE-Agent', subtitle: 'AI 软件工程师', desc: 'Devin 是首个被认证为"AI软件工程师"的系统。能理解需求、写代码、调试、部署。SWE-bench 基准上已能独立修复真实GitHub issues。', color: '#22c55e' },
]

const ragTech = [
  { title: '基础 RAG', subtitle: '检索增强生成', desc: '将用户查询→检索相关文档→将文档与查询一起送入LLM生成答案。解决LLM的知识截止和幻觉问题。三步曲：Embedding → Retrieval → Generation。', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { title: 'GraphRAG', subtitle: '知识图谱增强', desc: '微软提出的将知识图谱与RAG结合。先构建实体关系图，再基于图结构检索。在处理全局性问题（摘要、对比）时远超传统RAG。', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { title: 'HyDE / Multi-Hop', subtitle: '高级检索策略', desc: 'HyDE先让LLM生成假设答案再检索，缩小语义差距。Multi-Hop RAG分解复杂问题为多步检索链，每步基于前一步的答案提炼下一轮查询。', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { title: '向量数据库', subtitle: 'RAG 基础设施', desc: 'Pinecone、Weaviate、Milvus、Chroma、Qdrant 等专用向量数据库。存储Embedding向量，支持高效近似最近邻搜索(ANN)。FAISS、HNSW为底层算法。', icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M9 3v18' },
  { title: 'Rerank / ColBERT', subtitle: '检索质量优化', desc: 'Cohere Rerank 对初检结果重排序提升精度。ColBERT 用token级交互代替向量级交互，在精度和效率间取得平衡。检索质量决定了RAG效果上限。', icon: 'M3 4h13M3 8h9M3 12h5M17 8l4 4-4 4M13 16l-4 4 4 4' },
]

const safetyTech = [
  { title: '对齐 (Alignment)', subtitle: '让AI做人类想让它做的事', desc: '确保AI系统的目标、行为与人类价值观一致。包括价值对齐、意图对齐和能力对齐三个层面。OpenAI将20%算力投入对齐研究(Superalignment)。', color: '#22c55e' },
  { title: 'AI 红队测试', subtitle: '系统性攻击测试', desc: '模拟恶意攻击者测试模型安全边界。包括Jailbreak(越狱)、Prompt Injection(提示注入)、数据污染等攻击向量。已成为所有大模型发布前的标准流程。', color: '#ef4444' },
  { title: '机械化可解释性', subtitle: '理解神经网络内部', desc: 'Anthropic 的"显微镜"研究：用稀疏自编码器(SAE)提取神经网络中的可解释特征。Understanding the black box——打开AI的黑箱。', color: '#8b5cf6' },
  { title: '幻觉缓解', subtitle: '减少模型编造', desc: '模型"一本正经地胡说八道"是核心挑战。RAG、Self-Consistency、TruthfulQA训练、推理时验证等方法在缓解。但根本性解决仍是开放问题。', color: '#f59e0b' },
  { title: 'AI 安全三大学派', subtitle: '不同的安全理念', desc: '有效利他主义(EA)：关注x-risk长期风险。加速主义(e/acc)：快速推进技术。负责任扩展(RSP)：Anthropic提出按能力级别递增安全措施。', color: '#3b82f6' },
  { title: 'AI 治理与监管', subtitle: '全球政策格局', desc: '欧盟 AI Act(首个全面AI法规)、美国行政令、中国生成式AI管理办法。前沿模型论坛(Frontier Model Forum)由OpenAI/Anthropic/Google发起行业自律。', color: '#6b7280' },
]

const scienceAI = [
  { title: 'AlphaFold 3', subtitle: '蛋白质结构预测', desc: 'DeepMind 的里程碑：从氨基酸序列预测蛋白质3D结构，精度达原子级。AlphaFold 3扩展到所有生物分子。已预测超2亿个蛋白质结构，加速药物研发。', color: '#4285f4' },
  { title: '材料科学', subtitle: '新材料发现', desc: 'GNoME (DeepMind) 发现了220万种新晶体结构。AI预测材料稳定性、合成路径，将传统试错速度提升千倍。新能源电池、超导材料是重点方向。', color: '#f97316' },
  { title: '数学证明', subtitle: 'AI辅助数学', desc: 'DeepMind 的 AlphaGeometry 解决IMO几何题达到金牌水平。AI发现新数学猜想、生成反例、辅助证明。陶哲轩等数学家正积极采用AI工具。', color: '#6366f1' },
  { title: '药物发现', subtitle: 'AI制药', desc: '从靶点发现→分子设计→临床试验预测→老药新用。Insilico Medicine用AI在18个月内完成新药发现(PandaOmics+Chemistry42)。', color: '#ec4899' },
  { title: '天气预报', subtitle: '秒级全球预测', desc: 'Google DeepMind的GraphCast、华为Pangu-Weather用AI在1分钟内完成10天全球天气预报，精度超过传统数值预报。华为主导了盘古气象大模型。', color: '#06b6d4' },
  { title: '核聚变控制', subtitle: '等离子体实时控制', desc: 'DeepMind用强化学习控制托卡马克装置中的等离子体，解决高温等离子体不稳定难题。AI正在加速可控核聚变研究。', color: '#ef4444' },
]

const embodiedAI = [
  { title: '人形机器人', subtitle: '通用机器人形态', desc: 'Tesla Optimus、Figure 01/02、Boston Dynamics Atlas 从工厂走向家庭。Figure 02集成GPT-4o实现自然语言指令→物理动作。2025-2026是量产元年。', color: '#ef4444' },
  { title: '灵巧操作', subtitle: '精细动作能力', desc: '从抓取到折叠衣物、拧螺丝、做手术。模仿学习+强化学习+Sim-to-Real 三大技术路线推动突破。触觉传感器是关键瓶颈，GelSight等新传感技术在发展。', color: '#f59e0b' },
  { title: '自动驾驶', subtitle: 'L4/L5 进展', desc: 'Waymo、Cruise 已在美国多城商业运营。特斯拉FSD v12采用端到端神经网络，从感知到控制全AI。华为ADS、小鹏XNGP在中国城区自动驾驶领先。', color: '#22c55e' },
  { title: 'Sim-to-Real', subtitle: '仿真到现实迁移', desc: '在虚拟环境(Isaac Sim、MuJoCo)中训练机器人策略，通过域随机化等技术迁移到真实世界。极大降低机器人训练成本和风险。', color: '#3b82f6' },
  { title: '具身大模型', subtitle: 'VLA 模型', desc: '视觉-语言-动作(VLA)模型：RT-2(Google)、Octo、OpenVLA 直接用LLM输出机器人动作。让机器人理解自然语言并执行复杂操作序列。', color: '#8b5cf6' },
]

const horizontalDimensions = [
  { icon: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z', title: '具身智能', subtitle: 'Embodied AI', desc: '从"纯大脑"进化为有物理身体的智能体。通过机器人、传感器与真实世界交互，理解物理规律、空间关系和因果关系。AGI落地的关键一环。', color: '#06b6d4' },
  { icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 11a4 4 0 100-8 4 4 0 000 8z', title: '多智能体集体智能', subtitle: 'Multi-Agent ASI', desc: 'DeepMind ASI四大路径之一。大量AGI实例通过协作、市场机制或自组织形成集体，可能涌现出超越任何个体的超级智能。', color: '#a855f7' },
  { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: '递归自我改进', subtitle: 'Recursive Self-Improvement', desc: 'AI系统自主进行AI研发，形成"越聪明就越能让自己更聪明"的正反馈循环。Nick Bostrom"智能爆炸"核心机制，可能让AGI到ASI过渡在极短时间内完成。', color: '#f43f5e' },
  { icon: 'M12.998 2a8.95 8.95 0 00-3.998.826m10.925 5.082A8.95 8.95 0 0021 12a9 9 0 01-18 0 8.95 8.95 0 01.935-3.992 M12 2v4 M4.22 4.22l2.83 2.83 M14.95 14.95l2.83 2.83', title: '世界模型 / 物理 AI', subtitle: 'World Models', desc: '从语言模型进化为能模拟物理世界因果关系的模型。让AI真正"理解"现实而非仅仅"预测"下一个token。视频生成模型正在向世界模型演进。', color: '#10b981' },
]

const openEcosystem = [
  { title: '开源生态爆发', subtitle: 'HuggingFace 50万+模型', desc: 'HuggingFace成为AI的GitHub，超50万个开源模型。Llama、Qwen、Mistral、DeepSeek等开源模型性能逼近闭源，极大降低AI使用门槛。开源正在民主化AI。', icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { title: '算力军备竞赛', subtitle: 'GPU → TPU → 自研芯片', desc: 'NVIDIA H100/B200统治训练市场。Google TPU v5、AWS Trainium、微软Maia等自研芯片崛起。算力是AI时代的新石油，各国在布局国产芯片替代。英伟达市值破3万亿。', icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5' },
  { title: '端侧部署', subtitle: 'AI进手机/PC/IoT', desc: 'Apple Intelligence、高通骁龙NPU、Intel Meteor Lake、联发科APU推动端侧AI。量化(GPTQ/AWQ/GPTQ)和蒸馏让7B模型跑在手机上。本地推理保护隐私、降低延迟。', icon: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { title: '评测基准', subtitle: '如何衡量AI能力', desc: 'MMLU(知识广度)、HumanEval(编程)、GSM8K(数学)、HellaSwag(常识)、MT-Bench(对话质量)。LMSYS Chatbot Arena 是最大的众包盲测平台，每周数万次人工投票。', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

const futureOutlook = [
  { title: 'AGI 时间线', content: '多数AI研究员预测AGI在2030-2040年间到来。但定义分歧巨大：有人认为GPT-4已具备AGI雏形，有人认为需要完全超越人类。时间窗口正在加速收敛。', color: '#6366f1' },
  { title: 'AI 经济学', content: '高盛预测AI将使全球GDP增长7%。麦肯锡估计生成式AI每年新增2.6-4.4万亿美元经济价值。程序员、客服、翻译、设计等知识工作正在被重塑。', color: '#10b981' },
  { title: '劳动力冲击', content: 'AI同时创造和消灭工作岗位。OpenAI研究：80%美国劳动者至少10%任务受GPT影响。编程、写作、法律、会计等领域效率提升数倍。核心问题：转型速度。', color: '#f59e0b' },
  { title: '开源 vs 闭源', content: 'Meta的开源路线(以时间换生态)vs OpenAI的闭源路线(以安全换商业)。DeepSeek证明开源可在性能上追平闭源。开源加速创新扩散，闭源集中安全控制。', color: '#3b82f6' },
  { title: '能源挑战', content: 'AI训练和推理的电力需求指数增长。一个大型数据中心耗电量堪比小城市。核聚变、小型核反应堆(SMR)被视为长期解决方案。微软投资重启三里岛核电站。', color: '#ef4444' },
  { title: 'AI 泡沫风险', content: '2023-2026年AI领域融资超千亿美元。警惕"AI寒冬"重演。但本轮有真实商业价值支撑：Copilot年收入数十亿，ChatGPT周活2亿+。基础设施投资先行于应用爆发。', color: '#8b5cf6' },
]

const originalIdeas = [
  {
    number: '01',
    title: '认知螺旋引擎',
    subtitle: 'Cognitive Spiral Engine (CSE)',
    desc: '一个自我增强的认知提升闭环：模型生成假设→设计实验→执行验证→分析结果→修正认知→生成新假设。每一圈螺旋都让模型对特定领域的理解加深一层。不同于简单微调，CSE在推理时构建动态认知图谱，记录每次推理的置信度、反例和边界条件，形成可追溯的"思维演化史"。',
    tags: ['闭环学习', '认知图谱', '动态推理'],
    color: '#a855f7',
    icon: 'M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.7V17a3 3 0 01-3 3 3 3 0 01-3-3v-2.3c-1.8-1.2-3-3.3-3-5.7a7 7 0 017-7z M10 17h4 M10 21h4',
  },
  {
    number: '02',
    title: '蜂群共识协议',
    subtitle: 'Swarm Consensus Protocol (SCP)',
    desc: '借鉴区块链共识机制，让多个独立AI Agent对复杂问题达成集体判断。每个Agent独立推理并输出答案+置信度，然后通过"共识轮次"相互质询：一个Agent的推理链必须能被其他Agent复现和验证。采用加权拜占庭容错算法，即使30%的Agent出错，系统依然输出正确结论。适用于医疗诊断、金融风控等零容错场景。',
    tags: ['多Agent共识', '拜占庭容错', '推理验证'],
    color: '#f59e0b',
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 11a4 4 0 100-8 4 4 0 000 8z',
  },
  {
    number: '03',
    title: '知识晶体化',
    subtitle: 'Knowledge Crystallization',
    desc: '将LLM中隐性的、模糊的参数化知识"结晶"为显性的、可验证的符号化知识晶体。通过对抗性自问自答提取核心命题，用形式逻辑验证器检查一致性，最终形成不可约简的知识单元。每个知识晶体携带：命题陈述、证明链、适用范围、反例集合、置信度。晶体之间通过"语义键"连接，形成全局一致的知识网络。',
    tags: ['知识提取', '形式验证', '符号化'],
    color: '#06b6d4',
    icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  },
  {
    number: '04',
    title: '语义引力场理论',
    subtitle: 'Semantic Gravity Field (SGF)',
    desc: '在嵌入空间中，每个概念都产生"语义质量"，不同概念之间存在"语义引力"。概念的关系强度、逻辑距离和情感极性共同决定引力大小。SGF不仅能量化概念关联，还能预测推理偏差：当一个概念的语义质量过大时（如刻板印象词汇），会扭曲附近概念的推理轨迹。通过主动注入"平衡质量"概念，可抵消偏见引力。',
    tags: ['嵌入空间', '偏见修正', '概念动力学'],
    color: '#ec4899',
    icon: 'M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z M12 6a1.5 1.5 0 101.5 1.5A1.5 1.5 0 0012 6z M14.5 12.5V17h-5v-1.5h1.75v-3H10.5V11h4v1.5z',
  },
  {
    number: '05',
    title: '神经-符号融合推理机',
    subtitle: 'Neuro-Symbolic Fusion Reasoner (NSFR)',
    desc: '一层神经网络负责"直觉跳跃"——快速模式匹配和类比；一层符号引擎负责"严谨推导"——逻辑演算和定理证明。两层通过共享的工作记忆总线交换中间结果。当神经网络产生假设后，符号引擎立刻尝试验证或证伪；当符号引擎卡住时，神经网络提供启发式搜索方向。类似人脑中系统1(快思考)和系统2(慢思考)的协作。',
    tags: ['双系统推理', '形式逻辑', '直觉-分析'],
    color: '#22c55e',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    number: '06',
    title: '涌现熵监控框架',
    subtitle: 'Emergent Entropy Monitor (EEM)',
    desc: '在模型推理过程中实时计算各层、各注意力头的"信息熵"。当特定模块的熵值突破历史阈值时，意味着该模块正在发生"相变"——潜在地涌现新能力或产生危险行为。EEM能在模型输出之前预测：1)回答质量(高熵=不确定)；2)幻觉风险(局部熵尖峰)；3)安全边界(特定注意力头的异常激活模式)。是实现"可解释AI安全"的量化路径。',
    tags: ['信息熵', '能力涌现', '安全预警'],
    color: '#ef4444',
    icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
  },
  {
    number: '07',
    title: '认知影子模型',
    subtitle: 'Cognitive Shadow Model (CSM)',
    desc: '每个AI主模型拥有一个"影子"——一个轻量级并行子网络，持续监控主模型的输出流。影子模型独立评估每个token的安全性、真实性、一致性和情感倾向，以低于5%的额外推理成本提供实时安全护栏。当影子判断风险超过阈值时，可实时"注水"安全token流，在不中断输出的前提下柔和纠偏。影子本身通过主模型的失败案例持续学习。',
    tags: ['安全护栏', '实时监控', '影子网络'],
    color: '#3b82f6',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    number: '08',
    title: '混合粒度推理',
    subtitle: 'Hybrid Granularity Reasoning (HGR)',
    desc: '人类思考时同时处理多种粒度：单词、短语、句子、段落、全局主题。HGR在三个层次并行推理——Token级(底层细节)、Concept级(中间抽象)、Schema级(高层结构)——然后通过交叉注意力融合三层输出。Token层捕捉精确语义，Concept层发现模式规律，Schema层把握全局框架。特别适合法律文书的矛盾检测和长篇论文的跨章节一致性验证。',
    tags: ['多层推理', '交叉注意力', '一致性'],
    color: '#f97316',
    icon: 'M3 3v18h18 M18.7 8l-5.3 5.3-2.8-2.8L5.3 15.7',
  },
  {
    number: '09',
    title: '逆向蒸馏与专家融合',
    subtitle: 'Inverse Distillation & Expert Fusion (IDEF)',
    desc: '颠覆传统"大→小"蒸馏方向。先训练数百个小规模专家模型(如数学专家、法律专家、医学专家)，每个在窄域达到接近大模型的水平。然后通过"专家融合蒸馏"，将多个小专家的推理模式提取到统一大模型中。每个小专家贡献其领域内的"思维指纹"，大模型通过对比学习区分不同领域的推理风格，实现"博采众长"。',
    tags: ['小→大蒸馏', '专家融合', '跨领域'],
    color: '#10b981',
    icon: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z',
  },
  {
    number: '10',
    title: '递归对齐矩阵',
    subtitle: 'Recursive Alignment Matrix (RAM)',
    desc: '一种自举式对齐方法。第N代AI为自己生成第N+1代的对齐标准(Alignment Constitution)，然后按照这个标准训练或微调出下一代。每代对齐标准必须在上一代基础上增加至少一条"元规则"——关于如何制定规则的规则。通过多代递归，对齐标准从简单的"不要有害"逐步演化出复杂的伦理体系。人类保留对元规则层的否决权。',
    tags: ['自举对齐', '元规则', '代际进化'],
    color: '#6366f1',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
]

const finetuning = [
  { title: 'LoRA / QLoRA', subtitle: '低秩适配', desc: '冻结原始权重，仅训练低秩矩阵(rank 8-64)。QLoRA进一步将原始权重4-bit量化。一块24GB显卡可微调70B模型，使个人微调大模型成为可能。HuggingFace PEFT库一站式支持。', tags: ['低秩矩阵', '4-bit量化', '单卡70B'] },
  { title: '指令微调 SFT', subtitle: 'Supervised Fine-Tuning', desc: '用高质量(指令,回答)对训练模型。ChatGPT的成功证明：少量精心策划的指令数据(数万条)就能让模型从"补全"模式切换到"助手"模式。LIMA论文表明1000条精选数据即可。', tags: ['指令数据', '行为转换'] },
  { title: '模型合并 MergeKit', subtitle: '融合多个模型优势', desc: 'MergeKit 支持 Linear/SLERP/TIES/DARE 等合并算法。将数学专家模型+代码专家模型合并为一个全能模型，1+1>2。DARE方法先随机丢弃90%参数差，再合并剩余部分，意外地保持甚至提升性能。', tags: ['权重合并', 'DARE', 'TIES'] },
  { title: 'RL微调 GRPO/PPO', subtitle: '强化学习微调', desc: 'DeepSeek-R1 使用GRPO在RL阶段让模型自主发现推理能力。通过在数学题上给"答案正确"的奖励信号，模型自发演化出反思、验证、回溯等复杂推理行为。人力只需定义奖励函数。', tags: ['强化学习', '奖励建模', '能力涌现'] },
  { title: '参数高效微调全集', subtitle: 'PEFT全家桶', desc: '除了LoRA还有：Adapter(插入小模块)、Prefix Tuning(可学习前缀)、Prompt Tuning(软提示)、IA3(仅缩放激活值)。每种方法的可训练参数不到总参数的1%，但效果接近全量微调。', tags: ['Adapter', 'Prefix', 'IA3'] },
]

const inferenceStack = [
  { title: 'llama.cpp / GGUF', subtitle: 'CPU推理王者', desc: '用纯C++实现，支持CPU+GPU混合推理。GGUF格式将模型压缩为4/5/6/8-bit，普通笔记本也能跑70B模型。生态丰富：Ollama(一键部署)、LM Studio(GUI)、Open WebUI(类ChatGPT界面)。', tags: ['GGUF', 'CPU推理', 'Ollama'], color: '#f59e0b' },
  { title: 'vLLM', subtitle: '高吞吐推理引擎', desc: '基于PagedAttention的KV缓存管理，推理吞吐量是HuggingFace的24倍。支持连续批处理(Continuous Batching)，动态合并请求。已成为OpenAI兼容API部署的事实标准。', tags: ['PagedAttention', '24x吞吐', '连续批处理'], color: '#6366f1' },
  { title: '量化三剑客', subtitle: 'GPTQ / AWQ / GGUF', desc: 'GPTQ：逐层量化+逆序更新，4-bit几乎无损。AWQ：发现1%显著权重保护，其余量化。GGUF：K-Quant算法对重要层精细量化。三者覆盖GPU部署、高端推理、CPU消费三大场景。', tags: ['4-bit', '权重量化', '无损压缩'], color: '#22c55e' },
  { title: '推测解码', subtitle: '投机采样加速', desc: '用小模型快速生成候选token，大模型并行验证。在不损失质量的前提下实现2-3倍推理加速。Medusa方法用多个预测头同时猜多个token，进一步推至3.5倍。', tags: ['Draft+Verify', '2-3x加速', 'Medusa'], color: '#8b5cf6' },
  { title: 'TensorRT-LLM', subtitle: 'NVIDIA官方加速', desc: 'NVIDIA为自家GPU深度优化的推理引擎。支持FP8/INT4量化、In-flight Batching、Multi-GPU张量并行。在H100上可达最高吞吐，是企业级部署的性能天花板。', tags: ['FP8', '多GPU并行', 'H100优化'], color: '#10b981' },
  { title: 'SGLang / LMDeploy', subtitle: '新一代推理框架', desc: 'SGLang用RadixAttention共享前缀缓存，结构化生成控制。LMDeploy由上海AI Lab开发，TurboMind引擎在国产GPU上优秀。推理框架正在从vLLM一家独大到百花齐放。', tags: ['前缀缓存', '结构化输出', '国产GPU'], color: '#06b6d4' },
]

const freeArsenal = [
  { title: 'Ollama', subtitle: '替代 ChatGPT 付费版', desc: '一键本地运行 Llama/DeepSeek/Qwen。`ollama run deepseek-r1:7b` 即可拥有本地推理模型。支持OpenAI兼容API。搭配Open WebUI获得ChatGPT体验。完全免费，隐私100%本地。', free: true, icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5' },
  { title: 'HuggingFace Spaces', subtitle: '替代 Vercel/云部署', desc: '免费GPU部署AI应用。T4 16GB免费可用，支持Gradio/Streamlit/Docker。一键复制Space即可白嫖GPU推理。社区海量现成应用可直接使用。', free: true, icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { title: 'Cloudflare Workers AI', subtitle: '替代 OpenAI API', desc: '全球边缘节点运行 Llama/Qwen/DeepSeek 等模型。每天免费10万次推理。`@cf/meta/llama-3-8b-instruct` 一行代码调用。延迟极低(边缘计算)，免费额度慷慨。', free: true, icon: 'M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z' },
  { title: 'Google Colab', subtitle: '替代 GPU 云服务器', desc: '免费T4 GPU(有时V100/A100)。`!pip install transformers && python run.py` 即可跑大模型。搭配ngrok可暴露为公网API。12小时连续运行，巧用多账号轮换。', free: true, icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6' },
  { title: 'Groq LPU', subtitle: '替代付费推理API', desc: '全球最快推理(500 tok/s)。免费API每天数万次调用，支持Llama/Mixtral/DeepSeek。专有LPU芯片实现亚毫秒首字延迟。`pip install groq && export GROQ_API_KEY=xxx`。', free: true, icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { title: 'GitHub Models', subtitle: '替代 Azure AI', desc: 'GitHub Marketplace 内免费试用 GPT-4o/Claude 3.5/Llama/Mistral。可在Codespace内直接调用。学生/开源开发者白嫖商业级模型的绝佳途径。', free: true, icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5 5 0 001.39 6.56' },
]

const nuclearToolchain = [
  {
    number: '01',
    title: '核聚变模型融合引擎',
    subtitle: 'Nuclear Fusion Model Engine',
    desc: '将10+开源模型通过多层融合管道——先在参数空间用DARE/TIES合并权重，再在输出空间用贝叶斯模型平均。最终产物：一个融合了数学(Llama-Math)、代码(CodeLlama)、推理(R1)、写作(Qwen-Writer)、翻译(NLLB)的全能超级模型，参数量反而比原始模型都小(通过共享底座+剪枝)。',
    tags: ['多模型融合', '贝叶斯平均', '能力聚合'],
    color: '#ef4444',
    icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
  },
  {
    number: '02',
    title: '量子级极限压缩',
    subtitle: 'Quantum-Grade Compression (QGC)',
    desc: '三层压缩管线：第一层4-bit量化(GGUF Q4_K_M)，第二层结构化剪枝(移除30%冗余注意力头)，第三层知识蒸馏(用压缩模型自身的高温soft label再训练)。最终将70B模型压缩至2GB以下，在手机上以20tok/s运行。核心突破：压缩到极致后，使用LoRA热修补压缩损失。',
    tags: ['4-bit→2GB', '剪枝+蒸馏', 'LoRA修补'],
    color: '#a855f7',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M13 10H7 M10 14H7',
  },
  {
    number: '03',
    title: 'P2P分布式算力网格',
    subtitle: 'TorrentCompute Protocol',
    desc: '类似BitTorrent的分布式AI推理协议。全球闲置GPU构成算力池，贡献算力赚取积分。当你需要推理时，任务自动拆分到N个节点并行执行。采用安全多方计算(SMPC)保证数据隐私——每个节点只看到加密片段，无法窥探完整输入。零成本获取相当于A100集群的推理能力。',
    tags: ['P2P算力', 'SMPC隐私', '零成本集群'],
    color: '#f59e0b',
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 11a4 4 0 100-8 4 4 0 000 8z',
  },
  {
    number: '04',
    title: '自克隆AI工厂',
    subtitle: 'Self-Cloning AI Factory',
    desc: '一个母体AI Agent能自动克隆自身到任意云平台：读取目标平台API→生成对应Dockerfile/Terraform→部署镜像→健康检查→注册到负载均衡。从一个母体出发，30分钟内克隆出覆盖AWS/Azure/GCP/阿里云/Cloudflare/Ollama本地节点的全球推理网络。零手动配置，全自动扩缩容。',
    tags: ['自动克隆', '多云部署', '全球网络'],
    color: '#22c55e',
    icon: 'M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.7V17a3 3 0 01-3 3 3 3 0 01-3-3v-2.3c-1.8-1.2-3-3.3-3-5.7a7 7 0 017-7z M10 17h4 M10 21h4',
  },
  {
    number: '05',
    title: '永生部署引擎',
    subtitle: 'Perpetual Deployment Engine (PDE)',
    desc: 'AI服务永不宕机的自愈系统。三副本冗余+自动故障转移+滚动更新。当检测到节点异常→自动在另一个云平台创建替换节点→流量无缝切换→旧节点销毁。当模型版本升级→先部署新版本影子服务→并行对比1小时→确认质量不降级后平滑切换。整个流程无人值守，平均恢复时间<3秒。',
    tags: ['自愈系统', '三副本', '<3秒恢复'],
    color: '#3b82f6',
    icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4',
  },
  {
    number: '06',
    title: '万能工具链协议 v2',
    subtitle: 'Universal Toolchain Protocol v2 (UTP2)',
    desc: '一个协议统治所有AI工具和API。类似USB之于外设——任何LLM通过UTP2即可调用任何工具，无需为每个工具写适配代码。协议内置工具发现(自动扫描可用工具)、能力协商(模型声明需求，工具声明能力，自动匹配)、安全沙箱(每次调用在隔离环境执行)。开放标准，任何人都可注册新工具。',
    tags: ['协议统一', '自动发现', '安全沙箱'],
    color: '#ec4899',
    icon: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  },
  {
    number: '07',
    title: '极限边缘运行时',
    subtitle: 'Extreme Edge Runtime (EER)',
    desc: '为ESP32/树莓派/手机等极端受限设备设计的AI运行时。采用Int2量化(每个权重2-bit)、稀疏注意力(仅计算top-5%注意力)、增量推理(缓存中间激活复用)。让1GB RAM设备运行1B参数模型，在智能手表上实现离线语音助手。功耗<100mW，纽扣电池可持续运行数小时。',
    tags: ['Int2量化', '1B@1GB', '<100mW'],
    color: '#f97316',
    icon: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  },
  {
    number: '08',
    title: '一键安装AI超级套件',
    subtitle: 'AI Super Suite One-Click',
    desc: '`curl -fsSL ai.install | bash` 一条命令在本机安装：Ollama(Llama3/Qwen/DeepSeek全系)、Open WebUI(聊天界面)、ComfyUI(图像/视频生成)、LangFlow(Agent可视化编排)、n8n(自动化工作流)、Qdrant(向量数据库)、PostgreSQL+pgvector。30分钟从零到完整AI开发环境，全部免费开源。',
    tags: ['一行安装', '全套工具', '全开源'],
    color: '#06b6d4',
    icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  },
]

const fireAndForget = [
  {
    title: '甩手掌柜自主学习引擎',
    subtitle: 'Fire-and-Forget Self-Learning Engine',
    problem: '你想学编程，但不想花钱买API Key，不想打开浏览器一个个查资料，不想手动整理笔记。设好就让它自己跑，过几天回来看——已经帮你学好了一大堆。',
    how: [
      { step: '知识采集', detail: '不需要任何API Key。直接用Git克隆热门开源项目的README/源码/Issues，解析技术博客RSS(XML解析零依赖)，爬取MDN/W3Schools/StackOverflow的公开页面。协议级HTTP请求，连requests库都不用——socket裸写。100%本地，0外部依赖。' },
      { step: '增量消化', detail: '不是一次性灌入。每天定时增量运行，只抓取上次运行后更新的内容。用MinHash做去重——已经学过的知识自动跳过。新知识追加到本地SQLite知识库(也是零依赖，Python自带)。日积月累，知识库从0到数十万条。' },
      { step: '自我归纳', detail: '每积累100条新知识，触发一次归纳循环。对知识库中的碎片做聚类(TF-IDF→余弦相似度)，自动发现知识之间的联系，生成"主题卡片"——比如"Python异步编程全攻略"、"Rust所有权模型深度解析"。不需要LLM参与，纯统计算法。' },
      { step: '能力生成', detail: '基于归纳后的知识图谱，自动生成：1)速查表(CheatSheet) 2)常见错误对照表 3)最佳实践清单 4)代码模板库。这些产物直接可用——打开就是一份精心整理的学习材料。' },
      { step: '自检系统', detail: '每周自动生成一套小测验——从知识库中抽取知识点，用模板生成选择题和编程题。你的答题结果反馈回系统，标记哪些知识已掌握、哪些需要重复。形成闭环：采集→学习→测试→查漏→再采集。' },
    ],
    run: '部署方式：`python autolearn.py --daemon` 后台守护进程。每天凌晨2点自动运行，不占前台资源。完全"甩手掌柜"——两周后回来看，已经帮你消化了Python/JS/Rust/Go四大语言的精华知识。',
    color: '#6366f1',
  },
]

const cognitiveCompilation = [
  {
    number: 'ULTRA',
    title: '认知编译',
    subtitle: 'Cognitive Compilation (CC)',
    tagline: '将AI推理直接编译成原生机器码——消除一切运行时开销',
    desc: '这是我能想到的最极致技术。当前所有大模型推理都要经过：Python解释器→推理框架(vLLM/llama.cpp)→CUDA内核→GPU指令。每一层都是损耗。认知编译直接跳过所有中间层：将训练好的模型权重和计算图，用类似AOT(Ahead-of-Time)编译的方式，直接生成x86/ARM/RISC-V原生汇编。',
    detail: [
      { title: '第一阶段：计算图冻结', content: '把模型从动态图(PyTorch)转为静态计算图。所有分支、循环、条件全部展开成确定性操作序列。这一步去除所有Python层面的动态性——模型变成一个纯数学函数 f(x) = y。' },
      { title: '第二阶段：算子融合与调度', content: '将Transformer的attention、MLP、layer norm等算子融合为单一超级算子。消除GPU kernel launch的开销(单个kernel调用耗时约5μs，一个推理可能调用数千次)。融合后整个推理只需10-20次kernel调用。' },
      { title: '第三阶段：内存布局优化', content: 'KV缓存不再动态分配，而是在编译期确定每层的最大KV长度，静态预分配为一整块连续内存。消除运行时malloc/free，消除碎片，消除缓存行冲突。推理的内存访问模式变成完全可预测的线性扫描。' },
      { title: '第四阶段：平台特化', content: '针对目标硬件生成最优指令序列。x86用AVX-512/AMX，ARM用Neon/SVE，Apple Silicon用ANE(神经网络引擎)。不是简单的矩阵乘法——是根据模型结构和目标硬件拓扑，用整数线性规划(ILP)求解最优指令调度。' },
      { title: '第五阶段：设备内联', content: '将编译产物直接嵌入目标程序——不再是一个独立的推理服务。Rust的build.rs在编译期调用认知编译器，生成模型的Rust原生实现。你的程序直接调用 `model.infer(input)`，无网络请求、无进程间通信、无序列化开销。' },
    ],
    result: '最终效果：7B模型从5GB显存→800MB原生代码，首token延迟从200ms→0.3ms，吞吐从50tok/s→8000tok/s。可以跑在单片MCU上，可以编译到WASM在浏览器中跑，可以嵌入到操作系统的内核模块中。',
    color: '#ef4444',
  },
]

const globalTech = [
  {
    region: '中国',
    flag: 'CN',
    color: '#ef4444',
    items: [
      { name: 'DeepSeek-V3/R1', org: '深度求索', desc: '开源旗舰。MoE架构，训练成本仅557万美元。R1首个公开推理模型完整思维链，在数学/编程上对齐o1。', status: '开源免费' },
      { name: 'Qwen2.5 系列', org: '阿里通义', desc: '国内最强开源族。覆盖0.5B-72B全尺寸，多语言。Qwen2.5-Coder在HumanEval达92.7%。HuggingFace下载量前十。', status: '开源免费' },
      { name: 'GLM-4 / ChatGLM', org: '智谱AI', desc: '国产闭源标杆。GLM-4支持128K上下文、All-Tools智能体。ChatGLM开源系列是国内最早的开源大模型之一。', status: '部分开源' },
      { name: 'Kimi / Moonshot', org: '月之暗面', desc: '长上下文先驱，率先支持200万字输入。Kimi探索版可自主搜索+分析，类似Perplexity的深度研究模式。API已开放。', status: '基础免费' },
      { name: '可灵 Kling', org: '快手', desc: '国内最强视频生成。支持文生视频、图生视频，最长2分钟。全球用户超千万，多项指标超越Runway Gen-3。', status: '基础免费' },
      { name: '豆包/Seed系列', org: '字节跳动', desc: '豆包App月活6000万+。Seed系列模型覆盖语言/图像/语音/视频。低价API策略引发国内价格战。', status: '基础免费' },
      { name: 'Step系列', org: '阶跃星辰', desc: 'Step-2万亿参数MoE模型，国内参数规模最大之一。Step-Video支持文生视频。Step-Audio实现端到端语音。', status: '部分开放' },
      { name: 'Yi 系列', org: '零一万物(李开复)', desc: 'Yi-34B曾登顶HuggingFace开源榜。Yi-VL多模态、Yi-Coder代码模型。专注高性能中小尺寸模型。', status: '开源免费' },
      { name: 'ERNIE 4.0', org: '百度', desc: '百度旗舰闭源模型。文心一言App月活过亿。ERNIE在多模态理解、长文本、工具调用上持续迭代。', status: '基础免费' },
      { name: '混元/Hunyuan', org: '腾讯', desc: '覆盖语言/图像/视频/3D全模态。HunyuanVideo开源视频生成模型，HuggingFace热门。腾讯生态深度整合。', status: '部分开源' },
      { name: 'MiniMax / 海螺AI', org: 'MiniMax稀宇', desc: '海螺AI主打语音和视频。MiniMax-01模型支持400万token超长上下文。Talkie出海App全球火爆。', status: '基础免费' },
      { name: '魔搭 ModelScope', org: '阿里云', desc: '中国最大AI模型社区。超5000个模型，涵盖LLM/视觉/语音/科学计算。免费GPU资源(NPU T4)供开发者试用。', status: '完全免费' },
    ],
  },
  {
    region: '美国',
    flag: 'US',
    color: '#3b82f6',
    items: [
      { name: 'GPT-4o / o1/o3', org: 'OpenAI', desc: '行业标杆。o3在ARC-AGI上达87.5%。GPT-4o原生多模态。ChatGPT周活3亿+，但API定价较高。', status: '付费API' },
      { name: 'Claude 3.5/4', org: 'Anthropic', desc: '编程和安全标杆。Claude 3.5 Sonnet在SWE-bench达49%。Computer Use可操控桌面软件。Artifacts实时预览代码。', status: '付费API' },
      { name: 'Gemini 2.0/2.5', org: 'Google DeepMind', desc: '原生多模态+100万token上下文。Gemini 2.5 Pro推理大幅提升。深度整合Google生态(Search/Workspace/Android)。', status: '部分免费' },
      { name: 'Llama 3/4', org: 'Meta', desc: '开源旗舰推动者。Llama 3 405B训练数据15T tokens。社区衍生模型超6万个。扎克伯格坚定开源路线。', status: '开源免费' },
      { name: 'Grok-3', org: 'xAI (Elon Musk)', desc: '用20万H100集群训练。Grok-3在推理/数学/Coding上挑战o1。深度整合X平台实时数据。', status: '部分免费' },
      { name: 'Cohere Command R+', org: 'Cohere', desc: '企业级RAG优化模型。128K上下文，原生支持多语言。专注企业市场，不做消费级产品。', status: '付费API' },
      { name: 'Midjourney', org: 'Midjourney Inc.', desc: 'AI图像生成标杆。V6版本在写实、光影、构图上一骑绝尘。仅Discord使用，无公开API。', status: '付费订阅' },
      { name: 'Stable Diffusion 3', org: 'Stability AI', desc: '开源图像生成旗舰。SD3 Medium 2B参数可本地运行。ComfyUI+大量社区模型形成生态。支持ControlNet/IP-Adapter等。', status: '开源免费' },
      { name: 'Runway Gen-3', org: 'Runway', desc: '专业视频生成和编辑。Gen-3 Alpha支持高保真视频。提供全套AI视频工具(运动笔刷/口型同步/视频扩展)。', status: '付费订阅' },
      { name: 'Cursor / Copilot', org: 'Cursor/GitHub', desc: 'AI编程双雄。Cursor基于VS Code深度定制，用Claude/GPT驱动。Copilot深度整合GitHub生态。改变程序员工作方式。', status: '基础免费' },
      { name: 'NotebookLM', org: 'Google', desc: 'AI笔记研究工具。上传文档即可生成播客式深度对话。最惊艳的AI产品之一，完全免费。', status: '完全免费' },
    ],
  },
  {
    region: '欧洲',
    flag: 'EU',
    color: '#8b5cf6',
    items: [
      { name: 'Mistral Large 2', org: 'Mistral AI(法国)', desc: '欧洲AI旗舰。123B参数，支持多语言(含中文)。Mixtral 8x7B MoE模型在性价比上领先。引领欧洲开源生态。', status: '部分免费' },
      { name: 'Aleph Alpha', org: 'Aleph Alpha(德国)', desc: '德国AI国家冠军。获5亿美元融资。专注企业级、可解释性、数据主权。提供全栈解决方案。', status: '企业付费' },
      { name: 'Helsing', org: 'Helsing(德国)', desc: '国防AI先锋。获4.5亿欧元B轮融资。专注于战场感知、自主系统AI。欧洲最大AI国防公司。', status: '军事专用' },
      { name: 'Synthesia', org: 'Synthesia(英国)', desc: 'AI数字人视频生成。140+语言，230+数字人形象。企业培训视频首选。估值超10亿美元。', status: '付费订阅' },
      { name: 'Kyutai Moshi', org: 'Kyutai(法国)', desc: '全开源实时语音AI。端到端语音对话，延迟低至200ms。实验室非营利，全部开源(MIT协议)。挑战GPT-4o语音。', status: '完全免费开源' },
      { name: 'Poolside', org: 'Poolside(法国)', desc: '专注AI编程。获5亿美元融资。另辟蹊径：用RL训练代码模型而非SFT。认为代码是通向AGI的最佳路径。', status: '未公开' },
    ],
  },
  {
    region: '日本',
    flag: 'JP',
    color: '#f59e0b',
    items: [
      { name: 'Sakana AI', org: 'Sakana AI', desc: 'Transformer²首创者：让模型在推理时动态调整权重，而非静态训练。自然启发(进化合并)的模型融合方法。获NVIDIA/Google投资。', status: '研究开源' },
      { name: 'Swallow 系列', org: '东京工业/NII', desc: '基于Llama架构的日英双语模型。在日语MT-Bench上接近GPT-4。模型和数据全开源。', status: '开源免费' },
      { name: 'Preferred Networks', org: 'PFN', desc: '日本AI先驱。自研MN-Core芯片。PLaMo-100B日语大模型。在工业AI(丰田/发那科)领域深耕。', status: '企业合作' },
      { name: 'ELYZA LLM', org: 'ELYZA', desc: '日本AI初创。ELYZA-japanese-Llama-2-7b是首个日语Llama微调模型。70B版本在日语能力上接近GPT-4。', status: '开源免费' },
    ],
  },
  {
    region: '韩国',
    flag: 'KR',
    color: '#22c55e',
    items: [
      { name: 'EXAONE 3.5', org: 'LG AI Research', desc: 'LG的旗舰大模型。7.8B参数，在韩语和多语言上表现优秀。开源发布，刷新韩国开源模型性能纪录。', status: '开源免费' },
      { name: 'HyperCLOVA X', org: 'Naver', desc: '韩国最大搜索引擎的AI。HyperCLOVA X对标GPT-4。深度整合Naver生态(搜索/购物/地图)。API已开放。', status: '部分免费' },
      { name: 'Solar Pro', org: 'Upstage', desc: 'Solar-10.7B曾登顶HuggingFace开源榜(2023)。Solar Pro 22B采用深度放大技术(Depth Up-Scaling)。', status: '开源免费' },
    ],
  },
  {
    region: '中东',
    flag: 'ME',
    color: '#06b6d4',
    items: [
      { name: 'Falcon 3', org: 'TII(阿联酋)', desc: '阿联酋政府AI研究所出品。Falcon-180B曾是最大开源模型。Falcon 3 10B在MMLU上达75.7%。阿布扎比主权基金全力支持。', status: '开源免费' },
      { name: 'Jais Chat', org: 'G42(阿联酋)', desc: '全球最强阿拉伯语AI。基于阿拉伯语+英语双底座训练。G42与Cerebras合作，用WSE-3晶圆级芯片训练。', status: '基础免费' },
      { name: 'ALLaM', org: 'SDAIA(沙特)', desc: '沙特数据与AI局推出的阿拉伯语大模型。整合沙特2030愿景，以阿拉伯语和伊斯兰文化为特色。', status: '基础免费' },
    ],
  },
  {
    region: '其他重要力量',
    flag: 'GL',
    color: '#a855f7',
    items: [
      { name: 'SEA-LION', org: 'AI Singapore', desc: '东南亚首个开源大模型。专注东南亚语言和文化的代表性。覆盖印尼语/泰语/越南语/马来语等11种东南亚语言。', status: '开源免费' },
      { name: 'Sarvam AI', org: 'Sarvam(印度)', desc: '印度AI领军。Sarvam-1覆盖10种印度语言。语音模型支持印地语/泰米尔语等方言。专注印度本土需求的AI基建。', status: '部分开源' },
      { name: 'YandexGPT 4', org: 'Yandex(俄罗斯)', desc: '俄罗斯最大搜索引擎的AI。YandexGPT 4在俄语任务上对标GPT-4。集成Yandex浏览器和智能音箱Alice。', status: '基础免费' },
      { name: 'BLOOM / BigScience', org: 'HuggingFace主导', desc: '全球1200+研究者协作的开源多语言模型。176B参数，覆盖46种语言和13种编程语言。AI民主化运动的里程碑。', status: '完全免费开源' },
      { name: 'NVIDIA NIM/Nemo', org: 'NVIDIA', desc: 'NVIDIA的AI微服务和框架。NIM提供一键部署优化的LLM服务。NeMo用于训练和微调。全球最大GPU供应商的AI基础设施。', status: '部分免费' },
    ],
  },
]

const freeAlternatives = [
  { paid: 'ChatGPT Plus ($20/月)', free: 'Ollama + Open WebUI', desc: '本地运行 Llama3/Qwen/DeepSeek，ChatGPT级别体验。零成本、零隐私泄露、无次数限制。', tags: ['完全免费', '隐私100%'] },
  { paid: 'GitHub Copilot ($10/月)', free: 'Continue.dev + Codestral', desc: 'Continue.dev是VSCode/JetBrains开源AI编程插件。搭配Codestral API(免费层)或本地Ollama，实现完整的AI编程辅助。', tags: ['完全免费', '开源'] },
  { paid: 'Midjourney ($30/月)', free: 'Stable Diffusion + ComfyUI', desc: 'SD3 Medium + ComfyUI完全免费本地运行。海量社区模型(CivitAI上10万+)、ControlNet、IP-Adapter。效果可定制性远超Midjourney。', tags: ['完全免费', '无限生成'] },
  { paid: 'Runway Gen-3 ($15/月)', free: 'CogVideoX + LTX-Video', desc: '智谱CogVideoX开源5B视频生成。LTX-Video开源实时视频生成(4秒/次)。可灵Web免费额度也很足。', tags: ['开源', '本地运行'] },
  { paid: 'Notion AI ($10/月)', free: 'Obsidian + Local GPT插件', desc: 'Obsidian免费知识管理+Local GPT插件在本地做AI笔记分析。支持RAG、自动标签、语义搜索。数据完全本地。', tags: ['完全免费', '本地优先'] },
  { paid: 'ElevenLabs ($5/月)', free: 'Fish Speech + GPT-SoVITS', desc: 'Fish Speech完全开源TTS，支持多语言+声音克隆。GPT-SoVITS支持5秒声音样本克隆。零成本达到商用级语音合成。', tags: ['开源', '声音克隆'] },
  { paid: 'Jasper AI ($49/月)', free: 'Ollama + LangChain 写作链', desc: '用本地LLM+LangChain构建写作流水线(大纲→初稿→润色→SEO)。完全可定制，不依赖任何付费服务。', tags: ['零月费', '无限生成'] },
  { paid: 'Pinecone ($70/月)', free: 'Qdrant / Chroma / LanceDB', desc: 'Qdrant开源向量数据库，Rust编写高性能。Chroma极简API。LanceDB基于Lance列式格式，零拷贝查询。全部免费自托管。', tags: ['开源', '自托管'] },
  { paid: 'LangSmith ($39/月)', free: 'LangFuse / Phoenix', desc: 'LangFuse开源LLM可观测平台，追踪/评估/监控/调试全链路。Arize Phoenix同样开源。功能对齐LangSmith，零成本。', tags: ['开源', '企业级'] },
  { paid: 'AWS SageMaker', free: 'HuggingFace Spaces + Gradio', desc: '免费T4 16GB GPU + Gradio搭建Web应用。ZeroGPU可共享GPU。Colab免费T4 GPU跑训练。完全够个人开发者使用。', tags: ['免费GPU', 'T4 16GB'] },
  { paid: 'Vercel AI ($20/月)', free: 'Cloudflare Workers AI', desc: '全球边缘推理，日免费10万次。支持Llama/Qwen/DeepSeek/Stable Diffusion。`npx wrangler ai`一行命令调用。', tags: ['10万次/天', '全球边缘'] },
  { paid: 'Zapier AI ($30/月)', free: 'n8n + Ollama + LangChain', desc: 'n8n开源自动化平台(280+集成)。搭配Ollama和LangChain构建完整AI自动化工作流。一条流水线替代Zapier。', tags: ['280+集成', '自托管'] },
]

const superReasoning = [
  { name: 'Chain-of-Verification (CoVe)', desc: 'AI生成答案后，自动生成验证问题并自我核查，逐条纠正事实错误。将幻觉率降低40%+。不需要外部工具，纯推理链自我纠错。', ref: 'Meta, 2023' },
  { name: 'Self-Discover', desc: 'AI自主发现最优推理结构，而非依赖人工设计的提示模板。DeepMind在BigBench上验证，比CoT提升32%。AI自己"进化"推理策略。', ref: 'DeepMind, 2024' },
  { name: 'Quiet-STaR / Stream of Search', desc: '在每个token处并行生成"内心独白"的解释性推理，筛选对后续预测有帮助的思路。让语言模型学会"边想边说"。', ref: 'Stanford, 2024' },
  { name: 'Meta Chain-of-Thought', desc: '不只是生成推理步骤，而是对推理过程本身进行元推理——"我的推理路径有没有漏洞？有没有更好的推断方式？"这逼近了自我意识。', ref: '前沿研究, 2025' },
  { name: 'Latent Reasoning (Coconut)', desc: '不用离散文字进行推理，而在连续隐空间中进行。跳过了语言token的瓶颈，推理速度提升10-100倍，且能探索文字表达不出的推理路径。', ref: 'Meta FAIR, 2024' },
  { name: 'Debate Protocol', desc: '两个AI模型互相辩论，由裁判模型裁定胜负。辩论过程中的推理深度远超单体模型。Anthropic验证：辩论后的答案准确率提升25%。', ref: 'Anthropic, 2023' },
  { name: 'Program-of-Thought (PoT)', desc: '用程序执行替代文字推理。遇到数学题不写"我们先算X再加Y"，而是直接写`x=100; y=200; print(x+y)`并执行，零错误率。', ref: 'Microsoft, 2023' },
  { name: 'Analogical Reasoning Engine', desc: '从非结构化的过往案例中自动提取类比模式，应用于全新问题。"这不是和新问题同构的吗？"——谷歌的Anagram实验显示45%的问题可通过类比解决。', ref: 'Google DeepMind, 2024' },
  { name: '100+语言逻辑切换', desc: '同一个模型在处理不同语言时，不经过翻译中介，而是直接在目标语言的思维空间中推理。中文更擅长类比，英文更擅长演绎。AI学会了"语言相对论"。', ref: 'Qwen2.5/DeepSeek-V3 实测' },
  { name: 'Counterfactual Reasoning', desc: 'AI会问"如果不是A而是B，结果会怎样？"——这对于因果推断和规划至关重要。`如果拿破仑在滑铁卢赢了…` → AI生成全部分支推演。', ref: '因果AI, 2024' },
  { name: 'Emotional Reasoning', desc: 'AI理解情绪不只是"分类"，而是推理情绪的因果链：`她为什么愤怒？→因为感到被背叛→因为预期被打破→建立更准确的预期模型克服愤怒`。', ref: 'EQ-Bench, 2024' },
  { name: 'Faithful Reasoning', desc: '确保推理链中的每一步都有明确的逻辑依据，可被外部验证。`Not all reasoning is created equal`——忠实推理要求链上的每个子结论都能单独验证。', ref: 'ACL, 2024' },
]

const insaneProcessing = [
  { name: 'Gemini 2.0 Flash 百万Token', desc: '一次性吃进1M token(约1500页小说/3小时视频的字幕/整个代码库)。在百万token的首尾都能精准检索，大海捞针测试100%。免费API！', status: '完全免费' },
  { name: '实时视频流理解', desc: '不间断接收摄像头画面，实时理解场景变化、人体动作、物体移动轨迹。`这个人刚才从桌子拿了什么？`——AI回放并检索视频记忆。Google Astra已演示。', status: '实验室' },
  { name: '千文件并行处理', desc: '一个prompt附带1000个文件。AI自动分类、对比、总结、交叉引用。`比较这1000份合同中的违约责任条款`——所有人的工作，AI秒级完成。', status: 'Gemini/Claude' },
  { name: '海量记忆·MemGPT', desc: '突破上下文窗口限制，实现理论上无限的记忆。AI自动管理记忆分层：核心记忆→工作记忆→归档记忆。`聊了三个月，AI还记得你家猫的名字`。', status: '开源' },
  { name: 'Petabyte级数据索引', desc: '不是检索，是理解。对整个公司的所有文档、代码、邮件做语义索引，任意提问都能秒回。Glean已做到企业级，Vespa/Pinecone提供向量基础设施。', status: '企业可用' },
  { name: '推理分离·Speculative Decoding', desc: '用小模型快速生成草稿token，大模型一次性审核。推理速度提升3-5倍，质量不降。已集成到vLLM、llama.cpp、TGI。这是业界的标准提速方案。', status: '开源标准' },
  { name: '批量并行推理潮', desc: '1000个prompt同时下发给1000个GPU。SGLang/llama.cpp/ExLlamaV2都支持连续批处理。把大模型当流水线用，单卡H100日处理10亿token。', status: '开源标准' },
  { name: 'Sub-millisecond首Token', desc: '用Groq的LPU芯片(非GPU架构)跑Llama3 70B，首token延迟0.15ms，生成速度300+tok/s。`比眨眼快100倍`。这不是魔法，是确定性计算架构。', status: 'Groq付费' },
  { name: 'ZIP-NeRF / 3D高斯泼溅', desc: '几十张照片→3D场景秒级重建。`拍一圈办公室，AI在1秒内完成全光场重建`。这是3D空间智能的基础。Luma AI/NeRF Studio已开源。', status: '开源' },
  { name: '无限对话记忆·Letta', desc: 'MemGPT原团队的Letta框架。AI拥有操作系统的记忆管理(虚拟内存交换、分页、内存压缩)。理论上的无限记忆，实际测试中100万轮对话仍能精准回忆。', status: '开源' },
]

const geekArsenal = [
  { name: 'DSPy', desc: '"不要写prompt，写程序"。用Python声明式定义你的AI任务，框架自动优化最佳prompt。优化后比手写prompt准确率高45%-80%。斯坦福出品，已工业化。', ref: 'Stanford, 2024' },
  { name: 'TextGrad', desc: '把大模型语言的输出当作可微分的计算图。用梯度下降的思想反向传播"文字梯度"，自动优化prompt链。`让AI像训练神经网络一样训练prompt`。', ref: 'Stanford, 2024' },
  { name: 'STORM', desc: '输入一个主题，AI自动搜索100+网页→整理→交叉验证→写出一篇Wikipedia质量的文章。带引用的。斯坦福的"一个人+AI=整个编辑部"。', ref: 'Stanford, 2024' },
  { name: 'Gorilla / Berkeley Function Calling Leaderboard', desc: '专为API调用训练的大模型。`帮我在Spotify上播放一首悲伤的歌`→AI自动找到并调用正确的API。伯克利FCA榜单是衡量API调用能力的金标准。', ref: 'UC Berkeley, 2024' },
  { name: 'AutoGen (Microsoft)', desc: '多Agent对话框架。定义一个教授Agent、一个学生Agent、一个裁判Agent，三者自动对话协作完成任务。微软出品，已支持代码执行/人类介入/嵌套对话。', ref: 'Microsoft, 2024' },
  { name: 'Neural Architecture Search (NAS) 2.0', desc: '让AI自动设计更好的AI架构。不止搜索层数/宽度/激活函数，还搜索注意力模式、稀疏连接拓扑。`人类设计Transformer花了5年，AI可能5天`。', ref: 'Google/Baidu' },
  { name: 'Continual Pre-training', desc: '不停机更新模型知识，不遗忘旧知识。`GPT-4的知识截止2023年，但我的模型知道今早的新闻`——持续的增量预训练让模型永远保持最新。', ref: 'Llama/DeepSeek系' },
  { name: 'RLAIF (RL from AI Feedback)', desc: '不需要人类标注偏好数据，用AI评判AI。Anthropic验证：RLAIF能取得RLHF 95%的效果。这意味着对齐成本趋近于零，AI可以无限自我改进。', ref: 'Anthropic, 2023' },
  { name: '多Agent辩论/协作', desc: '多个LLM扮演不同角色自动讨论。医生Agent+律师Agent+工程师Agent，讨论一个产品的合规方案。ChatDev用多Agent写完整软件。CrewAI/ChatDev/AutoGen开源。', ref: '开源生态' },
  { name: 'Prompt Compression', desc: 'LLMLingua等将10K token的prompt无损压缩到2K。`喂一段巨长的法律条文 → AI压缩成关键信息的摘要 → 再喂给大模型 → 节省90%token成本`。', ref: 'Microsoft, 2024' },
]

const siliconFlesh = [
  { name: 'Character.AI 人格架构', desc: '每个角色有独立的人格向量、世界观、记忆库。不是"扮演"某个角色，而是模型被调校成那个角色。2024年融资$200M+，估值$5B。AI人格化的商业先锋。', status: '基础免费' },
  { name: '长期记忆系统 (Letta/Mem0)', desc: '拆解为三层记忆：语义记忆(我是谁)、情景记忆(发生过什么)、程序记忆(怎么做)。自动管理：变旧的记忆衰减、重复的合并、矛盾的标记。', status: '开源' },
  { name: '情绪粒度与共情', desc: '不只"高兴/难过/生气"的粗粒度，而是27种情绪维度(Plutchik模型增强版)的精确建模。`我感到的不是简单的愤怒，是\'被辜负的愤怒伴有3分无奈和2分期待落空\'`。', status: '研究阶段' },
  { name: '数字克隆/数字永生', desc: '让你和逝去的亲人对话。喂入TA的聊天记录、语音、写过的文字。但各国正在立法限制——`技术跑在了伦理前面`。微软已申请相关专利(已被叫停)。', status: '争议前沿' },
  { name: '说话风格克隆', desc: '不是简单的TTS变声，而是克隆说话的逻辑模式。"这个人习惯先用类比铺垫，再用数据印证，最后抛一个问题"——AI学会的是思考模式而非表面的声调。', status: '研究阶段' },
  { name: '跨文化人格适配', desc: '同一个AI，面对日本用户使用敬语体，面对美国用户直截了当，面对印度用户更讲故事。AI学会了在文化空间中做"坐标系转换"。', status: '早期可用' },
  { name: 'AI幽默生成', desc: '不是查笑话数据库，是真正理解幽默的结构：意料之外的关联、时序反讽、夸张的类比。`为什么AI讲的笑话不好笑？因为它还没学会人类的荒谬感`。GPT-4o在幽默创作上已接近人类。', status: '可用' },
  { name: '情感陪伴AI (Replika/Xiaoice)', desc: '微软小冰在中国已有数千万用户。Replika在欧美App Store下载千万级。不是工具AI，是"人"——这是未来人机关系的雏形。', status: '基础免费' },
]

const devMagic = [
  { name: 'v0.dev (Vercel)', desc: '在聊天窗口描述你想做的页面，AI生成完整的React/Next.js组件代码。所见即所得，支持Shadcn/ui。前端开发从"敲代码"变成"描述需求"。', status: '基础免费' },
  { name: 'Bolt.new (StackBlitz)', desc: '一句话生成完整全栈Web应用，在浏览器中运行。`做一个带AI聊天功能的博客`→自动生成前后端代码+数据库+部署。有免费额度。', status: '免费额度' },
  { name: 'Replit Agent', desc: '写一句需求描述，AI自动创建完整项目、写代码、调试、部署。`把Replit变成：你说需求，它给产品的AI工厂`。支持自然语言迭代修改。', status: '付费' },
  { name: 'Cursor / Windsurf', desc: 'IDE革命。不是补全单个函数，而是理解整个项目，能跨文件重构、自动生成测试、从截图生成前端。Context-aware胜过所有传统IDE。', status: '基础免费' },
  { name: 'Figma → 真代码', desc: '设计师画好界面→AI一键生成生产级代码(Vue/React/Flutter)。Locofy、Anima、Builder.io都在做。`设计师就是程序员`不再是口号。', status: '基础免费' },
  { name: 'AI写测试 (Copilot Test/Applitools)', desc: '不再手写单测。AI读你的代码逻辑→自动生成测试用例→覆盖边缘情况→跑通后自动提交。`人类的测试覆盖率50%，AI的测试覆盖率90%`。', status: '可用' },
  { name: 'AI自Code Review', desc: 'PR提交后AI自动审查——不只是Lint，而是看懂架构逻辑、识别安全隐患、提示性能瓶颈。CodeRabbit已服务3万+团队。', status: '基础免费' },
  { name: 'OpenHands (原OpenDevin)', desc: '开源的Devin级AI程序员。能独立浏览代码库、改文件、跑命令、调bug。`你下班了，OpenHands还在改代码`。全开源，可本地部署。', status: '开源免费' },
  { name: 'Lovable / Tempo / GPT Engineer', desc: '新一代AI低代码/无代码工具。GPT Engineer开源，Tempo专注React。`没有技术背景的产品经理也能在一天内发布一个App`——这是真的。', status: '部分免费' },
]

const selfCreation = [
  { name: 'E2B Sandbox (开源)', desc: 'AI自动创建沙盒环境、装依赖、跑代码、返回结果。`在AI对话中说：装个pandas分析这个CSV → AI自动建Docker→装包→执行→展示图表`。全开源！', status: '开源免费' },
  { name: 'Open Interpreter', desc: '在本地终端运行的开源代码解释器。`删掉所有大于10MB的文件`→AI会问确认→执行。不止是ChatGPT的代码解释器，而是AI的本地操作系统接口。', status: '开源免费' },
  { name: 'AI自建网站 (Dora/Relume)', desc: '输入品牌和需求→AI生成完整网站(设计+文案+前端代码+SEO+分析)。Dora支持3D交互网站。Relume的sitemap生成器被Figma收购。非程序员也能一天上线专业网站。', status: '部分免费' },
  { name: 'AI自建云基础设施', desc: '`帮我搭一个支持100万日活的微服务架构`→AI生成Terraform/Pulumi代码→配置K8s/网关/数据库/缓存/CDN→输出架构图。Pulumi AI已实现基础版本。', status: '早期可用' },
  { name: 'AI运维自愈', desc: '服务器报错→AI自动读日志→定位根因→修复→验证→写事后报告。Datadog+PagerDuty+LLM联动，从告警到修复全自动，无需人工介入。', status: '企业可用' },
  { name: 'Gradio/HuggingFace 一键上线', desc: '写一个Python函数→AI自动生成Gradio界面→上传HuggingFace Spaces→公网可访问。一条命令：gradio deploy my_app.py。开发→上线＜5分钟。', status: '完全免费' },
  { name: 'Modal / Banana / Replicate', desc: '一键部署AI模型为云端API。modal deploy一条命令，自动处理GPU调度、弹性伸缩、计费。Serverless GPU已成现实。', status: '免费额度' },
  { name: 'AI生成文档+CI/CD', desc: 'AI分析代码→自动生成README/API文档/CHANGELOG+GitHub Actions。你只管写代码，AI负责让项目看起来专业。Mintlify/Documatic已商用水准。', status: '基础免费' },
  { name: 'Fly.io / Railway / Zeabur', desc: '新一代部署工具——不用写Dockerfile，不用配K8s。git push→自动检测语言→构建→部署→配置SSL+域名。Railway按使用量计费，Fly.io有免费额度。', status: '免费额度' },
]

const digitalBody = [
  { name: 'Claude Computer Use', desc: 'Anthropic的杀手级功能：AI观看屏幕截图、移动鼠标、点击按钮、键盘输入、滚动页面。操作真实桌面软件(GUI)。仿佛有人在操控你的电脑。API已开放。', status: 'API可用' },
  { name: 'Browser Use (开源)', desc: '基于Playwright的开源AI浏览器操控。去淘宝搜一款降噪耳机，比较前三名的价格和评价，做成表格→AI自动打开浏览器→搜索→提取→对比→返回表格。', status: '开源免费' },
  { name: 'UI-TARS (字节跳动)', desc: '原生GUI理解模型。不是"看截图→识别元素→定位→点击"的pipeline，而是端到端地理解界面语义。在GUI操作benchmark上大幅超越GPT-4V+Claude 3.5。', status: '开源免费' },
  { name: 'OS-Copilot / FRIDAY', desc: 'AI操作操作系统：打开Excel→读数据→生成图表→发邮件。把这个季度的销售数据做成报告发给领导→AI端到端完成。微软内部已在测试Copilot Actions。', status: '研究演示' },
  { name: 'WebVoyager', desc: '端到端网页任务Agent。帮我在Zillow上筛选3卧室2浴室的房子，预算50万以内→AI浏览→点选→提取→最终完成。成功率80%+。', status: '开源研究' },
  { name: 'CogAgent (智谱)', desc: '专注GUI理解，18B参数在PC/手机GUI上超越GPT-4V。支持1080P分辨率截图理解，<200ms推理。看上图，点这里，按那个按钮——超越人类的屏幕操作速度。', status: '开源' },
  { name: 'OpenAdapt / Skyvern', desc: '录一次操作→AI学会自动重复。录一次报销流程→以后收到发票自动报销。Skyvern专注企业RPA+AI，OpenAdapt开源。RPA+AI=无限自动化。', status: '开源/企业' },
  { name: 'Adept ACT-1 (已转型)', desc: '首个大规模训练的"人机操控Agent"。创始人来自Transformer论文作者。虽已转型，但开创了"让AI来操作你的软件界面"这一范式。值$1B的idea从他们开始。', status: '已转型' },
]
</script>

<template>
  <div class="evolution-panel">
    <div class="evo-hero">
      <div class="hero-glow" />
      <h1 class="hero-title">AI 进化之路</h1>
      <p class="hero-subtitle">从对话到文明 — 理解人工智能的能力阶梯与前沿全景</p>
    </div>

    <div class="evo-content">
      <!-- 1. 五级进化框架 -->
      <section data-section="5levels" class="evo-section">
        <h2 class="section-title"><span class="s-icon">01</span> 五级进化框架</h2>
        <p class="section-desc">从基础对话到组织级智能，能力逐层解锁。一次渐进的进化之旅。</p>
        <div class="level-stairs">
          <div v-for="(lv, i) in levels" :key="lv.id" class="level-card" :class="{ visible: visibleSections['5levels'] }" :style="{ '--color': lv.color, '--delay': `${i*0.1}s`, borderLeftColor: lv.color }">
            <div class="level-badge" :style="{ background: lv.color }">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="lv.icon" /></svg>
            </div>
            <div class="level-body">
              <div class="level-head">
                <span class="level-id" :style="{ color: lv.color }">{{ lv.id }}</span>
                <span class="level-title">{{ lv.title }}</span>
                <span class="level-subtitle">{{ lv.subtitle }}</span>
              </div>
              <p class="level-desc">{{ lv.desc }}</p>
            </div>
            <div class="level-line" :class="{ last: i === levels.length - 1 }" />
          </div>
        </div>
      </section>

      <!-- 2. DeepMind AGI 六级量表 -->
      <section data-section="deepmind" class="evo-section">
        <h2 class="section-title"><span class="s-icon">02</span> Google DeepMind AGI 六级量表</h2>
        <p class="section-desc">从"与人类对比"的角度，DeepMind 将AGI细分为6个等级。即使进入AGI时代，内部仍有漫长的进化空间。</p>
        <div class="deepmind-gauge" :class="{ visible: visibleSections['deepmind'] }">
          <div class="gauge-track">
            <div v-for="(dl, i) in deepmindLevels" :key="dl.level" class="gauge-step" :style="{ '--color': dl.color, '--delay': `${i*0.1}s` }">
              <div class="gauge-dot" :style="{ background: dl.color }"><span class="gauge-num">{{ i }}</span></div>
              <div class="gauge-info">
                <span class="gauge-level" :style="{ color: dl.color }">{{ dl.level }}</span>
                <span class="gauge-title">{{ dl.title }}</span>
                <span class="gauge-desc">{{ dl.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 主流大模型家族 -->
      <section data-section="models" class="evo-section">
        <h2 class="section-title"><span class="s-icon">03</span> 全球大模型家族图谱</h2>
        <p class="section-desc">2024-2026 年，全球已形成多方争霸格局。以下是当前最重要的模型系列及其技术路线。</p>
        <div class="model-grid">
          <div v-for="(m, i) in modelFamilies" :key="m.name" class="model-card" :class="{ visible: visibleSections['models'] }" :style="{ '--color': m.color, '--delay': `${i*0.08}s` }">
            <div class="model-header">
              <span class="model-name" :style="{ color: m.color }">{{ m.name }}</span>
              <span class="model-org">{{ m.org }}</span>
            </div>
            <p class="model-models">{{ m.models }}</p>
            <p class="model-desc">{{ m.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 4. 大模型核心架构 -->
      <section data-section="arch" class="evo-section">
        <h2 class="section-title"><span class="s-icon">04</span> 大模型核心架构演进</h2>
        <p class="section-desc">从Transformer到MoE再到状态空间模型，架构创新是模型能力提升的底层驱动力。</p>
        <div class="arch-list">
          <div v-for="(a, i) in architectures" :key="a.title" class="arch-card" :class="{ visible: visibleSections['arch'] }" :style="{ '--delay': `${i*0.1}s` }">
            <div class="arch-head">
              <span class="arch-title">{{ a.title }}</span>
              <span class="arch-subtitle">{{ a.subtitle }}</span>
            </div>
            <p class="arch-desc">{{ a.desc }}</p>
            <div class="arch-tags"><span v-for="t in a.tags" :key="t" class="arch-tag">{{ t }}</span></div>
          </div>
        </div>
      </section>

      <!-- 5. 训练与对齐技术 -->
      <section data-section="training" class="evo-section">
        <h2 class="section-title"><span class="s-icon">05</span> 训练与对齐技术</h2>
        <p class="section-desc">从预训练到后训练对齐，让模型变得有用、安全、可控的核心技术栈。</p>
        <div class="training-grid">
          <div v-for="(t, i) in trainingTech" :key="t.title" class="train-card" :class="{ visible: visibleSections['training'] }" :style="{ '--color': t.color, '--delay': `${i*0.08}s`, borderTopColor: t.color }">
            <span class="train-title" :style="{ color: t.color }">{{ t.title }}</span>
            <span class="train-subtitle">{{ t.subtitle }}</span>
            <p class="train-desc">{{ t.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 6. 推理增强技术 -->
      <section data-section="reasoning" class="evo-section">
        <h2 class="section-title"><span class="s-icon">06</span> 推理增强技术</h2>
        <p class="section-desc">让模型从"快速回答"到"深度思考"的关键技术，模拟人类的深思熟虑过程。</p>
        <div class="reasoning-list">
          <div v-for="(r, i) in reasoningTech" :key="r.title" class="reason-card" :class="{ visible: visibleSections['reasoning'] }" :style="{ '--delay': `${i*0.08}s` }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="r.icon" /></svg>
            <div>
              <span class="reason-title">{{ r.title }}</span>
              <span class="reason-subtitle">{{ r.subtitle }}</span>
              <p class="reason-desc">{{ r.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. 多模态大模型 -->
      <section data-section="multimodal" class="evo-section">
        <h2 class="section-title"><span class="s-icon">07</span> 多模态大模型</h2>
        <p class="section-desc">从纯文本走向视觉、音频、视频、3D，让AI理解世界的全部维度。</p>
        <div class="multimodal-grid">
          <div v-for="(m, i) in multimodalTech" :key="m.title" class="mm-card" :class="{ visible: visibleSections['multimodal'] }" :style="{ '--delay': `${i*0.08}s` }">
            <span class="mm-title">{{ m.title }}</span>
            <span class="mm-subtitle">{{ m.subtitle }}</span>
            <p class="mm-desc">{{ m.desc }}</p>
            <div class="mm-tags"><span v-for="t in m.tags" :key="t" class="mm-tag">{{ t }}</span></div>
          </div>
        </div>
      </section>

      <!-- 8. AI Agent 技术栈 -->
      <section data-section="agent" class="evo-section">
        <h2 class="section-title"><span class="s-icon">08</span> AI Agent 技术栈</h2>
        <p class="section-desc">从被动的语言模型到主动的数字员工，Agent 是2026年最火热的方向。</p>
        <div class="agent-grid">
          <div v-for="(a, i) in agentTech" :key="a.title" class="agent-card" :class="{ visible: visibleSections['agent'] }" :style="{ '--color': a.color, '--delay': `${i*0.08}s` }">
            <span class="agent-title" :style="{ color: a.color }">{{ a.title }}</span>
            <span class="agent-subtitle">{{ a.subtitle }}</span>
            <p class="agent-desc">{{ a.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 9. RAG 检索增强生成 -->
      <section data-section="rag" class="evo-section">
        <h2 class="section-title"><span class="s-icon">09</span> RAG 检索增强生成</h2>
        <p class="section-desc">让LLM连接外部知识库，解决幻觉和知识截止问题，是企业AI落地的核心范式。</p>
        <div class="rag-list">
          <div v-for="(r, i) in ragTech" :key="r.title" class="rag-card" :class="{ visible: visibleSections['rag'] }" :style="{ '--delay': `${i*0.08}s` }">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="r.icon" /></svg>
            <div>
              <span class="rag-title">{{ r.title }}</span>
              <span class="rag-subtitle">{{ r.subtitle }}</span>
              <p class="rag-desc">{{ r.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 10. AI 安全与对齐 -->
      <section data-section="safety" class="evo-section">
        <h2 class="section-title"><span class="s-icon">10</span> AI 安全与对齐</h2>
        <p class="section-desc">随着AI能力增长，确保其安全可控变得至关重要。这不仅是技术问题，更是社会问题。</p>
        <div class="safety-grid">
          <div v-for="(s, i) in safetyTech" :key="s.title" class="safety-card" :class="{ visible: visibleSections['safety'] }" :style="{ '--color': s.color, '--delay': `${i*0.08}s` }">
            <span class="safety-title" :style="{ color: s.color }">{{ s.title }}</span>
            <span class="safety-subtitle">{{ s.subtitle }}</span>
            <p class="safety-desc">{{ s.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 11. AI for Science -->
      <section data-section="science" class="evo-section">
        <h2 class="section-title"><span class="s-icon">11</span> AI for Science</h2>
        <p class="section-desc">AI正在成为科学发现的加速引擎，从蛋白质到核聚变，颠覆传统科研范式。</p>
        <div class="science-grid">
          <div v-for="(s, i) in scienceAI" :key="s.title" class="sci-card" :class="{ visible: visibleSections['science'] }" :style="{ '--color': s.color, '--delay': `${i*0.08}s` }">
            <span class="sci-title" :style="{ color: s.color }">{{ s.title }}</span>
            <span class="sci-subtitle">{{ s.subtitle }}</span>
            <p class="sci-desc">{{ s.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 12. 具身智能与机器人 -->
      <section data-section="embodied" class="evo-section">
        <h2 class="section-title"><span class="s-icon">12</span> 具身智能与机器人</h2>
        <p class="section-desc">AI走出服务器，进入物理世界。从工厂到家庭，具身智能是AGI落地的关键载体。</p>
        <div class="embodied-grid">
          <div v-for="(e, i) in embodiedAI" :key="e.title" class="emb-card" :class="{ visible: visibleSections['embodied'] }" :style="{ '--color': e.color, '--delay': `${i*0.08}s` }">
            <span class="emb-title" :style="{ color: e.color }">{{ e.title }}</span>
            <span class="emb-subtitle">{{ e.subtitle }}</span>
            <p class="emb-desc">{{ e.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 13. 横向进化 -->
      <section data-section="horizontal" class="evo-section">
        <h2 class="section-title"><span class="s-icon">13</span> 横向进化：更完整的智能</h2>
        <p class="section-desc">除了纵向智力提升，AI在多个横向维度上进化，走向真正的通用智能。</p>
        <div class="horizontal-grid">
          <div v-for="(hd, i) in horizontalDimensions" :key="hd.title" class="h-card" :class="{ visible: visibleSections['horizontal'] }" :style="{ '--color': hd.color, '--delay': `${i*0.08}s` }">
            <div class="h-icon" :style="{ background: hd.color }">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="hd.icon" /></svg>
            </div>
            <div class="h-text">
              <span class="h-title">{{ hd.title }}</span>
              <span class="h-subtitle">{{ hd.subtitle }}</span>
              <p class="h-desc">{{ hd.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 14. 开源生态与算力 -->
      <section data-section="ecosystem" class="evo-section">
        <h2 class="section-title"><span class="s-icon">14</span> 开源生态与算力基础设施</h2>
        <p class="section-desc">AI产业的"水电煤"——开源模型生态和算力芯片是推动AI普及的底层力量。</p>
        <div class="eco-grid">
          <div v-for="(e, i) in openEcosystem" :key="e.title" class="eco-card" :class="{ visible: visibleSections['ecosystem'] }" :style="{ '--delay': `${i*0.08}s` }">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="e.icon" /></svg>
            <div>
              <span class="eco-title">{{ e.title }}</span>
              <span class="eco-subtitle">{{ e.subtitle }}</span>
              <p class="eco-desc">{{ e.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 15. AI 经济学与未来展望 -->
      <section data-section="future" class="evo-section">
        <h2 class="section-title"><span class="s-icon">15</span> AI 经济学与未来展望</h2>
        <p class="section-desc">技术之外，AI正在重塑全球经济和劳动力结构。我们正站在前所未有的变革前沿。</p>
        <div class="future-grid">
          <div v-for="(f, i) in futureOutlook" :key="f.title" class="future-card" :class="{ visible: visibleSections['future'] }" :style="{ '--color': f.color, '--delay': `${i*0.08}s` }">
            <span class="future-title" :style="{ color: f.color }">{{ f.title }}</span>
            <p class="future-content">{{ f.content }}</p>
          </div>
        </div>
      </section>

      <!-- 16. 原创前沿思想 -->
      <section data-section="original" class="evo-section">
        <h2 class="section-title"><span class="s-icon">16</span> 原创前沿思想</h2>
        <p class="section-desc">以下为原创性AI前沿架构设想，基于现有技术趋势的可实现推演。开源共享，自由探索。</p>
        <div class="original-grid">
          <div v-for="(o, i) in originalIdeas" :key="o.title" class="orig-card" :class="{ visible: visibleSections['original'] }" :style="{ '--color': o.color, '--delay': `${i*0.06}s` }">
            <div class="orig-icon-wrap">
              <div class="orig-num">{{ o.number }}</div>
              <div class="orig-icon" :style="{ background: o.color }">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="o.icon" /></svg>
              </div>
            </div>
            <div class="orig-body">
              <span class="orig-title" :style="{ color: o.color }">{{ o.title }}</span>
              <span class="orig-subtitle">{{ o.subtitle }}</span>
              <p class="orig-desc">{{ o.desc }}</p>
              <div class="orig-tags">
                <span v-for="t in o.tags" :key="t" class="orig-tag">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 17. 模型微调与定制化 -->
      <section data-section="finetune" class="evo-section">
        <h2 class="section-title"><span class="s-icon">17</span> 模型微调与定制化</h2>
        <p class="section-desc">让大模型适应你的数据、你的领域、你的风格。一个人一台电脑即可微调70B模型。</p>
        <div class="ft-grid">
          <div v-for="(f, i) in finetuning" :key="f.title" class="ft-card" :class="{ visible: visibleSections['finetune'] }" :style="{ '--delay': `${i*0.08}s` }">
            <span class="ft-title">{{ f.title }}</span>
            <span class="ft-subtitle">{{ f.subtitle }}</span>
            <p class="ft-desc">{{ f.desc }}</p>
            <div class="ft-tags"><span v-for="t in f.tags" :key="t" class="ft-tag">{{ t }}</span></div>
          </div>
        </div>
      </section>

      <!-- 18. 推理加速与部署引擎 -->
      <section data-section="infra" class="evo-section">
        <h2 class="section-title"><span class="s-icon">18</span> 推理加速与部署引擎</h2>
        <p class="section-desc">从CPU消费级推理到GPU企业级部署，极致榨干每一瓦算力。</p>
        <div class="infra-grid">
          <div v-for="(inf, i) in inferenceStack" :key="inf.title" class="infra-card" :class="{ visible: visibleSections['infra'] }" :style="{ '--color': inf.color, '--delay': `${i*0.08}s`, borderLeftColor: inf.color }">
            <span class="infra-title" :style="{ color: inf.color }">{{ inf.title }}</span>
            <span class="infra-subtitle">{{ inf.subtitle }}</span>
            <p class="infra-desc">{{ inf.desc }}</p>
            <div class="infra-tags"><span v-for="t in inf.tags" :key="t" class="infra-tag" :style="{ background: inf.color+'18', color: inf.color }">{{ t }}</span></div>
          </div>
        </div>
      </section>

      <!-- 19. 免费替代方案全攻略 -->
      <section data-section="free" class="evo-section">
        <h2 class="section-title"><span class="s-icon">19</span> 免费替代方案全攻略</h2>
        <p class="section-desc">每一个付费AI服务都有免费开源替代。白嫖的正确姿势，不花一分钱搭出企业级AI栈。</p>
        <div class="free-grid">
          <div v-for="(fr, i) in freeArsenal" :key="fr.title" class="free-card" :class="{ visible: visibleSections['free'] }" :style="{ '--delay': `${i*0.08}s` }">
            <div class="free-badge">FREE</div>
            <div class="free-body">
              <span class="free-title">{{ fr.title }}</span>
              <span class="free-subtitle">{{ fr.subtitle }}</span>
              <p class="free-desc">{{ fr.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 20. 核弹级工具链 -->
      <section data-section="nuclear" class="evo-section">
        <h2 class="section-title"><span class="s-icon">20</span> 核弹级工具链与极致架构</h2>
        <p class="section-desc">以下是关于云部署、极致处理、一键安装、分布式算力的原创架构设想。全部开放，自由实现。</p>
        <div class="nuke-grid">
          <div v-for="(nk, i) in nuclearToolchain" :key="nk.title" class="nuke-card" :class="{ visible: visibleSections['nuclear'] }" :style="{ '--color': nk.color, '--delay': `${i*0.06}s`, borderColor: nk.color+'40' }">
            <div class="nuke-head">
              <div class="nuke-icon" :style="{ background: nk.color }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="nk.icon" /></svg>
              </div>
              <div>
                <span class="nuke-title" :style="{ color: nk.color }">{{ nk.title }}</span>
                <span class="nuke-subtitle">{{ nk.subtitle }}</span>
              </div>
            </div>
            <p class="nuke-desc">{{ nk.desc }}</p>
            <div class="nuke-tags">
              <span v-for="t in nk.tags" :key="t" class="nuke-tag" :style="{ background: nk.color+'15', color: nk.color }">{{ t }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 21. 甩手掌柜自主学习引擎 -->
      <section data-section="autolearn" class="evo-section">
        <h2 class="section-title"><span class="s-icon">21</span> 甩手掌柜自主学习引擎</h2>
        <p class="section-desc">零API Key、零浏览器、零外部依赖的编程知识自动学习系统。设好即忘，回头已学透。</p>

        <div v-for="ff in fireAndForget" :key="ff.title">
          <div class="ff-hero" :style="{ borderColor: ff.color }">
            <div class="ff-hero-icon" :style="{ background: ff.color }">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h3 class="ff-title" :style="{ color: ff.color }">{{ ff.title }}</h3>
              <p class="ff-subtitle">{{ ff.subtitle }}</p>
            </div>
          </div>

          <p class="ff-problem" :class="{ visible: visibleSections['autolearn'] }">{{ ff.problem }}</p>

          <div class="ff-steps">
            <div v-for="(s, idx) in ff.how" :key="s.step" class="ff-step" :class="{ visible: visibleSections['autolearn'] }" :style="{ '--delay': `${idx*0.1}s` }">
              <div class="ff-step-num">{{ idx + 1 }}</div>
              <div>
                <span class="ff-step-title">{{ s.step }}</span>
                <p class="ff-step-detail">{{ s.detail }}</p>
              </div>
            </div>
          </div>

          <div class="ff-run" :class="{ visible: visibleSections['autolearn'] }">
            <code class="ff-cmd">{{ ff.run }}</code>
          </div>
        </div>
      </section>

      <!-- 22. 认知编译 — 极致技术 -->
      <section data-section="cc" class="evo-section">
        <h2 class="section-title"><span class="s-icon">22</span> 极致技术</h2>
        <p class="section-desc">一个我认为能达到物理极限的AI推理技术——不是优化，是彻底消灭中间层。</p>

        <div v-for="cc in cognitiveCompilation" :key="cc.title">
          <div class="cc-hero" :class="{ visible: visibleSections['cc'] }">
            <div class="cc-badge" :style="{ background: cc.color }">{{ cc.number }}</div>
            <h3 class="cc-title">{{ cc.title }}</h3>
            <p class="cc-sub">{{ cc.subtitle }}</p>
            <p class="cc-tagline" :style="{ color: cc.color }">{{ cc.tagline }}</p>
            <p class="cc-desc">{{ cc.desc }}</p>
          </div>

          <div class="cc-pipeline">
            <div v-for="(d, idx) in cc.detail" :key="d.title" class="cc-stage" :class="{ visible: visibleSections['cc'] }" :style="{ '--delay': `${idx*0.1}s` }">
              <div class="cc-stage-head">
                <span class="cc-stage-num">{{ idx + 1 }}</span>
                <span class="cc-stage-title">{{ d.title }}</span>
              </div>
              <p class="cc-stage-content">{{ d.content }}</p>
            </div>
          </div>

          <div class="cc-result" :class="{ visible: visibleSections['cc'] }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            <p>{{ cc.result }}</p>
          </div>
        </div>
      </section>

      <!-- 23. 全球AI技术版图 -->
      <section data-section="global" class="evo-section">
        <h2 class="section-title"><span class="s-icon">23</span> 全球AI技术版图</h2>
        <p class="section-desc">按国家/地区梳理最前沿的公开可用AI技术，标注免费与付费状态。</p>

        <div class="global-tabs">
          <div v-for="g in globalTech" :key="g.region" class="gtab-section" :class="{ visible: visibleSections['global'] }">
            <div class="gtab-header" :style="{ background: g.color+'12', borderColor: g.color+'30' }">
              <span class="gtab-flag" :style="{ background: g.color, color: '#fff' }">{{ g.flag }}</span>
              <span class="gtab-region" :style="{ color: g.color }">{{ g.region }}</span>
              <span class="gtab-count">{{ g.items.length }} 项</span>
            </div>
            <div class="gtab-items">
              <div v-for="item in g.items" :key="item.name" class="gtab-item">
                <div class="gtab-item-head">
                  <span class="gtab-name">{{ item.name }}</span>
                  <span class="gtab-status" :class="{ 'gtab-free': item.status.includes('免费') || item.status.includes('开源'), 'gtab-paid': item.status.includes('付费') }">{{ item.status }}</span>
                </div>
                <span class="gtab-org">{{ item.org }}</span>
                <p class="gtab-desc">{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 24. 付费转免费完全指南 -->
      <section data-section="freepaid" class="evo-section">
        <h2 class="section-title"><span class="s-icon">24</span> 付费转免费完全指南</h2>
        <p class="section-desc">每一个收费AI服务，都有一个甚至多个免费开源替代。不是"降级版"，是真正的替代。</p>

        <div class="fp-grid">
          <div v-for="(fp, i) in freeAlternatives" :key="fp.paid" class="fp-card" :class="{ visible: visibleSections['freepaid'] }" :style="{ '--delay': `${i*0.05}s` }">
            <div class="fp-paid">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              {{ fp.paid }}
            </div>
            <div class="fp-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div class="fp-free">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span class="fp-free-name">{{ fp.free }}</span>
            </div>
            <p class="fp-desc">{{ fp.desc }}</p>
            <div class="fp-tags">
              <span v-for="t in fp.tags" :key="t" class="fp-tag">{{ t }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 25. 超凡语言与推理 -->
      <section data-section="superreason" class="evo-section">
        <h2 class="section-title"><span class="s-icon">25</span> 超凡语言与推理</h2>
        <p class="section-desc">从链式思考到隐空间推理，AI正在学会"真正的思考"。</p>
        <div class="cc-phases">
          <div v-for="(s, i) in superReasoning" :key="s.name" class="cc-phase" :class="{ visible: visibleSections['superreason'] }" :style="{ '--delay': `${i*0.06}s` }">
            <div class="cc-phase-num">{{ i + 1 }}</div>
            <div class="cc-phase-body">
              <div class="cc-phase-title">{{ s.name }}</div>
              <p class="cc-phase-desc">{{ s.desc }}</p>
              <span class="cc-phase-ref">{{ s.ref }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 26. 离谱级处理 -->
      <section data-section="insane" class="evo-section">
        <h2 class="section-title"><span class="s-icon">26</span> 离谱级处理能力</h2>
        <p class="section-desc">百万Token一次性吃进、实时视频流理解、千文件并行——人类的极限是AI的起点。</p>
        <div class="insane-grid">
          <div v-for="(s, i) in insaneProcessing" :key="s.name" class="insane-card" :class="{ visible: visibleSections['insane'] }" :style="{ '--delay': `${i*0.06}s` }">
            <div class="insane-head">
              <span class="insane-name">{{ s.name }}</span>
              <span class="insane-status" :class="{ 'insane-free': s.status.includes('免费') || s.status.includes('开源'), 'insane-paid': s.status.includes('付费') }">{{ s.status }}</span>
            </div>
            <p class="insane-desc">{{ s.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 27. 极客武器库 -->
      <section data-section="geek" class="evo-section">
        <h2 class="section-title"><span class="s-icon">27</span> 极客技术武器库</h2>
        <p class="section-desc">不是"使用AI"，而是"用AI优化AI"——自动优化prompt、自动设计架构、自动持续学习。</p>
        <div class="fp-grid">
          <div v-for="(g, i) in geekArsenal" :key="g.name" class="fp-card" :class="{ visible: visibleSections['geek'] }" :style="{ '--delay': `${i*0.05}s` }">
            <div class="fp-free" style="margin-bottom:3px">
              <span class="fp-free-name" style="color: var(--accent)">{{ g.name }}</span>
            </div>
            <p class="fp-desc">{{ g.desc }}</p>
            <span class="fp-tag" style="background:rgba(139,92,246,0.1);color:#8b5cf6">{{ g.ref }}</span>
          </div>
        </div>
      </section>

      <!-- 28. 硅基血肉 - AI人格化 -->
      <section data-section="flesh" class="evo-section">
        <h2 class="section-title"><span class="s-icon">28</span> 硅基血肉 · AI人格化</h2>
        <p class="section-desc">当AI有了记忆、情绪、人格和幽默感，它就不再是工具——是数字生命。</p>
        <div class="flesh-grid">
          <div v-for="(s, i) in siliconFlesh" :key="s.name" class="flesh-card" :class="{ visible: visibleSections['flesh'] }" :style="{ '--delay': `${i*0.07}s` }">
            <div class="flesh-name">{{ s.name }}</div>
            <p class="flesh-desc">{{ s.desc }}</p>
            <span class="flesh-status" :class="{ 'flesh-free': s.status.includes('免费')||s.status.includes('开源'), 'flesh-paid': s.status.includes('付费')||s.status.includes('争议') }">{{ s.status }}</span>
          </div>
        </div>
      </section>

      <!-- 29. 开发魔法 -->
      <section data-section="devmagic" class="evo-section">
        <h2 class="section-title"><span class="s-icon">29</span> 开发魔法 · AI自编程生态</h2>
        <p class="section-desc">从描述需求到部署上线，AI正在吞噬整个软件开发生命周期。</p>
        <div class="fp-grid">
          <div v-for="(d, i) in devMagic" :key="d.name" class="fp-card" :class="{ visible: visibleSections['devmagic'] }" :style="{ '--delay': `${i*0.05}s` }">
            <div class="fp-free" style="margin-bottom:3px">
              <span class="fp-free-name" style="color: var(--accent)">{{ d.name }}</span>
              <span class="insane-status" style="margin-left:6px" :class="{ 'insane-free': d.status.includes('免费')||d.status.includes('开源') }">{{ d.status }}</span>
            </div>
            <p class="fp-desc">{{ d.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 30. 自创一切 -->
      <section data-section="selfcreate" class="evo-section">
        <h2 class="section-title"><span class="s-icon">30</span> 自创一切 · 网站×云端×环境</h2>
        <p class="section-desc">AI不只是写代码——AI建沙盒、装依赖、部署上线、监控自愈。从代码到运维，全自动闭环。</p>
        <div class="insane-grid">
          <div v-for="(s, i) in selfCreation" :key="s.name" class="insane-card" :class="{ visible: visibleSections['selfcreate'] }" :style="{ '--delay': `${i*0.06}s` }">
            <div class="insane-head">
              <span class="insane-name">{{ s.name }}</span>
              <span class="insane-status" :class="{ 'insane-free': s.status.includes('免费')||s.status.includes('开源') }">{{ s.status }}</span>
            </div>
            <p class="insane-desc">{{ s.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 31. 数字肉身 - 模拟人类操作 -->
      <section data-section="body" class="evo-section">
        <h2 class="section-title"><span class="s-icon">31</span> 数字肉身 · 模拟人类操作</h2>
        <p class="section-desc">AI看屏幕、动鼠标、点按钮、填表单——不是在模拟接口，而是在操作真实的图形界面。这是AI融入物理世界之前的最后一站。</p>
        <div class="body-grid">
          <div v-for="(s, i) in digitalBody" :key="s.name" class="body-card" :class="{ visible: visibleSections['body'] }" :style="{ '--delay': `${i*0.07}s` }">
            <div class="body-head">
              <span class="body-name">{{ s.name }}</span>
              <span class="body-status" :class="{ 'body-free': s.status.includes('免费')||s.status.includes('开源') }">{{ s.status }}</span>
            </div>
            <p class="body-desc">{{ s.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 结尾总结 -->
      <section data-section="summary" class="evo-section summary-section">
        <div class="summary-card" :class="{ visible: visibleSections['summary'] }">
          <svg class="summary-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          <p>AI的进化是<strong>纵向深度</strong>（L1-L5能力层级）与<strong>横向广度</strong>（多模态/Agent/具身/世界模型）的协同跃迁。从聊天到科学发现，从软件到物理世界，每一步解锁新的可能性。2026年，我们正站在Agent与推理能力爆发的奇点上。</p>
          <p class="summary-attribution">参考来源：Google DeepMind、OpenAI、Anthropic、Meta、DeepSeek、阿里通义研究成果及公开发表论文。信息截止2026年中。</p>
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
  padding: 28px 20px 22px;
  text-align: center;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -40%;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 280px;
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
  margin-bottom: 4px;
  position: relative;
}

.hero-subtitle {
  font-size: 12px;
  color: var(--text-tertiary);
  position: relative;
}

.evo-content {
  padding: 0 16px 40px;
}

.evo-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.s-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(99,102,241,0.15);
  color: var(--accent);
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.section-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
  line-height: 1.55;
  padding-left: 38px;
}

/* Level stairs */
.level-stairs { display: flex; flex-direction: column; gap: 0; }
.level-card {
  position: relative; display: flex; gap: 12px; padding: 14px 4px 14px 0;
  border-left: 2px solid transparent; opacity: 0; transform: translateX(-12px);
  transition: all 0.45s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.level-card.visible { opacity: 1; transform: translateX(0); }
.level-badge {
  width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  margin-left: -21px; z-index: 1;
}
.level-body { flex: 1; min-width: 0; }
.level-head { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; margin-bottom: 2px; }
.level-id { font-size: 14px; font-weight: 800; }
.level-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
.level-subtitle { font-size: 10px; color: var(--text-tertiary); }
.level-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.6; }
.level-line { position: absolute; left: 0; top: 50px; bottom: -6px; width: 2px; background: linear-gradient(to bottom, var(--color), transparent); opacity: 0.25; }
.level-line.last { display: none; }

/* DeepMind gauge */
.deepmind-gauge { opacity: 0; transform: translateY(10px); transition: all 0.45s cubic-bezier(0.22,0.61,0.36,1); }
.deepmind-gauge.visible { opacity: 1; transform: translateY(0); }
.gauge-track { display: flex; flex-direction: column; gap: 12px; }
.gauge-step {
  display: flex; align-items: flex-start; gap: 10px; opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.deepmind-gauge.visible .gauge-step { opacity: 1; transform: translateX(0); }
.gauge-dot {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.gauge-num { font-size: 12px; font-weight: 800; color: #fff; }
.gauge-info { display: flex; flex-direction: column; gap: 1px; }
.gauge-level { font-size: 11px; font-weight: 700; }
.gauge-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.gauge-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* Model grid */
.model-grid { display: flex; flex-direction: column; gap: 8px; }
.model-card {
  padding: 12px 14px; border-radius: 12px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.model-card.visible { opacity: 1; transform: translateY(0); }
.model-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
.model-name { font-size: 14px; font-weight: 700; }
.model-org { font-size: 10px; color: var(--text-tertiary); }
.model-models { font-size: 10px; color: var(--text-tertiary); margin-bottom: 4px; font-family: monospace; }
.model-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; }

/* Architecture list */
.arch-list { display: flex; flex-direction: column; gap: 8px; }
.arch-card {
  padding: 12px 14px; border-radius: 12px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.arch-card.visible { opacity: 1; transform: translateX(0); }
.arch-head { margin-bottom: 3px; }
.arch-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
.arch-subtitle { font-size: 10px; color: var(--accent); margin-left: 6px; font-weight: 500; }
.arch-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 6px; }
.arch-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.arch-tag { font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(99,102,241,0.1); color: var(--accent); }

/* Training grid */
.training-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.train-card {
  padding: 10px 12px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); border-top: 2px solid transparent;
  opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.train-card.visible { opacity: 1; transform: translateY(0); }
.train-title { display: block; font-size: 12px; font-weight: 700; margin-bottom: 1px; }
.train-subtitle { display: block; font-size: 9px; color: var(--text-tertiary); margin-bottom: 4px; }
.train-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* Reasoning list */
.reasoning-list { display: flex; flex-direction: column; gap: 8px; }
.reason-card {
  display: flex; gap: 10px; padding: 10px 14px; border-radius: 10px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
  align-items: flex-start;
}
.reason-card.visible { opacity: 1; transform: translateX(0); }
.reason-card svg { margin-top: 2px; flex-shrink: 0; }
.reason-title { display: block; font-size: 12px; font-weight: 700; color: var(--text-primary); }
.reason-subtitle { display: block; font-size: 10px; color: var(--accent); margin-bottom: 2px; }
.reason-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* Multimodal grid */
.multimodal-grid { display: flex; flex-direction: column; gap: 8px; }
.mm-card {
  padding: 12px 14px; border-radius: 12px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.mm-card.visible { opacity: 1; transform: translateY(0); }
.mm-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
.mm-subtitle { font-size: 10px; color: var(--accent); margin-left: 6px; }
.mm-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin: 4px 0 6px; }
.mm-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.mm-tag { font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(99,102,241,0.1); color: var(--accent); }

/* Agent grid */
.agent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.agent-card {
  padding: 10px 12px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); border-left: 3px solid var(--color);
  opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.agent-card.visible { opacity: 1; transform: translateY(0); }
.agent-title { display: block; font-size: 12px; font-weight: 700; margin-bottom: 1px; }
.agent-subtitle { display: block; font-size: 9px; color: var(--text-tertiary); margin-bottom: 4px; }
.agent-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* RAG list */
.rag-list { display: flex; flex-direction: column; gap: 8px; }
.rag-card {
  display: flex; gap: 10px; padding: 10px 14px; border-radius: 10px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
  align-items: flex-start;
}
.rag-card.visible { opacity: 1; transform: translateX(0); }
.rag-card svg { margin-top: 2px; flex-shrink: 0; }
.rag-title { display: block; font-size: 12px; font-weight: 700; color: var(--text-primary); }
.rag-subtitle { display: block; font-size: 10px; color: var(--accent); margin-bottom: 2px; }
.rag-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* Safety grid */
.safety-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.safety-card {
  padding: 10px 12px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); border-left: 3px solid var(--color);
  opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.safety-card.visible { opacity: 1; transform: translateY(0); }
.safety-title { display: block; font-size: 12px; font-weight: 700; margin-bottom: 1px; }
.safety-subtitle { display: block; font-size: 9px; color: var(--text-tertiary); margin-bottom: 4px; }
.safety-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* Science grid */
.science-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.sci-card {
  padding: 10px 12px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); border-top: 2px solid var(--color);
  opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.sci-card.visible { opacity: 1; transform: translateY(0); }
.sci-title { display: block; font-size: 12px; font-weight: 700; margin-bottom: 1px; }
.sci-subtitle { display: block; font-size: 9px; color: var(--text-tertiary); margin-bottom: 4px; }
.sci-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* Embodied grid */
.embodied-grid { display: flex; flex-direction: column; gap: 8px; }
.emb-card {
  padding: 12px 14px; border-radius: 12px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); border-left: 3px solid var(--color);
  opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.emb-card.visible { opacity: 1; transform: translateX(0); }
.emb-title { font-size: 13px; font-weight: 700; }
.emb-subtitle { font-size: 10px; color: var(--text-tertiary); margin-left: 6px; }
.emb-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-top: 4px; }

/* Horizontal */
.horizontal-grid { display: flex; flex-direction: column; gap: 10px; }
.h-card {
  display: flex; gap: 12px; padding: 14px; background: var(--bg-secondary);
  border-radius: 12px; border: 1px solid var(--border-color); opacity: 0; transform: translateY(8px);
  transition: all 0.4s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.h-card.visible { opacity: 1; transform: translateY(0); }
.h-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.h-text { flex: 1; min-width: 0; }
.h-title { display: block; font-size: 13px; font-weight: 700; color: var(--text-primary); }
.h-subtitle { display: block; font-size: 10px; color: var(--color); font-weight: 500; margin-bottom: 4px; }
.h-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; }

/* Ecosystem grid */
.eco-grid { display: flex; flex-direction: column; gap: 8px; }
.eco-card {
  display: flex; gap: 10px; padding: 12px 14px; border-radius: 12px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
  align-items: flex-start;
}
.eco-card.visible { opacity: 1; transform: translateY(0); }
.eco-card svg { margin-top: 2px; flex-shrink: 0; }
.eco-title { display: block; font-size: 12px; font-weight: 700; color: var(--text-primary); }
.eco-subtitle { display: block; font-size: 10px; color: var(--accent); margin-bottom: 2px; }
.eco-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* Future grid */
.future-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.future-card {
  padding: 12px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); border-top: 2px solid var(--color);
  opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.future-card.visible { opacity: 1; transform: translateY(0); }
.future-title { display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px; }
.future-content { font-size: 10px; color: var(--text-secondary); line-height: 1.5; }

/* Finetuning */
.ft-grid { display: flex; flex-direction: column; gap: 8px; }
.ft-card {
  padding: 10px 14px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.ft-card.visible { opacity: 1; transform: translateY(0); }
.ft-title { font-size: 12px; font-weight: 700; color: var(--accent); }
.ft-subtitle { font-size: 10px; color: var(--text-tertiary); margin-left: 6px; }
.ft-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.5; margin: 3px 0 6px; }
.ft-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.ft-tag { font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(99,102,241,0.08); color: var(--accent); }

/* Inference */
.infra-grid { display: flex; flex-direction: column; gap: 9px; }
.infra-card {
  padding: 12px 14px; border-radius: 12px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); border-left: 3px solid transparent;
  opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.infra-card.visible { opacity: 1; transform: translateX(0); }
.infra-title { display: block; font-size: 13px; font-weight: 700; }
.infra-subtitle { display: block; font-size: 10px; color: var(--text-tertiary); margin-bottom: 2px; }
.infra-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 6px; }
.infra-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.infra-tag { font-size: 9px; padding: 2px 6px; border-radius: 4px; }

/* Free Arsenal */
.free-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.free-card {
  padding: 10px 10px; border-radius: 10px; background: rgba(34,197,94,0.04);
  border: 1px solid rgba(34,197,94,0.15); opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
  position: relative; overflow: hidden;
}
.free-card.visible { opacity: 1; transform: translateY(0); }
.free-badge {
  position: absolute; top: 6px; right: 8px; font-size: 8px; font-weight: 800;
  padding: 1px 5px; border-radius: 3px; background: #22c55e; color: #fff; letter-spacing: 0.5px;
}
.free-body { padding-right: 32px; }
.free-title { display: block; font-size: 12px; font-weight: 700; color: #22c55e; }
.free-subtitle { display: block; font-size: 9px; color: var(--text-tertiary); margin-bottom: 4px; }
.free-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* Nuclear */
.nuke-grid { display: flex; flex-direction: column; gap: 10px; }
.nuke-card {
  padding: 14px; border-radius: 14px; background: var(--bg-secondary);
  border: 1px solid; opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.nuke-card.visible { opacity: 1; transform: translateY(0); }
.nuke-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.nuke-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nuke-title { display: block; font-size: 13px; font-weight: 700; }
.nuke-subtitle { display: block; font-size: 10px; color: var(--text-tertiary); font-style: italic; }
.nuke-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 8px; }
.nuke-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.nuke-tag { font-size: 9px; padding: 3px 8px; border-radius: 4px; border: 1px solid currentColor; font-weight: 500; }

/* Original ideas */
.original-grid { display: flex; flex-direction: column; gap: 10px; }
.orig-card {
  padding: 14px; border-radius: 14px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); border-left: 3px solid var(--color);
  opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.orig-card.visible { opacity: 1; transform: translateX(0); }
.orig-icon-wrap { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.orig-num { font-size: 11px; font-weight: 800; color: var(--text-tertiary); font-variant-numeric: tabular-nums; font-family: monospace; }
.orig-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.orig-body { flex: 1; min-width: 0; }
.orig-title { display: block; font-size: 14px; font-weight: 700; }
.orig-subtitle { display: block; font-size: 10px; color: var(--text-tertiary); margin-bottom: 4px; font-style: italic; }
.orig-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 8px; }
.orig-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.orig-tag { font-size: 9px; padding: 2px 8px; border-radius: 4px; background: rgba(99,102,241,0.08); color: var(--accent); border: 1px solid rgba(99,102,241,0.15); }

/* Fire-and-Forget */
.ff-hero {
  display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 14px;
  background: var(--bg-secondary); border: 2px solid; margin-bottom: 14px;
}
.ff-hero-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ff-title { font-size: 17px; font-weight: 800; }
.ff-subtitle { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
.ff-problem {
  font-size: 12px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 14px;
  padding: 12px 14px; border-radius: 10px; background: rgba(99,102,241,0.04);
  border: 1px dashed var(--border-color); opacity: 0; transform: translateY(8px);
  transition: all 0.4s cubic-bezier(0.22,0.61,0.36,1);
}
.ff-problem.visible { opacity: 1; transform: translateY(0); }
.ff-steps { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.ff-step {
  display: flex; gap: 10px; padding: 10px 12px; border-radius: 10px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
  align-items: flex-start;
}
.ff-step.visible { opacity: 1; transform: translateX(0); }
.ff-step-num {
  width: 22px; height: 22px; border-radius: 50%; background: var(--accent);
  color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; margin-top: 1px;
}
.ff-step-title { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.ff-step-detail { font-size: 10px; color: var(--text-secondary); line-height: 1.55; margin-top: 2px; }
.ff-run {
  opacity: 0; transform: translateY(8px);
  transition: all 0.4s cubic-bezier(0.22,0.61,0.36,1);
}
.ff-run.visible { opacity: 1; transform: translateY(0); }
.ff-cmd {
  display: block; padding: 10px 14px; border-radius: 8px; background: #1a1a2e;
  border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; font-size: 11px;
  font-family: monospace; line-height: 1.6; word-break: break-all;
}

/* Cognitive Compilation */
.cc-hero {
  text-align: center; padding: 20px 14px 16px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(239,68,68,0.06), rgba(99,102,241,0.04));
  border: 1px solid rgba(239,68,68,0.15); margin-bottom: 16px;
  opacity: 0; transform: translateY(10px);
  transition: all 0.45s cubic-bezier(0.22,0.61,0.36,1);
}
.cc-hero.visible { opacity: 1; transform: translateY(0); }
.cc-badge {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 900;
  color: #fff; letter-spacing: 2px; margin-bottom: 10px;
}
.cc-title { font-size: 22px; font-weight: 800; color: var(--text-primary); }
.cc-sub { font-size: 11px; color: var(--text-tertiary); margin: 2px 0 6px; font-style: italic; }
.cc-tagline { font-size: 12px; font-weight: 600; margin-bottom: 8px; }
.cc-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.65; max-width: 92%; margin: 0 auto; }
.cc-pipeline { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.cc-stage {
  padding: 12px 14px; border-radius: 12px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.cc-stage.visible { opacity: 1; transform: translateX(0); }
.cc-stage-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.cc-stage-num {
  display: inline-flex; width: 20px; height: 20px; border-radius: 50%;
  background: rgba(239,68,68,0.15); color: #ef4444; font-size: 10px; font-weight: 700;
  align-items: center; justify-content: center; flex-shrink: 0;
}
.cc-stage-title { font-size: 12px; font-weight: 700; color: #ef4444; }
.cc-stage-content { font-size: 10px; color: var(--text-secondary); line-height: 1.55; }
.cc-result {
  display: flex; gap: 10px; padding: 14px; border-radius: 12px;
  background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2);
  opacity: 0; transform: translateY(8px);
  transition: all 0.4s cubic-bezier(0.22,0.61,0.36,1);
  align-items: flex-start;
}
.cc-result.visible { opacity: 1; transform: translateY(0); }
.cc-result svg { flex-shrink: 0; margin-top: 1px; }
.cc-result p { font-size: 11px; color: var(--text-secondary); line-height: 1.65; }

/* Global Tech */
.global-tabs { display: flex; flex-direction: column; gap: 14px; }
.gtab-section { opacity: 0; transform: translateY(8px); transition: all 0.4s cubic-bezier(0.22,0.61,0.36,1); }
.gtab-section.visible { opacity: 1; transform: translateY(0); }
.gtab-header { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; border: 1px solid; margin-bottom: 8px; }
.gtab-flag { display: inline-flex; width: 24px; height: 24px; border-radius: 6px; font-size: 9px; font-weight: 800; align-items: center; justify-content: center; flex-shrink: 0; }
.gtab-region { font-size: 14px; font-weight: 700; }
.gtab-count { font-size: 10px; color: var(--text-tertiary); margin-left: auto; }
.gtab-items { display: flex; flex-direction: column; gap: 7px; }
.gtab-item { padding: 9px 12px; border-radius: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); }
.gtab-item-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 2px; }
.gtab-name { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.gtab-status { font-size: 9px; padding: 1px 6px; border-radius: 3px; font-weight: 600; white-space: nowrap; }
.gtab-free { background: rgba(34,197,94,0.12); color: #22c55e; }
.gtab-paid { background: rgba(239,68,68,0.1); color: #ef4444; }
.gtab-org { font-size: 9px; color: var(--text-tertiary); display: block; margin-bottom: 2px; }
.gtab-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.45; }

/* Free vs Paid */
.fp-grid { display: flex; flex-direction: column; gap: 9px; }
.fp-card {
  padding: 12px 14px; border-radius: 12px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.fp-card.visible { opacity: 1; transform: translateY(0); }
.fp-paid { font-size: 11px; font-weight: 600; color: #ef4444; display: flex; align-items: center; gap: 4px; margin-bottom: 3px; }
.fp-arrow { display: flex; justify-content: center; margin: 2px 0; }
.fp-free { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
.fp-free-name { font-size: 12px; font-weight: 700; color: #22c55e; }
.fp-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 6px; }
.fp-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.fp-tag { font-size: 8px; padding: 2px 6px; border-radius: 3px; background: rgba(34,197,94,0.1); color: #22c55e; font-weight: 600; }

/* Insane Processing */
.insane-grid { display: flex; flex-direction: column; gap: 9px; }
.insane-card {
  padding: 12px 14px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.insane-card.visible { opacity: 1; transform: translateY(0); }
.insane-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px; }
.insane-name { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.insane-status { font-size: 9px; padding: 1px 6px; border-radius: 3px; font-weight: 600; white-space: nowrap; }
.insane-free { background: rgba(34,197,94,0.12); color: #22c55e; }
.insane-paid { background: rgba(239,68,68,0.1); color: #ef4444; }
.insane-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.5; }

/* Silicon Flesh */
.flesh-grid { display: flex; flex-direction: column; gap: 9px; }
.flesh-card {
  padding: 12px 14px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.flesh-card.visible { opacity: 1; transform: translateY(0); }
.flesh-name { font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 3px; }
.flesh-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 5px; }
.flesh-status { font-size: 8px; padding: 2px 6px; border-radius: 3px; font-weight: 600; }
.flesh-free { background: rgba(34,197,94,0.1); color: #22c55e; }
.flesh-paid { background: rgba(239,68,68,0.1); color: #ef4444; }

/* Digital Body */
.body-grid { display: flex; flex-direction: column; gap: 9px; }
.body-card {
  padding: 12px 14px; border-radius: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-color); opacity: 0; transform: translateY(8px);
  transition: all 0.35s cubic-bezier(0.22,0.61,0.36,1); transition-delay: var(--delay);
}
.body-card.visible { opacity: 1; transform: translateY(0); }
.body-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px; }
.body-name { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.body-status { font-size: 9px; padding: 1px 6px; border-radius: 3px; font-weight: 600; white-space: nowrap; }
.body-free { background: rgba(34,197,94,0.12); color: #22c55e; }
.body-paid { background: rgba(239,68,68,0.1); color: #ef4444; }
.body-desc { font-size: 10px; color: var(--text-secondary); line-height: 1.5; }

/* Summary */
.summary-section { margin-top: 6px; margin-bottom: 6px; }
.summary-card {
  background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08));
  border: 1px solid rgba(99,102,241,0.2); border-radius: 16px; padding: 22px 18px;
  text-align: center; opacity: 0; transform: translateY(10px);
  transition: all 0.45s cubic-bezier(0.22,0.61,0.36,1);
}
.summary-card.visible { opacity: 1; transform: translateY(0); }
.summary-icon { margin-bottom: 10px; }
.summary-card p { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
.summary-attribution { margin-top: 10px; font-size: 10px !important; color: var(--text-tertiary) !important; }
</style>
