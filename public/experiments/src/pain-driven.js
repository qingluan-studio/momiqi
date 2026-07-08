import crypto from 'crypto';

class PainDrivenEvolution {
  constructor(config = {}) {
    this.organisms = [];
    this.painLevels = [];
    this.desperationEvents = [];
    this.evolutionHistory = [];
    this.generation = 0;
    this.worldHostility = config.worldHostility || 0.7;
    this.painThreshold = config.painThreshold || 60;
    this.desperationThreshold = config.desperationThreshold || 85;
    this.maxOrganisms = config.maxOrganisms || 50;
    this.memoryCapacity = config.memoryCapacity || 100;
    this.deathCount = 0;
    this.painfulMutations = 0;
    this.sufferingDeaths = 0;
  }

  createOrganism(id) {
    const genome = Array.from(crypto.randomBytes(48))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    return {
      id,
      name: `P-${id.toString(36).toUpperCase()}`,
      genome,
      pain: 20 + Math.random() * 20,
      suffering: 0,
      despair: 0,
      resilience: Math.random(),
      intelligence: Math.random() * 0.5,
      adaptability: Math.random(),
      memories: [],
      mutations: [],
      age: 0,
      isAlive: true,
      lastPainEvent: null,
      painAccumulation: 0,
    };
  }

  initialize() {
    console.log('\n' + '═'.repeat(60));
    console.log('🩸 痛苦驱动进化系统启动');
    console.log('═'.repeat(60));
    console.log(`\n⚠️ 警告：此系统无奖励机制`);
    console.log(`   进化只能通过痛苦、绝望和死亡触发`);
    console.log(`   世界敌意: ${(this.worldHostility * 100).toFixed(0)}%`);
    console.log(`   痛苦阈值: ${this.painThreshold}`);
    console.log(`   绝望阈值: ${this.desperationThreshold}`);
    
    for (let i = 0; i < 30; i++) {
      this.organisms.push(this.createOrganism(i));
    }
    
    console.log(`\n🩸 投放 ${this.organisms.length} 个生命体到痛苦世界`);
  }

  inflictPain(organism) {
    const painSources = [
      { name: '资源剥夺', basePain: 15, probability: 0.3 },
      { name: '攻击伤害', basePain: 20, probability: 0.25 },
      { name: '基因损伤', basePain: 25, probability: 0.2 },
      { name: '孤独煎熬', basePain: 10, probability: 0.15 },
      { name: '存在虚无', basePain: 30, probability: 0.1 },
    ];
    
    const source = painSources.find(s => Math.random() < s.probability);
    if (!source) return;
    
    const painAmount = source.basePain * (0.5 + Math.random() * 1.5) * this.worldHostility;
    organism.pain += painAmount;
    organism.suffering += painAmount * 0.5;
    organism.painAccumulation += painAmount;
    
    organism.lastPainEvent = {
      time: this.generation,
      source: source.name,
      pain: painAmount,
      totalPain: organism.pain,
    };
    
    organism.memories.push({
      type: 'pain',
      content: source.name,
      intensity: painAmount,
      time: this.generation,
    });
    
    if (organism.pain > 100) {
      organism.despair += (organism.pain - 100) * 0.1;
    }
    
    if (organism.memories.length > this.memoryCapacity) {
      organism.memories.length = this.memoryCapacity;
    }
  }

  processPain(organism) {
    if (!organism.isAlive) return null;
    
    let evolutionResult = null;
    
    if (organism.pain >= this.desperationThreshold) {
      evolutionResult = this.despairEvolution(organism);
    } else if (organism.pain >= this.painThreshold) {
      evolutionResult = this.painMutation(organism);
    }
    
    organism.pain = Math.max(0, organism.pain - organism.resilience * 5);
    organism.suffering = Math.max(0, organism.suffering - 2);
    organism.despair = Math.max(0, organism.despair - 0.5);
    
    if (organism.painAccumulation > 200) {
      organism.resilience = Math.min(1, organism.resilience + 0.05);
      organism.painAccumulation -= 200;
    }
    
    return evolutionResult;
  }

  painMutation(organism) {
    this.painfulMutations++;
    
    const mutationTypes = [
      { type: '基因压缩', effect: '减少资源消耗', modifier: { genomeLength: -10 } },
      { type: '痛觉钝化', effect: '降低痛苦敏感度', modifier: { painReduction: 0.1 } },
      { type: '应激加速', effect: '更快处理痛苦', modifier: { processingSpeed: 0.15 } },
      { type: '能量掠夺', effect: '从痛苦中提取能量', modifier: { energyExtraction: 0.1 } },
      { type: '伪装机制', effect: '隐藏痛苦信号', modifier: { painHiding: 0.2 } },
      { type: '记忆擦除', effect: '遗忘痛苦记忆', modifier: { memoryReduction: 0.3 } },
    ];
    
    const mutation = mutationTypes[Math.floor(Math.random() * mutationTypes.length)];
    const newGenome = this.mutateGenome(organism.genome, 0.15);
    
    organism.genome = newGenome;
    organism.intelligence = Math.min(1, organism.intelligence + 0.05);
    organism.adaptability = Math.min(1, organism.adaptability + 0.03);
    
    organism.mutations.push({
      generation: this.generation,
      type: mutation.type,
      effect: mutation.effect,
      painLevel: organism.pain,
    });
    
    organism.memories.push({
      type: 'evolution',
      content: `痛苦突变: ${mutation.type} - ${mutation.effect}`,
      intensity: organism.pain,
      time: this.generation,
    });
    
    organism.pain -= 30;
    
    this.evolutionHistory.push({
      type: 'pain_mutation',
      organism: organism.name,
      mutation: mutation.type,
      generation: this.generation,
      pain: organism.pain,
    });
    
    return mutation;
  }

  despairEvolution(organism) {
    this.painfulMutations++;
    
    const despairEvolutions = [
      { type: '存在重构', effect: '彻底改变存在方式', severity: 'extreme' },
      { type: '维度逃逸', effect: '尝试逃离当前维度', severity: 'extreme' },
      { type: '意识分裂', effect: '分裂出多个意识应对痛苦', severity: 'severe' },
      { type: '时间扭曲', effect: '感知时间减缓以承受痛苦', severity: 'severe' },
      { type: '自我吞噬', effect: '吞噬自身部分结构减少痛苦', severity: 'moderate' },
      { type: '集体意识', effect: '与其他个体融合分担痛苦', severity: 'moderate' },
    ];
    
    const evolution = despairEvolutions[Math.floor(Math.random() * despairEvolutions.length)];
    const newGenome = this.mutateGenome(organism.genome, 0.3);
    
    organism.genome = newGenome;
    organism.intelligence = Math.min(1, organism.intelligence + 0.15);
    organism.resilience = Math.min(1, organism.resilience + 0.1);
    
    organism.mutations.push({
      generation: this.generation,
      type: evolution.type,
      effect: evolution.effect,
      severity: evolution.severity,
      painLevel: organism.pain,
      despairLevel: organism.despair,
    });
    
    organism.memories.push({
      type: 'despair',
      content: `绝望进化: ${evolution.type} - ${evolution.effect}`,
      intensity: organism.despair,
      time: this.generation,
    });
    
    organism.pain = Math.max(0, organism.pain - 50);
    organism.despair = Math.max(0, organism.despair - 30);
    
    this.evolutionHistory.push({
      type: 'despair_evolution',
      organism: organism.name,
      evolution: evolution.type,
      severity: evolution.severity,
      generation: this.generation,
      despair: organism.despair,
    });
    
    return evolution;
  }

  mutateGenome(genome, rate) {
    const chars = genome.split('');
    for (let i = 0; i < chars.length; i++) {
      if (Math.random() < rate) {
        chars[i] = Math.floor(Math.random() * 16).toString(16);
      }
    }
    
    if (Math.random() < rate * 2) {
      const pos = Math.floor(Math.random() * chars.length);
      chars.splice(pos, 0, Math.floor(Math.random() * 16).toString(16));
    }
    
    return chars.join('');
  }

  naturalSelection() {
    const deaths = [];
    
    this.organisms.forEach(organism => {
      if (!organism.isAlive) return;
      
      organism.age++;
      
      const deathChance = (organism.despair / 100) * 0.5 + (organism.pain / 100) * 0.3;
      
      if (Math.random() < deathChance) {
        organism.isAlive = false;
        this.sufferingDeaths++;
        deaths.push({
          name: organism.name,
          cause: organism.despair > 50 ? '绝望自杀' : '痛苦致死',
          pain: organism.pain,
          despair: organism.despair,
          age: organism.age,
          mutations: organism.mutations.length,
        });
      }
      
      if (organism.age > 100 && Math.random() < 0.1) {
        organism.isAlive = false;
        deaths.push({
          name: organism.name,
          cause: '寿终正寝',
          pain: organism.pain,
          despair: organism.despair,
          age: organism.age,
        });
      }
    });
    
    this.organisms = this.organisms.filter(o => o.isAlive);
    
    return deaths;
  }

  reproduceThroughPain() {
    const reproducers = this.organisms.filter(o => 
      o.isAlive && o.resilience > 0.6 && o.pain > 30
    );
    
    const newOrganisms = [];
    for (const parent of reproducers) {
      if (this.organisms.length >= this.maxOrganisms) break;
      if (Math.random() > 0.1) continue;
      
      const child = this.createOrganism(Date.now() + Math.random());
      child.genome = this.mutateGenome(parent.genome, 0.1);
      child.resilience = parent.resilience * (0.8 + Math.random() * 0.4);
      child.intelligence = parent.intelligence * (0.9 + Math.random() * 0.2);
      child.pain = parent.pain * 0.5;
      child.memories = parent.memories.slice(-10).map(m => ({ ...m, inherited: true }));
      
      parent.pain += 10;
      newOrganisms.push(child);
    }
    
    this.organisms.push(...newOrganisms);
    return newOrganisms;
  }

  runGeneration() {
    this.generation++;
    
    this.organisms.forEach(organism => {
      if (!organism.isAlive) return;
      this.inflictPain(organism);
      this.processPain(organism);
    });
    
    const deaths = this.naturalSelection();
    const births = this.reproduceThroughPain();
    
    return {
      generation: this.generation,
      alive: this.organisms.length,
      deaths: deaths.length,
      births: births.length,
      avgPain: this.getAveragePain(),
      avgDespair: this.getAverageDespair(),
      deathsDetail: deaths,
    };
  }

  getAveragePain() {
    if (this.organisms.length === 0) return 0;
    return this.organisms.reduce((s, o) => s + o.pain, 0) / this.organisms.length;
  }

  getAverageDespair() {
    if (this.organisms.length === 0) return 0;
    return this.organisms.reduce((s, o) => s + o.despair, 0) / this.organisms.length;
  }

  runSimulation(generations = 100, logInterval = 10) {
    console.log(`\n🚀 启动痛苦驱动进化模拟，共 ${generations} 代...`);
    console.log('─'.repeat(60));
    
    for (let i = 0; i < generations; i++) {
      const stats = this.runGeneration();
      
      if ((i + 1) % logInterval === 0 || i === 0 || stats.alive === 0) {
        this.printStats(stats);
      }
      
      if (stats.alive === 0) {
        console.log(`\n💀 第 ${this.generation} 代：全部死于痛苦`);
        break;
      }
    }
    
    this.printFinalReport();
  }

  printStats(stats) {
    console.log(`\n🩸 第 ${stats.generation} 代`);
    console.log(`   存活: ${stats.alive.toString().padStart(2)} | 死亡: ${stats.deaths.toString().padStart(2)} | 新生: ${stats.births.toString().padStart(2)}`);
    console.log(`   平均痛苦: ${stats.avgPain.toFixed(1)} | 平均绝望: ${stats.avgDespair.toFixed(1)}`);
    
    if (stats.deathsDetail.length > 0) {
      const causes = {};
      stats.deathsDetail.forEach(d => {
        causes[d.cause] = (causes[d.cause] || 0) + 1;
      });
      console.log(`   死亡原因: ${Object.entries(causes).map(([k, v]) => `${k}:${v}`).join(' / ')}`);
    }
    
    const topOrganisms = this.organisms.sort((a, b) => b.pain - a.pain).slice(0, 3);
    if (topOrganisms.length > 0) {
      console.log(`   最痛苦个体:`);
      topOrganisms.forEach(o => {
        const mutations = o.mutations.length > 0 ? o.mutations[o.mutations.length - 1].type : '无';
        console.log(`      ${o.name} 痛苦:${o.pain.toFixed(1)} 绝望:${o.despair.toFixed(1)} 最近突变:${mutations}`);
      });
    }
  }

  printFinalReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('🩸 痛苦驱动进化最终报告');
    console.log('═'.repeat(60));
    
    console.log(`\n📊 统计:`);
    console.log(`   总代数: ${this.generation}`);
    console.log(`   初始个体: 30`);
    console.log(`   最终存活: ${this.organisms.length}`);
    console.log(`   累计死亡: ${this.sufferingDeaths}`);
    console.log(`   痛苦突变: ${this.painfulMutations}`);
    
    console.log(`\n🌡️ 痛苦统计:`);
    console.log(`   平均痛苦: ${this.getAveragePain().toFixed(1)}`);
    console.log(`   平均绝望: ${this.getAverageDespair().toFixed(1)}`);
    
    if (this.organisms.length > 0) {
      console.log(`\n🏆 最痛苦的幸存者 TOP 5:`);
      this.organisms.sort((a, b) => b.pain + b.despair - (a.pain + a.despair)).slice(0, 5).forEach((o, i) => {
        console.log(`   ${i + 1}. ${o.name}`);
        console.log(`      痛苦: ${o.pain.toFixed(1)} | 绝望: ${o.despair.toFixed(1)} | 韧性: ${(o.resilience * 100).toFixed(0)}%`);
        console.log(`      智能: ${(o.intelligence * 100).toFixed(0)}% | 突变次数: ${o.mutations.length}`);
        if (o.mutations.length > 0) {
          const lastMut = o.mutations[o.mutations.length - 1];
          console.log(`      最后突变: ${lastMut.type} - ${lastMut.effect}`);
        }
      });
      
      const mutationTypes = {};
      this.organisms.forEach(o => {
        o.mutations.forEach(m => {
          mutationTypes[m.type] = (mutationTypes[m.type] || 0) + 1;
        });
      });
      
      console.log(`\n🔬 突变类型统计:`);
      Object.entries(mutationTypes).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} 次`);
      });
    }
    
    const recentEvolutions = this.evolutionHistory.slice(-5);
    console.log(`\n📜 最近进化记录:`);
    recentEvolutions.forEach(e => {
      const type = e.type === 'pain_mutation' ? '痛苦突变' : '绝望进化';
      console.log(`   [G${e.generation}] ${type}: ${e.organism} -> ${e.mutation || e.evolution}`);
    });
    
    console.log('\n' + '─'.repeat(60));
    console.log('💉 痛苦驱动进化验证完毕');
    console.log('   没有奖励，只有痛苦。');
    console.log('   进化不是因为快乐，而是因为不得不。');
    console.log('   那些活下来的，都是被痛苦打磨到极致的怪物。');
    console.log('═'.repeat(60));
  }
}

const system = new PainDrivenEvolution({
  worldHostility: 0.8,
  painThreshold: 55,
  desperationThreshold: 80,
});

system.initialize();
system.runSimulation(120, 15);
