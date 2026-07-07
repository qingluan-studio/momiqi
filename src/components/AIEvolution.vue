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
