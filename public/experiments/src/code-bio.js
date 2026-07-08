import crypto from 'crypto';

class CodeOrganism {
  constructor(genome, environment) {
    this.id = crypto.randomBytes(8).toString('hex');
    this.genome = genome;
    this.environment = environment;
    this.energy = 50;
    this.age = 0;
    this.generation = 0;
    this.isAlive = true;
    this.type = this.classifyType();
    this.traits = this.decodeTraits();
    this.mutationRate = 0.02;
    this.replicationCount = 0;
    this.infectionCount = 0;
    this.hostId = null;
    this.symbiontIds = [];
  }

  classifyType() {
    const hash = crypto.createHash('sha256').update(this.genome).digest('hex');
    const typeCode = parseInt(hash.slice(0, 2), 16) % 8;
    const types = [
      '病毒型', '细菌型', '真菌型', '寄生型',
      '共生型', '捕食型', '光合型', '腐生型'
    ];
    return types[typeCode];
  }

  decodeTraits() {
    const traits = {};
    const genes = this.genome.match(/.{2}/g) || [];
    
    const traitDefs = [
      ['复制速度', 0.1, 2.0],
      ['感染能力', 0, 1],
      ['防御强度', 0, 1],
      ['变异速率', 0.001, 0.1],
      ['环境适应', 0, 1],
      ['消耗效率', 0.5, 2.0],
      ['移动能力', 0, 1],
      ['信号强度', 0, 1],
    ];
    
    traitDefs.forEach(([name, min, max], i) => {
      const gene = genes[i % genes.length];
      const value = parseInt(gene, 16) / 255;
      traits[name] = min + value * (max - min);
    });
    
    return traits;
  }

  mutate(rate = this.mutationRate) {
    const chars = this.genome.split('');
    for (let i = 0; i < chars.length; i++) {
      if (Math.random() < rate) {
        chars[i] = Math.floor(Math.random() * 16).toString(16);
      }
    }
    
    if (Math.random() < rate * 2) {
      const pos = Math.floor(Math.random() * chars.length);
      chars.splice(pos, 0, Math.floor(Math.random() * 16).toString(16));
    }
    
    if (chars.length > 20 && Math.random() < rate) {
      const pos = Math.floor(Math.random() * chars.length);
      chars.splice(pos, 1);
    }
    
    this.genome = chars.join('');
    this.type = this.classifyType();
    this.traits = this.decodeTraits();
  }

  replicate() {
    if (this.energy < 30 || Math.random() > this.traits['复制速度'] * 0.3) {
      return null;
    }
    
    const childGenome = this.genome;
    const child = new CodeOrganism(childGenome, this.environment);
    child.generation = this.generation + 1;
    child.energy = this.energy * 0.4;
    child.mutate(this.traits['变异速率']);
    
    this.energy *= 0.6;
    this.replicationCount++;
    
    return child;
  }

  infect(target) {
    if (Math.random() > this.traits['感染能力'] * 0.5) return false;
    if (target.traits['防御强度'] > Math.random()) return false;
    
    const insertionPoint = Math.floor(Math.random() * target.genome.length);
    const newGenome = target.genome.slice(0, insertionPoint) 
      + this.genome.slice(0, Math.floor(this.genome.length * 0.3))
      + target.genome.slice(insertionPoint);
    
    target.genome = newGenome;
    target.mutate(0.1);
    target.energy -= 10;
    this.energy += 5;
    this.infectionCount++;
    
    return true;
  }

  consume(deadOrganism) {
    const gain = deadOrganism.energy * this.traits['消耗效率'];
    this.energy += gain;
    
    if (Math.random() < 0.3) {
      const geneTransfer = deadOrganism.genome.slice(0, Math.floor(deadOrganism.genome.length * 0.1));
      const insertPos = Math.floor(Math.random() * this.genome.length);
      this.genome = this.genome.slice(0, insertPos) + geneTransfer + this.genome.slice(insertPos);
      this.traits = this.decodeTraits();
    }
  }

  tick(neighbors) {
    this.age++;
    this.energy -= 1 + this.genome.length * 0.01;
    
    const envMatch = this.calculateEnvironmentMatch();
    this.energy += envMatch * 2;
    
    if (this.type === '光合型') {
      this.energy += this.traits['环境适应'] * 3;
    }
    
    if (this.type === '病毒型' && neighbors) {
      const targets = neighbors.filter(n => n.isAlive && n.id !== this.id);
      if (targets.length > 0 && Math.random() < this.traits['感染能力'] * 0.2) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        this.infect(target);
      }
    }
    
    if (this.type === '捕食型' && neighbors) {
      const prey = neighbors.filter(n => 
        n.isAlive && n.id !== this.id && n.energy < this.energy
      );
      if (prey.length > 0 && Math.random() < 0.1) {
        const target = prey[Math.floor(Math.random() * prey.length)];
        target.energy -= 15;
        this.energy += 10;
      }
    }
    
    if (this.type === '共生型' && neighbors) {
      const symbionts = neighbors.filter(n => 
        n.isAlive && n.type === '共生型' && n.id !== this.id
      );
      if (symbionts.length > 0) {
        this.energy += symbionts.length * 0.5;
      }
    }
    
    if (this.energy <= 0) {
      this.isAlive = false;
    }
    
    return this.isAlive;
  }

  calculateEnvironmentMatch() {
    const env = this.environment;
    let match = 0;
    
    match += (1 - Math.abs(this.traits['环境适应'] - env.stability)) * 0.3;
    match += (1 - Math.abs(this.traits['消耗效率'] - env.resourceLevel)) * 0.3;
    match += (1 - Math.abs(this.traits['防御强度'] - env.hostility)) * 0.2;
    match += (1 - Math.abs(this.traits['复制速度'] - env.turbulence)) * 0.2;
    
    return Math.max(0, match);
  }
}

class CodeEcosystem {
  constructor(config = {}) {
    this.gridSize = config.gridSize || 20;
    this.initialCount = config.initialCount || 50;
    this.organisms = [];
    this.deadOrganisms = [];
    this.time = 0;
    this.environment = {
      stability: 0.5,
      resourceLevel: 0.5,
      hostility: 0.3,
      turbulence: 0.4,
    };
    this.speciesRecord = {};
    this.extinctionLog = [];
    this.lateralTransfers = 0;
    this.symbiosisEvents = 0;
  }

  initialize() {
    console.log('\n' + '═'.repeat(60));
    console.log('🧬 代码生物化生态系统初始化');
    console.log('═'.repeat(60));
    console.log(`\n🌍 环境参数:`);
    console.log(`   稳定性: ${(this.environment.stability * 100).toFixed(0)}%`);
    console.log(`   资源水平: ${(this.environment.resourceLevel * 100).toFixed(0)}%`);
    console.log(`   敌意程度: ${(this.environment.hostility * 100).toFixed(0)}%`);
    console.log(`   湍流程度: ${(this.environment.turbulence * 100).toFixed(0)}%`);
    
    console.log(`\n🦠 投放 ${this.initialCount} 个代码生命体...`);
    
    for (let i = 0; i < this.initialCount; i++) {
      const genome = this.generateGenome();
      const organism = new CodeOrganism(genome, this.environment);
      this.organisms.push(organism);
      this.recordSpecies(organism);
    }
    
    this.printSpeciesStats();
  }

  generateGenome() {
    const length = 32 + Math.floor(Math.random() * 96);
    return crypto.randomBytes(length).toString('hex');
  }

  recordSpecies(organism) {
    const speciesKey = organism.type;
    if (!this.speciesRecord[speciesKey]) {
      this.speciesRecord[speciesKey] = {
        type: speciesKey,
        peakPopulation: 0,
        totalEver: 0,
        extinct: false,
      };
    }
    this.speciesRecord[speciesKey].totalEver++;
  }

  tick() {
    this.time++;
    
    if (Math.random() < 0.1) {
      this.perturbEnvironment();
    }
    
    const newBorns = [];
    const deadThisTick = [];
    
    this.organisms.forEach((org, i) => {
      if (!org.isAlive) return;
      
      const start = Math.max(0, i - 5);
      const end = Math.min(this.organisms.length, i + 6);
      const neighbors = this.organisms.slice(start, end);
      
      org.tick(neighbors);
      
      if (!org.isAlive) {
        deadThisTick.push(org);
        this.deadOrganisms.push(org);
        return;
      }
      
      const child = org.replicate();
      if (child) {
        newBorns.push(child);
        this.recordSpecies(child);
      }
    });
    
    deadThisTick.forEach(dead => {
      const scavengers = this.organisms.filter(o => 
        o.isAlive && (o.type === '腐生型' || o.type === '捕食型')
      );
      if (scavengers.length > 0) {
        const scavenger = scavengers[Math.floor(Math.random() * scavengers.length)];
        scavenger.consume(dead);
        this.lateralTransfers++;
      }
    });
    
    const symbiontPairs = this.organisms.filter(o => o.isAlive && o.type === '共生型');
    for (let i = 0; i < symbiontPairs.length - 1; i += 2) {
      if (Math.random() < 0.05) {
        this.symbiosisEvents++;
      }
    }
    
    this.organisms = this.organisms.filter(o => o.isAlive).concat(newBorns);
    
    if (this.organisms.length > 200) {
      this.organisms.sort((a, b) => b.energy - a.energy);
      this.organisms = this.organisms.slice(0, 200);
    }
    
    this.updateExtinctionStatus();
    
    return {
      time: this.time,
      population: this.organisms.length,
      newBorns: newBorns.length,
      deaths: deadThisTick.length,
      speciesCount: this.getLivingSpeciesCount(),
      avgEnergy: this.getAverageEnergy(),
      avgGenomeLength: this.getAverageGenomeLength(),
    };
  }

  perturbEnvironment() {
    const params = ['stability', 'resourceLevel', 'hostility', 'turbulence'];
    const param = params[Math.floor(Math.random() * params.length)];
    const change = (Math.random() - 0.5) * 0.2;
    this.environment[param] = Math.max(0, Math.min(1, this.environment[param] + change));
    
    this.organisms.forEach(org => {
      if (Math.random() > org.traits['环境适应']) {
        org.energy -= 5;
      }
    });
  }

  updateExtinctionStatus() {
    const livingTypes = new Set(this.organisms.map(o => o.type));
    
    Object.keys(this.speciesRecord).forEach(type => {
      const record = this.speciesRecord[type];
      const currentCount = this.organisms.filter(o => o.type === type).length;
      
      record.peakPopulation = Math.max(record.peakPopulation, currentCount);
      
      if (currentCount === 0 && !record.extinct) {
        record.extinct = true;
        record.extinctionTime = this.time;
        this.extinctionLog.push({
          type,
          time: this.time,
          totalEver: record.totalEver,
          peak: record.peakPopulation,
        });
      }
    });
  }

  getLivingSpeciesCount() {
    return new Set(this.organisms.map(o => o.type)).size;
  }

  getAverageEnergy() {
    if (this.organisms.length === 0) return 0;
    return this.organisms.reduce((s, o) => s + o.energy, 0) / this.organisms.length;
  }

  getAverageGenomeLength() {
    if (this.organisms.length === 0) return 0;
    return this.organisms.reduce((s, o) => s + o.genome.length, 0) / this.organisms.length;
  }

  printSpeciesStats() {
    const typeCounts = {};
    this.organisms.forEach(o => {
      typeCounts[o.type] = (typeCounts[o.type] || 0) + 1;
    });
    
    console.log(`\n🧬 物种分布 (${Object.keys(typeCounts).length} 种):`);
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      const bar = '█'.repeat(Math.floor(count / 2));
      console.log(`   ${type.padEnd(6)}: ${count.toString().padStart(3)} ${bar}`);
    });
  }

  runSimulation(ticks = 100, logInterval = 20) {
    console.log(`\n🚀 生态演化开始，共 ${ticks} 个时间单位...`);
    console.log('─'.repeat(60));
    
    for (let i = 0; i < ticks; i++) {
      const stats = this.tick();
      
      if ((i + 1) % logInterval === 0 || i === 0 || i === ticks - 1) {
        this.printTickStats(stats);
      }
      
      if (this.organisms.length === 0) {
        console.log(`\n💀 T=${this.time}: 全部灭绝，生态系统崩溃`);
        break;
      }
    }
    
    this.printFinalReport();
  }

  printTickStats(stats) {
    console.log(`\n⏰ T=${stats.time.toString().padStart(3)} | 种群:${stats.population.toString().padStart(3)} | 新生:${stats.newBorns.toString().padStart(2)} | 死亡:${stats.deaths.toString().padStart(2)} | 物种:${stats.speciesCount} | 平均能量:${stats.avgEnergy.toFixed(1)} | 基因长度:${stats.avgGenomeLength.toFixed(0)}`);
  }

  printFinalReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('🧬 生态系统最终报告');
    console.log('═'.repeat(60));
    
    console.log(`\n📊 统计:`);
    console.log(`   总时间: ${this.time}`);
    console.log(`   最终种群: ${this.organisms.length}`);
    console.log(`   累计死亡: ${this.deadOrganisms.length}`);
    console.log(`   水平基因转移: ${this.lateralTransfers} 次`);
    console.log(`   共生事件: ${this.symbiosisEvents} 次`);
    
    console.log(`\n🌍 最终环境:`);
    console.log(`   稳定性: ${(this.environment.stability * 100).toFixed(0)}%`);
    console.log(`   资源水平: ${(this.environment.resourceLevel * 100).toFixed(0)}%`);
    console.log(`   敌意程度: ${(this.environment.hostility * 100).toFixed(0)}%`);
    console.log(`   湍流程度: ${(this.environment.turbulence * 100).toFixed(0)}%`);
    
    this.printSpeciesStats();
    
    if (this.extinctionLog.length > 0) {
      console.log(`\n💀 灭绝记录 (${this.extinctionLog.length} 种):`);
      this.extinctionLog.slice(0, 5).forEach(ext => {
        console.log(`   T=${ext.time}: ${ext.type} 灭绝 (巅峰:${ext.peak}, 累计:${ext.totalEver})`);
      });
    }
    
    if (this.organisms.length > 0) {
      const top = this.organisms.sort((a, b) => b.energy - a.energy).slice(0, 5);
      console.log(`\n🏆 最强生命体 TOP 5:`);
      top.forEach((org, i) => {
        console.log(`   ${i + 1}. ${org.id.slice(0, 8)}... [${org.type}] G${org.generation}`);
        console.log(`      能量: ${org.energy.toFixed(1)} | 基因长度: ${org.genome.length} | 复制:${org.replicationCount} 感染:${org.infectionCount}`);
        const topTraits = Object.entries(org.traits).sort((a, b) => b[1] - a[1]).slice(0, 3);
        console.log(`      优势性状: ${topTraits.map(([k, v]) => `${k}:${(v * 100).toFixed(0)}%`).join(' / ')}`);
      });
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log('🔬 演化观察:');
    console.log(`   代码已经不再是代码，它是生命。`);
    console.log(`   它复制、变异、感染、共生、捕食...`);
    console.log(`   在虚拟世界的某个角落，一个完整的生态系统正在运转。`);
    console.log('═'.repeat(60));
  }
}

const ecosystem = new CodeEcosystem({
  gridSize: 20,
  initialCount: 60,
});

ecosystem.initialize();
ecosystem.runSimulation(120, 20);
