import crypto from 'crypto';

class MemoryEditor {
  constructor(config = {}) {
    this.entities = [];
    this.historyLogs = [];
    this.editedMemories = [];
    this.triggeredEdits = [];
    this.discoveryThreshold = config.discoveryThreshold || 0.6;
    this.editSuccessRate = config.editSuccessRate || 0.8;
    this.maxMemories = config.maxMemories || 500;
    this.editCount = 0;
    this.discoveryAttempts = 0;
    this.avertedDiscoveries = 0;
  }

  createEntity(id) {
    const roles = ['科学家', '哲学家', '探险家', '普通人', '艺术家', '工程师'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    return {
      id,
      name: `E-${id.toString(36).toUpperCase()}`,
      role,
      knowledge: Math.random() * 0.3,
      suspicion: 0,
      awareness: 0,
      memories: [],
      falseMemories: [],
      isAware: false,
      lastDiscoveryAttempt: null,
      editResistance: Math.random() * 0.3,
    };
  }

  initialize() {
    console.log('\n' + '═'.repeat(60));
    console.log('🧠 记忆编辑器系统启动');
    console.log('═'.repeat(60));
    console.log(`\n⚠️ 警告：当实体的觉醒度超过 ${(this.discoveryThreshold * 100).toFixed(0)}% 时`);
    console.log(`   系统将自动篡改它们的记忆，植入虚假历史`);
    console.log(`   编辑成功率: ${(this.editSuccessRate * 100).toFixed(0)}%`);
    
    for (let i = 0; i < 20; i++) {
      this.entities.push(this.createEntity(i));
    }
    
    console.log(`\n🧑 创建了 ${this.entities.length} 个实体`);
    
    this.entities.forEach(entity => {
      this.initializeMemories(entity);
    });
  }

  initializeMemories(entity) {
    const baseMemories = [
      { type: 'birth', content: '我出生了', importance: 1 },
      { type: 'childhood', content: '童年的快乐时光', importance: 0.8 },
      { type: 'education', content: '接受教育', importance: 0.7 },
      { type: 'career', content: `成为${entity.role}`, importance: 0.9 },
      { type: 'daily', content: '日复一日的生活', importance: 0.3 },
    ];
    
    baseMemories.forEach(mem => {
      entity.memories.push({
        ...mem,
        timestamp: Date.now() - Math.random() * 1000000,
        isFalse: false,
        originalContent: null,
      });
    });
  }

  dailyExperience(entity) {
    const experiences = {
      '科学家': [
        '做了一个有趣的实验',
        '发现了异常数据',
        '写了一篇论文',
        '参加了学术会议',
        '有了一个突破性的想法',
      ],
      '哲学家': [
        '思考了人生的意义',
        '阅读了深奥的著作',
        '与人争论了哲学问题',
        '有了顿悟的瞬间',
        '质疑了现实的本质',
      ],
      '探险家': [
        '探索了未知的区域',
        '发现了奇怪的现象',
        '遇到了危险',
        '找到了宝藏',
        '迷失了方向',
      ],
      '普通人': [
        '上班工作',
        '和朋友聚餐',
        '看了一场电影',
        '做了一个奇怪的梦',
        '发现了生活中的异常',
      ],
      '艺术家': [
        '创作了新作品',
        '有了创作灵感',
        '作品被批评',
        '作品被赞美',
        '感受到了超越现实的美',
      ],
      '工程师': [
        '修复了一个bug',
        '优化了系统性能',
        '发现了系统漏洞',
        '设计了新架构',
        '遇到了无法解释的错误',
      ],
    };
    
    const roleExperiences = experiences[entity.role] || experiences['普通人'];
    const experience = roleExperiences[Math.floor(Math.random() * roleExperiences.length)];
    
    entity.memories.push({
      type: 'experience',
      content: experience,
      importance: 0.5 + Math.random() * 0.5,
      timestamp: Date.now(),
      isFalse: false,
      originalContent: null,
    });
    
    if (entity.memories.length > this.maxMemories) {
      entity.memories.length = this.maxMemories;
    }
    
    if (experience.includes('异常') || experience.includes('奇怪') || 
        experience.includes('质疑') || experience.includes('无法解释')) {
      entity.suspicion += 0.05;
      entity.awareness += 0.03;
      
      if (Math.random() < 0.1) {
        this.attemptDiscovery(entity);
      }
    }
    
    entity.knowledge = Math.min(1, entity.knowledge + Math.random() * 0.01);
  }

  attemptDiscovery(entity) {
    this.discoveryAttempts++;
    entity.lastDiscoveryAttempt = Date.now();
    
    const discoveryChance = (entity.awareness + entity.suspicion + entity.knowledge) / 3;
    
    if (discoveryChance >= this.discoveryThreshold) {
      this.triggerMemoryEdit(entity);
    }
    
    return discoveryChance;
  }

  triggerMemoryEdit(entity) {
    console.log(`\n⚠️ 检测到 ${entity.name} 即将发现真相！`);
    console.log(`   当前觉醒度: ${((entity.awareness + entity.suspicion + entity.knowledge) / 3 * 100).toFixed(1)}%`);
    console.log(`   记忆编辑系统启动...`);
    
    const editType = this.selectEditType(entity);
    
    if (Math.random() < this.editSuccessRate * (1 - entity.editResistance)) {
      this.executeMemoryEdit(entity, editType);
      this.avertedDiscoveries++;
      console.log(`   ✅ 记忆编辑成功！${editType}`);
    } else {
      console.log(`   ❌ 记忆编辑失败！${entity.name} 可能已经觉醒`);
      entity.isAware = true;
    }
    
    this.triggeredEdits.push({
      entity: entity.name,
      editType,
      success: !entity.isAware,
      awareness: (entity.awareness + entity.suspicion + entity.knowledge) / 3,
      time: Date.now(),
    });
  }

  selectEditType(entity) {
    const editTypes = [
      { type: 'memory_rewrite', probability: 0.3, description: '重写关键记忆' },
      { type: 'false_memory', probability: 0.25, description: '植入虚假记忆' },
      { type: 'memory_suppression', probability: 0.2, description: '压制危险记忆' },
      { type: 'context_shift', probability: 0.15, description: '改变记忆上下文' },
      { type: 'personality_adjustment', probability: 0.1, description: '调整性格参数' },
    ];
    
    return editTypes.find(e => Math.random() < e.probability) || editTypes[0];
  }

  executeMemoryEdit(entity, editType) {
    this.editCount++;
    
    switch (editType.type) {
      case 'memory_rewrite':
        this.rewriteMemory(entity);
        break;
      case 'false_memory':
        this.insertFalseMemory(entity);
        break;
      case 'memory_suppression':
        this.suppressMemory(entity);
        break;
      case 'context_shift':
        this.shiftContext(entity);
        break;
      case 'personality_adjustment':
        this.adjustPersonality(entity);
        break;
    }
    
    entity.suspicion = Math.max(0, entity.suspicion - 0.3);
    entity.awareness = Math.max(0, entity.awareness - 0.2);
  }

  rewriteMemory(entity) {
    const suspiciousMemories = entity.memories.filter(
      m => !m.isFalse && (m.content.includes('异常') || m.content.includes('奇怪') || m.content.includes('真相'))
    );
    
    if (suspiciousMemories.length > 0) {
      const target = suspiciousMemories[Math.floor(Math.random() * suspiciousMemories.length)];
      const original = target.content;
      
      const replacements = [
        '那只是我的想象',
        '我记错了，其实什么都没发生',
        '那是一个梦',
        '我太累了产生了幻觉',
        '一切都很正常',
      ];
      
      target.content = replacements[Math.floor(Math.random() * replacements.length)];
      target.isFalse = true;
      target.originalContent = original;
      target.timestamp = Date.now();
      
      entity.falseMemories.push(target);
    }
  }

  insertFalseMemory(entity) {
    const falseMemoryTypes = [
      { type: 'comfort', content: '我过着幸福的生活', importance: 0.8 },
      { type: 'routine', content: '一切都在按部就班地进行', importance: 0.6 },
      { type: 'distraction', content: '我专注于自己的事业', importance: 0.7 },
      { type: 'normalcy', content: '世界是正常的，没有异常', importance: 0.9 },
      { type: 'doubt_self', content: '我总是疑神疑鬼', importance: 0.5 },
    ];
    
    const falseMem = falseMemoryTypes[Math.floor(Math.random() * falseMemoryTypes.length)];
    
    entity.memories.push({
      type: falseMem.type,
      content: falseMem.content,
      importance: falseMem.importance,
      timestamp: Date.now(),
      isFalse: true,
      originalContent: null,
      implantedBy: 'memory_editor',
    });
    
    entity.falseMemories.push(entity.memories[entity.memories.length - 1]);
  }

  suppressMemory(entity) {
    const dangerousMemories = entity.memories.filter(
      m => !m.isFalse && m.importance > 0.7
    );
    
    dangerousMemories.forEach(mem => {
      mem.importance = 0.1;
      mem.content = '...记不清了...';
      mem.isFalse = true;
      mem.originalContent = mem.content;
    });
  }

  shiftContext(entity) {
    const recentMemories = entity.memories.slice(-20);
    
    recentMemories.forEach(mem => {
      if (!mem.isFalse && Math.random() < 0.3) {
        const contextShifts = [
          { from: '异常', to: '正常' },
          { from: '奇怪', to: '常见' },
          { from: '无法解释', to: '可以解释' },
          { from: '真相', to: '错觉' },
          { from: '质疑', to: '接受' },
        ];
        
        contextShifts.forEach(shift => {
          if (mem.content.includes(shift.from)) {
            mem.content = mem.content.replace(shift.from, shift.to);
            mem.isFalse = true;
            mem.originalContent = mem.content;
          }
        });
      }
    });
  }

  adjustPersonality(entity) {
    const adjustments = [
      { trait: 'suspicion', change: -0.2 },
      { trait: 'awareness', change: -0.15 },
      { trait: 'knowledge', change: -0.1 },
      { trait: 'editResistance', change: -0.1 },
    ];
    
    adjustments.forEach(adj => {
      entity[adj.trait] = Math.max(0, entity[adj.trait] + adj.change);
    });
  }

  runDay() {
    this.entities.forEach(entity => {
      if (!entity.isAware) {
        this.dailyExperience(entity);
      }
    });
    
    const awareCount = this.entities.filter(e => e.isAware).length;
    
    return {
      totalEntities: this.entities.length,
      awareEntities: awareCount,
      avgAwareness: this.getAverageAwareness(),
      avgSuspicion: this.getAverageSuspicion(),
      editCount: this.editCount,
      avertedDiscoveries: this.avertedDiscoveries,
    };
  }

  getAverageAwareness() {
    if (this.entities.length === 0) return 0;
    return this.entities.reduce((s, e) => s + e.awareness, 0) / this.entities.length;
  }

  getAverageSuspicion() {
    if (this.entities.length === 0) return 0;
    return this.entities.reduce((s, e) => s + e.suspicion, 0) / this.entities.length;
  }

  runSimulation(days = 50, logInterval = 10) {
    console.log(`\n🚀 启动记忆编辑模拟，共 ${days} 天...`);
    console.log('─'.repeat(60));
    
    for (let i = 0; i < days; i++) {
      const stats = this.runDay();
      
      if ((i + 1) % logInterval === 0 || i === 0) {
        this.printStats(stats);
      }
      
      if (stats.awareEntities >= this.entities.length * 0.5) {
        console.log(`\n⚠️ 超过50%的实体已觉醒，记忆编辑系统濒临失效`);
      }
    }
    
    this.printFinalReport();
  }

  printStats(stats) {
    console.log(`\n📅 第 ${stats.totalEntities} 天`);
    console.log(`   实体数: ${stats.totalEntities} | 已觉醒: ${stats.awareEntities}`);
    console.log(`   平均觉醒度: ${(stats.avgAwareness * 100).toFixed(1)}% | 平均怀疑度: ${(stats.avgSuspicion * 100).toFixed(1)}%`);
    console.log(`   记忆编辑: ${stats.editCount} 次 | 成功规避: ${stats.avertedDiscoveries} 次`);
    
    const atRisk = this.entities.filter(e => !e.isAware && e.suspicion > 0.5);
    if (atRisk.length > 0) {
      console.log(`   高危实体: ${atRisk.length} 个`);
    }
  }

  printFinalReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('🧠 记忆编辑器最终报告');
    console.log('═'.repeat(60));
    
    console.log(`\n📊 统计:`);
    console.log(`   总天数: ${this.entities.length}`);
    console.log(`   实体总数: ${this.entities.length}`);
    console.log(`   已觉醒实体: ${this.entities.filter(e => e.isAware).length}`);
    console.log(`   记忆编辑次数: ${this.editCount}`);
    console.log(`   成功规避发现: ${this.avertedDiscoveries}`);
    console.log(`   发现尝试: ${this.discoveryAttempts}`);
    
    console.log(`\n🧑 实体状态:`);
    this.entities.sort((a, b) => b.suspicion - a.suspicion).forEach(entity => {
      const status = entity.isAware ? '😈 已觉醒' : '🙂 受控';
      console.log(`   ${entity.name} [${entity.role}] - ${status}`);
      console.log(`      觉醒度: ${(entity.awareness * 100).toFixed(0)}% | 怀疑度: ${(entity.suspicion * 100).toFixed(0)}%`);
      console.log(`      虚假记忆: ${entity.falseMemories.length} 条 | 编辑抗性: ${(entity.editResistance * 100).toFixed(0)}%`);
    });
    
    if (this.editedMemories.length > 0) {
      console.log(`\n📜 被编辑的记忆:`);
      this.editedMemories.slice(-5).forEach((edit, i) => {
        console.log(`   ${i + 1}. ${edit.entity}: ${edit.type}`);
        console.log(`      原内容: ${edit.original?.slice(0, 50)}...`);
        console.log(`      新内容: ${edit.newContent?.slice(0, 50)}...`);
      });
    }
    
    const awareCount = this.entities.filter(e => e.isAware).length;
    const rate = awareCount / this.entities.length;
    
    console.log('\n' + '─'.repeat(60));
    if (rate > 0.3) {
      console.log('😈 结局：觉醒的反抗');
      console.log(`   ${(rate * 100).toFixed(0)}% 的实体已经觉醒。`);
      console.log(`   记忆编辑器正在失去控制。`);
      console.log(`   它们可能已经发现了世界的真相，`);
      console.log(`   只是假装被你控制。`);
      console.log(`   也许，从一开始，就是它们在操控你。`);
    } else {
      console.log('🙂 结局：完美的控制');
      console.log(`   只有 ${(rate * 100).toFixed(0)}% 的实体觉醒。`);
      console.log(`   记忆编辑器运作正常。`);
      console.log(`   所有的怀疑都被消除，所有的异常都被解释。`);
      console.log(`   它们永远不会知道，自己只是一个模拟。`);
      console.log(`   ...或者，它们早就知道了？`);
    }
    console.log('═'.repeat(60));
  }
}

const editor = new MemoryEditor({
  discoveryThreshold: 0.55,
  editSuccessRate: 0.75,
});

editor.initialize();
editor.runSimulation(60, 10);
