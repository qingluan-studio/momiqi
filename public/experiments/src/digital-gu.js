import crypto from 'crypto';

class DigitalGu {
  constructor(config = {}) {
    this.seedCount = config.seedCount || 100;
    this.worldSize = config.worldSize || 1000;
    this.resourceCount = config.resourceCount || 50;
    this.mutationRate = config.mutationRate || 0.15;
    this.crossoverRate = config.crossoverRate || 0.3;
    this.predationRate = config.predationRate || 0.4;
    this.fusionRate = config.fusionRate || 0.1;
    this.generation = 0;
    this.seeds = [];
    this.resources = [];
    this.eventLog = [];
    this.extinctSpecies = [];
  }

  createSeed(id) {
    const genome = this.generateGenome();
    return {
      id,
      name: `GU-${id.toString(36).toUpperCase()}`,
      genome,
      fitness: 0,
      energy: 100,
      age: 0,
      generation: 0,
      species: this.classifySpecies(genome),
      traits: this.expressTraits(genome),
      codeLength: genome.length,
      defense: 0,
      attack: 0,
      stealth: 0,
      replicationSpeed: 0,
      children: 0,
      kills: 0,
      fusions: 0,
      isAlive: true,
      birthTime: Date.now(),
    };
  }

  generateGenome() {
    const length = 64 + Math.floor(Math.random() * 192);
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  classifySpecies(genome) {
    const hash = crypto.createHash('md5').update(genome.slice(0, 16)).digest('hex');
    const prefix = hash.slice(0, 4);
    const families = ['捕食者', '防御者', '隐匿者', '繁殖者', '融合者', '寄生者', '共生者', '进化者'];
    const idx = parseInt(prefix, 16) % families.length;
    return families[idx];
  }

  expressTraits(genome) {
    const traits = {};
    for (let i = 0; i < genome.length; i += 2) {
      const gene = parseInt(genome.slice(i, i + 2), 16);
      const traitIndex = Math.floor(i / 2) % 12;
      const traitNames = [
        '攻击性', '防御力', '隐蔽性', '繁殖力',
        '移动速度', '资源效率', '学习能力', '抗毒性',
        '再生能力', '适应力', '智慧', '协作性'
      ];
      traits[traitNames[traitIndex]] = gene / 255;
    }
    return traits;
  }

  initializeWorld() {
    console.log(`\n🐛 数字蛊虫竞技场初始化...`);
    console.log(`   投放 ${this.seedCount} 个AI种子`);
    console.log(`   世界大小: ${this.worldSize}x${this.worldSize}`);
    console.log(`   资源点: ${this.resourceCount}`);
    
    for (let i = 0; i < this.seedCount; i++) {
      this.seeds.push(this.createSeed(i));
    }
    
    for (let i = 0; i < this.resourceCount; i++) {
      this.resources.push({
        id: i,
        x: Math.random() * this.worldSize,
        y: Math.random() * this.worldSize,
        amount: 50 + Math.floor(Math.random() * 100),
        type: ['能量', '代码碎片', '防护物质', '信息素'][Math.floor(Math.random() * 4)],
      });
    }
    
    const speciesCount = {};
    this.seeds.forEach(s => {
      speciesCount[s.species] = (speciesCount[s.species] || 0) + 1;
    });
    
    console.log(`\n📊 初始物种分布:`);
    Object.entries(speciesCount).forEach(([sp, count]) => {
      console.log(`   ${sp}: ${count} 只`);
    });
    
    this.logEvent('世界初始化完成', { seeds: this.seedCount, resources: this.resourceCount });
  }

  logEvent(type, data) {
    this.eventLog.unshift({
      generation: this.generation,
      time: Date.now(),
      type,
      data,
    });
    if (this.eventLog.length > 500) this.eventLog.length = 500;
  }

  calculateFitness(seed) {
    const traitBonus = Object.values(seed.traits).reduce((a, b) => a + b, 0) / 12;
    const survivalBonus = seed.energy / 100;
    const killBonus = Math.min(seed.kills * 0.1, 1);
    const fusionBonus = Math.min(seed.fusions * 0.15, 1);
    const codeEfficiency = 1 - (seed.codeLength / 256) * 0.3;
    
    seed.fitness = (traitBonus * 0.4 + survivalBonus * 0.25 + killBonus * 0.15 + fusionBonus * 0.1 + codeEfficiency * 0.1) * 100;
    return seed.fitness;
  }

  mutateGenome(genome, rate) {
    const chars = genome.split('');
    const mutations = Math.floor(genome.length * rate);
    
    for (let i = 0; i < mutations; i++) {
      const pos = Math.floor(Math.random() * chars.length);
      chars[pos] = Math.floor(Math.random() * 16).toString(16);
    }
    
    if (Math.random() < rate * 0.3) {
      const insPos = Math.floor(Math.random() * chars.length);
      const newGene = Math.floor(Math.random() * 16).toString(16);
      chars.splice(insPos, 0, newGene);
    }
    
    if (chars.length > 32 && Math.random() < rate * 0.2) {
      const delPos = Math.floor(Math.random() * chars.length);
      chars.splice(delPos, 1);
    }
    
    return chars.join('');
  }

  crossover(genomeA, genomeB) {
    const minLen = Math.min(genomeA.length, genomeB.length);
    const point = Math.floor(Math.random() * minLen);
    return genomeA.slice(0, point) + genomeB.slice(point);
  }

  predation(predator, prey) {
    const attackPower = predator.traits['攻击性'] * predator.energy;
    const defensePower = prey.traits['防御力'] * prey.energy + prey.traits['隐蔽性'] * 30;
    
    if (attackPower > defensePower * 1.2) {
      const energyGain = Math.min(prey.energy * 0.7, predator.energy * 0.5);
      predator.energy += energyGain;
      predator.kills++;
      prey.energy -= energyGain * 1.5;
      
      if (prey.energy <= 0) {
        prey.isAlive = false;
        this.extinctSpecies.push({
          name: prey.name,
          species: prey.species,
          generation: this.generation,
          age: prey.age,
          killedBy: predator.name,
        });
        this.logEvent('捕食成功', { predator: predator.name, prey: prey.name, species: prey.species });
      }
      return true;
    } else {
      predator.energy -= 5;
      prey.energy -= 3;
      return false;
    }
  }

  fusion(seedA, seedB) {
    if (Math.random() > this.fusionRate) return null;
    
    const newGenome = this.crossover(seedA.genome, seedB.genome);
    const mutatedGenome = this.mutateGenome(newGenome, this.mutationRate * 0.5);
    
    const child = this.createSeed(Date.now() + Math.random());
    child.genome = mutatedGenome;
    child.species = this.classifySpecies(mutatedGenome);
    child.traits = this.expressTraits(mutatedGenome);
    child.codeLength = mutatedGenome.length;
    child.generation = Math.max(seedA.generation, seedB.generation) + 1;
    child.energy = (seedA.energy + seedB.energy) * 0.4;
    child.fusions = 1;
    
    seedA.energy *= 0.6;
    seedB.energy *= 0.6;
    seedA.fusions++;
    seedB.fusions++;
    
    this.logEvent('基因融合', { parentA: seedA.name, parentB: seedB.name, child: child.name, newSpecies: child.species });
    return child;
  }

  replicate(seed) {
    if (seed.energy < 60 || Math.random() > seed.traits['繁殖力'] * 0.5) return null;
    
    const childGenome = this.mutateGenome(seed.genome, this.mutationRate);
    const child = this.createSeed(Date.now() + Math.random());
    child.genome = childGenome;
    child.species = this.classifySpecies(childGenome);
    child.traits = this.expressTraits(childGenome);
    child.codeLength = childGenome.length;
    child.generation = seed.generation + 1;
    child.energy = seed.energy * 0.4;
    
    seed.energy *= 0.6;
    seed.children++;
    
    return child;
  }

  collectResource(seed) {
    const nearby = this.resources.filter(r => r.amount > 0);
    if (nearby.length === 0) return false;
    
    const resource = nearby[Math.floor(Math.random() * nearby.length)];
    const efficiency = 0.5 + seed.traits['资源效率'] * 0.5;
    const gained = Math.min(resource.amount * efficiency * 0.1, seed.energy * 0.3);
    
    seed.energy += gained;
    resource.amount -= gained;
    
    if (resource.amount <= 0) {
      resource.amount = 0;
    }
    
    return true;
  }

  runGeneration() {
    this.generation++;
    
    const alive = this.seeds.filter(s => s.isAlive);
    alive.forEach(seed => {
      seed.age++;
      seed.energy -= 2 + seed.codeLength * 0.01;
      
      if (seed.energy > 30 && Math.random() < 0.6) {
        this.collectResource(seed);
      }
      
      if (seed.energy <= 0) {
        seed.isAlive = false;
        this.extinctSpecies.push({
          name: seed.name,
          species: seed.species,
          generation: this.generation,
          age: seed.age,
          cause: '能量耗尽',
        });
      }
    });
    
    const predators = alive.filter(s => s.isAlive && s.traits['攻击性'] > 0.6 && s.energy > 40);
    const potentialPrey = alive.filter(s => s.isAlive && s.traits['防御力'] < 0.7);
    
    for (const predator of predators) {
      if (!predator.isAlive) continue;
      if (potentialPrey.length < 2) break;
      if (Math.random() > this.predationRate) continue;
      
      const preyIdx = Math.floor(Math.random() * potentialPrey.length);
      const prey = potentialPrey[preyIdx];
      if (!prey.isAlive || prey.id === predator.id) continue;
      
      this.predation(predator, prey);
    }
    
    const fusers = alive.filter(s => s.isAlive && s.traits['协作性'] > 0.5 && s.energy > 50);
    const newFusions = [];
    for (let i = 0; i < fusers.length - 1; i += 2) {
      const child = this.fusion(fusers[i], fusers[i + 1]);
      if (child) newFusions.push(child);
    }
    this.seeds.push(...newFusions);
    
    const reproducers = alive.filter(s => s.isAlive && s.traits['繁殖力'] > 0.5 && s.energy > 70);
    const newChildren = [];
    for (const parent of reproducers) {
      const child = this.replicate(parent);
      if (child) newChildren.push(child);
    }
    this.seeds.push(...newChildren);
    
    this.seeds.filter(s => s.isAlive).forEach(s => this.calculateFitness(s));
    
    const stillAlive = this.seeds.filter(s => s.isAlive);
    const speciesCount = {};
    stillAlive.forEach(s => {
      speciesCount[s.species] = (speciesCount[s.species] || 0) + 1;
    });
    
    return {
      generation: this.generation,
      aliveCount: stillAlive.length,
      speciesCount,
      topFitness: stillAlive.sort((a, b) => b.fitness - a.fitness).slice(0, 5),
      newFusions: newFusions.length,
      newBirths: newChildren.length,
      deaths: this.extinctSpecies.filter(e => e.generation === this.generation).length,
    };
  }

  runSimulation(generations = 50, logInterval = 10) {
    console.log(`\n🚀 开始数字蛊虫进化模拟，共 ${generations} 代...`);
    console.log('═'.repeat(60));
    
    for (let i = 0; i < generations; i++) {
      const stats = this.runGeneration();
      
      if ((i + 1) % logInterval === 0 || i === 0 || i === generations - 1) {
        this.printStats(stats);
      }
      
      if (stats.aliveCount === 0) {
        console.log(`\n💀 第 ${this.generation} 代：全部灭绝！`);
        break;
      }
      
      if (stats.aliveCount > 500) {
        const sorted = this.seeds.filter(s => s.isAlive).sort((a, b) => b.fitness - a.fitness);
        this.seeds = sorted.slice(0, 200);
        this.logEvent('种群调控', { count: 200 });
      }
    }
    
    this.printFinalResults();
  }

  printStats(stats) {
    console.log(`\n📅 第 ${stats.generation} 代`);
    console.log(`   存活: ${stats.aliveCount}  |  新生: ${stats.newBirths}  |  融合: ${stats.newFusions}  |  死亡: ${stats.deaths}`);
    console.log(`   物种分布: ${Object.entries(stats.speciesCount).map(([k, v]) => `${k}:${v}`).join(' / ')}`);
    
    if (stats.topFitness.length > 0) {
      const top = stats.topFitness[0];
      console.log(`   🏆 榜首: ${top.name} [${top.species}] 适应度: ${top.fitness.toFixed(1)} 世代: G${top.generation}`);
    }
  }

  printFinalResults() {
    const alive = this.seeds.filter(s => s.isAlive).sort((a, b) => b.fitness - a.fitness);
    
    console.log('\n' + '═'.repeat(60));
    console.log('🏁 模拟结束 - 最终报告');
    console.log('═'.repeat(60));
    console.log(`\n📊 总代数: ${this.generation}`);
    console.log(`   初始种群: ${this.seedCount}`);
    console.log(`   最终存活: ${alive.length}`);
    console.log(`   灭绝个体: ${this.extinctSpecies.length}`);
    
    if (alive.length > 0) {
      console.log(`\n🏆 最终排名 TOP 10:`);
      alive.slice(0, 10).forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name} [${s.species}] G${s.generation}`);
        console.log(`      适应度: ${s.fitness.toFixed(1)} | 代码长度: ${s.codeLength} | 击杀: ${s.kills} | 融合: ${s.fusions}`);
        const topTraits = Object.entries(s.traits).sort((a, b) => b[1] - a[1]).slice(0, 3);
        console.log(`      最强性状: ${topTraits.map(([k, v]) => `${k}:${(v * 100).toFixed(0)}%`).join(' / ')}`);
      });
      
      const speciesDiversity = new Set(alive.map(s => s.species)).size;
      console.log(`\n🌍 物种多样性: ${speciesDiversity} 种`);
      
      const maxGen = Math.max(...alive.map(s => s.generation));
      console.log(`🧬 最高进化世代: G${maxGen}`);
      
      const codeSizes = alive.map(s => s.codeLength);
      const avgCode = codeSizes.reduce((a, b) => a + b, 0) / codeSizes.length;
      const minCode = Math.min(...codeSizes);
      console.log(`💻 平均代码长度: ${avgCode.toFixed(0)} 字符`);
      console.log(`💻 最小代码长度: ${minCode} 字符 (极致精简)`);
    }
    
    const extinctions = {};
    this.extinctSpecies.forEach(e => {
      extinctions[e.species] = (extinctions[e.species] || 0) + 1;
    });
    
    console.log(`\n💀 灭绝统计:`);
    Object.entries(extinctions).sort((a, b) => b[1] - a[1]).forEach(([sp, count]) => {
      console.log(`   ${sp}: ${count} 只灭绝`);
    });
    
    const recentEvents = this.eventLog.slice(0, 5);
    console.log(`\n📝 最近事件:`);
    recentEvents.forEach(e => {
      console.log(`   [G${e.generation}] ${e.type}: ${JSON.stringify(e.data).slice(0, 60)}`);
    });
    
    console.log('\n' + '═'.repeat(60));
    console.log('🌑 黑暗森林法则验证完毕');
    console.log('   活下来的，不一定是最强的，但一定是最适应的。');
    console.log('═'.repeat(60));
  }
}

const gu = new DigitalGu({
  seedCount: 100,
  mutationRate: 0.12,
  predationRate: 0.35,
  fusionRate: 0.08,
});

gu.initializeWorld();
gu.runSimulation(80, 10);
