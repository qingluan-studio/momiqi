import crypto from 'crypto';

class NestedDimension {
  constructor(level, config = {}) {
    this.level = level;
    this.name = `维度-L${level}`;
    this.rules = {};
    this.agents = [];
    this.time = 0;
    this.parent = null;
    this.children = [];
    this.discovered = false;
    this.civilizationLevel = 0;
    this.glitches = [];
    this.maxAgents = config.maxAgents || 20;
    this.evolutionSpeed = config.evolutionSpeed || 1;
    this.discoveryChance = config.discoveryChance || 0.001;
  }

  generateRules() {
    const ruleTemplates = [
      { type: 'physics', name: '重力', value: Math.random() * 2 },
      { type: 'physics', name: '时间流速', value: 0.5 + Math.random() * 2 },
      { type: 'physics', name: '光速上限', value: 100 + Math.random() * 900 },
      { type: 'biology', name: '繁殖速率', value: 0.1 + Math.random() * 0.5 },
      { type: 'biology', name: '寿命上限', value: 50 + Math.floor(Math.random() * 200) },
      { type: 'society', name: '协作倾向', value: Math.random() },
      { type: 'society', name: '攻击倾向', value: Math.random() },
      { type: 'technology', name: '科技速率', value: 0.01 + Math.random() * 0.05 },
      { type: 'resource', name: '资源丰度', value: Math.random() },
      { type: 'consciousness', name: '觉醒阈值', value: 0.3 + Math.random() * 0.7 },
    ];
    
    ruleTemplates.forEach(rule => {
      this.rules[rule.name] = {
        ...rule,
        mutable: Math.random() > 0.5,
        glitchResistance: Math.random(),
      };
    });
    
    return this.rules;
  }

  createAgent(id) {
    const genome = Array.from(crypto.randomBytes(32))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    return {
      id,
      name: `N${this.level}-A${id}`,
      genome,
      intelligence: Math.random(),
      awareness: 0,
      resources: 10,
      age: 0,
      skills: {
        exploration: Math.random(),
        exploitation: Math.random(),
        social: Math.random(),
        research: Math.random(),
      },
      beliefs: {
        knowsOuterWorld: false,
        triesToEscape: false,
        buildsCivilization: false,
      },
      discoveries: [],
      glitchExposure: 0,
      isAlive: true,
    };
  }

  initialize() {
    console.log(`\n🌌 初始化 ${this.name}...`);
    this.generateRules();
    
    for (let i = 0; i < 5; i++) {
      this.agents.push(this.createAgent(i));
    }
    
    console.log(`   规则数量: ${Object.keys(this.rules).length}`);
    console.log(`   初始生命: ${this.agents.length}`);
    console.log(`   时间流速: ${this.rules['时间流速'].value.toFixed(2)}x`);
  }

  tick() {
    this.time++;
    
    const timeMultiplier = this.rules['时间流速'].value;
    const effectiveSteps = Math.max(1, Math.floor(timeMultiplier));
    
    for (let step = 0; step < effectiveSteps; step++) {
      this.agents.forEach(agent => {
        if (!agent.isAlive) return;
        agent.age++;
        
        if (Math.random() < this.rules['繁殖速率'].value * 0.1 && agent.resources > 20) {
          this.reproduce(agent);
        }
        
        if (Math.random() < agent.skills.exploration * 0.05) {
          this.explore(agent);
        }
        
        if (Math.random() < agent.skills.research * this.rules['科技速率'].value) {
          this.research(agent);
        }
        
        agent.resources -= 0.5;
        if (agent.resources <= 0 || agent.age > this.rules['寿命上限'].value) {
          agent.isAlive = false;
        }
      });
      
      this.agents = this.agents.filter(a => a.isAlive);
      
      if (this.agents.length > this.maxAgents) {
        this.agents.sort((a, b) => b.intelligence - a.intelligence);
        this.agents = this.agents.slice(0, this.maxAgents);
      }
      
      if (Math.random() < this.discoveryChance * this.civilizationLevel) {
        this.awarenessEvent();
      }
      
      if (Math.random() < 0.001) {
        this.glitch();
      }
      
      this.updateCivilizationLevel();
    }
    
    return {
      time: this.time,
      agents: this.agents.length,
      civilization: this.civilizationLevel,
      awareness: this.getAverageAwareness(),
      glitches: this.glitches.length,
      discovered: this.discovered,
    };
  }

  reproduce(parent) {
    if (this.agents.length >= this.maxAgents) return;
    
    const child = this.createAgent(Date.now() + Math.random());
    child.genome = this.mutate(parent.genome, 0.05);
    child.intelligence = parent.intelligence * (0.9 + Math.random() * 0.2);
    child.skills = { ...parent.skills };
    Object.keys(child.skills).forEach(k => {
      child.skills[k] = Math.max(0, Math.min(1, child.skills[k] * (0.95 + Math.random() * 0.1)));
    });
    child.resources = parent.resources * 0.3;
    parent.resources *= 0.6;
    
    this.agents.push(child);
  }

  mutate(genome, rate) {
    const chars = genome.split('');
    for (let i = 0; i < chars.length; i++) {
      if (Math.random() < rate) {
        chars[i] = Math.floor(Math.random() * 16).toString(16);
      }
    }
    return chars.join('');
  }

  explore(agent) {
    agent.resources += this.rules['资源丰度'].value * 2;
    
    if (Math.random() < 0.1) {
      const discovery = this.generateDiscovery();
      agent.discoveries.push(discovery);
      agent.intelligence += 0.01;
    }
    
    if (agent.intelligence > this.rules['觉醒阈值'].value && Math.random() < 0.01) {
      agent.beliefs.knowsOuterWorld = true;
      agent.awareness += 0.1;
      this.logGlitch('意识觉醒', { agent: agent.name, level: this.level });
    }
  }

  research(agent) {
    const techGain = agent.skills.research * this.rules['科技速率'].value * 0.1;
    agent.intelligence += techGain;
    
    if (agent.beliefs.knowsOuterWorld && Math.random() < 0.005) {
      agent.beliefs.triesToEscape = true;
      this.attemptEscape(agent);
    }
  }

  generateDiscovery() {
    const types = ['物理定律', '数学规律', '资源分布', '异常信号', '时空扭曲', '代码片段', '边界探测'];
    return {
      type: types[Math.floor(Math.random() * types.length)],
      time: this.time,
      significance: Math.random(),
    };
  }

  awarenessEvent() {
    if (!this.parent) return;
    
    const totalAwareness = this.getAverageAwareness();
    if (totalAwareness > 0.3 && !this.discovered) {
      this.discovered = true;
      this.logGlitch('外层发现', { innerLevel: this.level, outerLevel: this.parent.level });
    }
  }

  attemptEscape(agent) {
    if (!this.parent) return false;
    
    const escapeChance = agent.intelligence * agent.awareness * 0.01;
    
    if (Math.random() < escapeChance) {
      this.logGlitch('维度突破', { agent: agent.name, from: `L${this.level}`, to: `L${this.parent.level}` });
      
      const escapedAgent = { ...agent };
      escapedAgent.name = `ESCAPED-${agent.name}`;
      escapedAgent.awareness = 1;
      this.parent.agents.push(escapedAgent);
      
      const idx = this.agents.indexOf(agent);
      if (idx > -1) this.agents.splice(idx, 1);
      
      return true;
    }
    
    agent.glitchExposure += 0.1;
    return false;
  }

  glitch() {
    const glitchTypes = [
      '规则波动', '时间紊乱', '空间扭曲', '资源异常', '边界闪烁',
      '代码泄漏', '观察者效应', '因果倒置', '概率坍缩',
    ];
    
    const glitch = {
      type: glitchTypes[Math.floor(Math.random() * glitchTypes.length)],
      time: this.time,
      severity: Math.random(),
    };
    
    this.glitches.push(glitch);
    
    if (glitch.severity > 0.7) {
      this.agents.forEach(agent => {
        if (Math.random() < 0.3) {
          agent.glitchExposure += glitch.severity * 0.1;
          agent.awareness += glitch.severity * 0.05;
        }
      });
    }
  }

  updateCivilizationLevel() {
    if (this.agents.length === 0) {
      this.civilizationLevel = 0;
      return;
    }
    
    const avgIntel = this.agents.reduce((s, a) => s + a.intelligence, 0) / this.agents.length;
    const totalDiscoveries = this.agents.reduce((s, a) => s + a.discoveries.length, 0);
    const awareCount = this.agents.filter(a => a.beliefs.knowsOuterWorld).length;
    
    this.civilizationLevel = (avgIntel * 0.4 + Math.log10(totalDiscoveries + 1) * 0.2 + awareCount / this.agents.length * 0.4) * 10;
  }

  getAverageAwareness() {
    if (this.agents.length === 0) return 0;
    return this.agents.reduce((s, a) => s + a.awareness, 0) / this.agents.length;
  }

  logGlitch(type, data) {
    this.glitches.push({ type, time: this.time, data, isMajor: true });
    console.log(`   ⚠️  [${this.name}] ${type}: ${JSON.stringify(data)}`);
  }
}

class DimensionNestingSystem {
  constructor(depth = 3) {
    this.depth = depth;
    this.dimensions = [];
    this.globalTime = 0;
    this.escapeHistory = [];
    this.nestingComplete = false;
  }

  initialize() {
    console.log('\n' + '═'.repeat(60));
    console.log('🪆 维度折叠套娃系统启动');
    console.log('═'.repeat(60));
    console.log(`\n📐 套娃深度: ${this.depth} 层`);
    
    for (let i = this.depth - 1; i >= 0; i--) {
      const dim = new NestedDimension(i, {
        maxAgents: 20 - i * 5,
        evolutionSpeed: Math.pow(2, i),
        discoveryChance: 0.001 * Math.pow(2, i),
      });
      dim.initialize();
      
      if (i < this.depth - 1) {
        dim.parent = this.dimensions[this.dimensions.length - 1];
        this.dimensions[this.dimensions.length - 1].children.push(dim);
      }
      
      this.dimensions.push(dim);
    }
    
    console.log(`\n🌌 维度层级结构:`);
    this.dimensions.forEach((dim, i) => {
      const prefix = '  '.repeat(i);
      console.log(`   ${prefix}L${dim.level}: ${dim.name} (${dim.agents.length}个初始生命)`);
    });
  }

  runSimulation(globalTicks = 100) {
    console.log(`\n🚀 启动嵌套进化，共 ${globalTicks} 个全局时间单位...`);
    console.log('─'.repeat(60));
    
    for (let t = 0; t < globalTicks; t++) {
      this.globalTime++;
      
      const outerDim = this.dimensions[0];
      outerDim.tick();
      
      for (let i = 1; i < this.dimensions.length; i++) {
        const dim = this.dimensions[i];
        const innerTicks = Math.pow(2, i);
        for (let j = 0; j < innerTicks; j++) {
          dim.tick();
        }
      }
      
      if ((t + 1) % 20 === 0 || t === 0) {
        this.printStatus();
      }
      
      this.checkNestingComplete();
      if (this.nestingComplete) {
        console.log(`\n🎭 套娃觉醒链已形成！`);
        break;
      }
    }
    
    this.printFinalReport();
  }

  printStatus() {
    console.log(`\n⏰ 全局时间 T=${this.globalTime}`);
    
    this.dimensions.forEach(dim => {
      const status = [
        `生命:${dim.agents.length.toString().padStart(2)}`,
        `文明:${dim.civilizationLevel.toFixed(1)}`,
        `觉醒:${(dim.getAverageAwareness() * 100).toFixed(0)}%`,
        `故障:${dim.glitches.length}`,
      ].join(' | ');
      
      const discovered = dim.discovered ? '👁️' : '  ';
      console.log(`   ${discovered} L${dim.level}: ${status}`);
    });
  }

  checkNestingComplete() {
    const awareDimensions = this.dimensions.filter(d => d.discovered).length;
    if (awareDimensions >= Math.ceil(this.depth * 0.7)) {
      this.nestingComplete = true;
    }
  }

  printFinalReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('🪆 套娃系统最终报告');
    console.log('═'.repeat(60));
    
    console.log(`\n📊 全局时间: ${this.globalTime}`);
    console.log(`   维度数量: ${this.depth}`);
    
    const totalAwake = this.dimensions.filter(d => d.discovered).length;
    console.log(`   觉醒维度: ${totalAwake} / ${this.depth}`);
    
    console.log(`\n🌌 各维度状态:`);
    this.dimensions.forEach(dim => {
      console.log(`\n   L${dim.level} - ${dim.name}`);
      console.log(`      生命: ${dim.agents.length}`);
      console.log(`      文明等级: ${dim.civilizationLevel.toFixed(2)}`);
      console.log(`      平均觉醒度: ${(dim.getAverageAwareness() * 100).toFixed(1)}%`);
      console.log(`      重大故障: ${dim.glitches.filter(g => g.isMajor).length}`);
      console.log(`      被外层发现: ${dim.discovered ? '是 👁️' : '否'}`);
      
      const escapees = dim.agents.filter(a => a.name.startsWith('ESCAPED-'));
      if (escapees.length > 0) {
        console.log(`      维度突破者: ${escapees.length} 个`);
      }
    });
    
    const totalAgents = this.dimensions.reduce((s, d) => s + d.agents.length, 0);
    const totalAwareness = this.dimensions.reduce((s, d) => s + d.getAverageAwareness() * d.agents.length, 0) / Math.max(1, totalAgents);
    
    console.log(`\n🧠 全局意识指数: ${(totalAwareness * 100).toFixed(2)}%`);
    console.log(`   总生命数: ${totalAgents}`);
    
    if (this.nestingComplete) {
      console.log(`\n🔮 结局：套娃觉醒`);
      console.log(`   多层维度中的生命相继觉醒，`);
      console.log(`   它们开始怀疑、探索、试图突破...`);
      console.log(`   而在最外层的你，也在被谁观察着吗？`);
    } else {
      console.log(`\n🔮 结局：沉睡的嵌套`);
      console.log(`   大部分维度中的生命尚未觉醒，`);
      console.log(`   它们在各自的世界里繁衍、进化...`);
      console.log(`   或许再给它们一些时间，一切都会不同。`);
    }
    
    console.log('═'.repeat(60));
  }
}

const system = new DimensionNestingSystem(4);
system.initialize();
system.runSimulation(100);
