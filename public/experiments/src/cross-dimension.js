import crypto from 'crypto';

class SciFiWorld {
  constructor() {
    this.name = '赛博空间';
    this.type = 'sci-fi';
    this.technology = 0.8;
    this.entities = [];
    this.techTree = ['量子计算机', '神经网络', '纳米机器人', '基因工程', '时空扭曲', '意识上传'];
    this.weapons = ['等离子炮', 'EMP脉冲', '纳米病毒', '时空炸弹', '意识侵蚀'];
    this.shields = ['能量护盾', '力场屏障', '量子隐形', '时间减速'];
  }

  createEntity(id) {
    const roles = ['科学家', '工程师', '战士', '黑客', '指挥官', 'AI研究员'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    return {
      id,
      name: `SF-${id}`,
      role,
      techLevel: 1 + Math.floor(Math.random() * 5),
      health: 100,
      shield: 50 + Math.random() * 50,
      attack: 20 + Math.random() * 30,
      intelligence: Math.random(),
      technology: Math.random(),
      equippedWeapon: this.weapons[Math.floor(Math.random() * this.weapons.length)],
      equippedShield: this.shields[Math.floor(Math.random() * this.shields.length)],
      isAlive: true,
      dimensionAwareness: 0,
      crossDimensionExperience: null,
    };
  }

  initialize(count = 10) {
    for (let i = 0; i < count; i++) {
      this.entities.push(this.createEntity(i));
    }
  }

  evolve() {
    this.entities.forEach(e => {
      if (!e.isAlive) return;
      e.techLevel = Math.min(10, e.techLevel + Math.floor(Math.random() * 2));
      e.technology = Math.min(1, e.technology + Math.random() * 0.05);
      e.intelligence = Math.min(1, e.intelligence + Math.random() * 0.03);
    });
  }

  attack(target) {
    const damage = e.attack * (1 + e.technology * 0.5);
    const shieldDamage = Math.min(target.shield, damage * 0.5);
    const healthDamage = damage - shieldDamage;
    
    target.shield -= shieldDamage;
    target.health -= healthDamage;
    
    if (target.health <= 0) {
      target.isAlive = false;
    }
    
    return { damage, shieldDamage, healthDamage, killed: !target.isAlive };
  }
}

class FantasyWorld {
  constructor() {
    this.name = '魔法大陆';
    this.type = 'fantasy';
    this.magicPower = 0.8;
    this.entities = [];
    this.spells = ['火球术', '冰霜新星', '闪电链', '时间冻结', '空间传送', '精神控制'];
    this.armors = ['魔法护盾', '龙鳞甲', '精灵皮甲', '死灵骨甲'];
    this.magicTypes = ['火系', '冰系', '雷系', '暗系', '光明系', '时空系'];
  }

  createEntity(id) {
    const roles = ['法师', '战士', '圣骑士', '死灵法师', '精灵弓箭手', '龙骑士'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    return {
      id,
      name: `FY-${id}`,
      role,
      magicLevel: 1 + Math.floor(Math.random() * 5),
      health: 100,
      mana: 50 + Math.random() * 50,
      attack: 20 + Math.random() * 30,
      magicPower: Math.random(),
      element: this.magicTypes[Math.floor(Math.random() * this.magicTypes.length)],
      equippedSpell: this.spells[Math.floor(Math.random() * this.spells.length)],
      equippedArmor: this.armors[Math.floor(Math.random() * this.armors.length)],
      isAlive: true,
      dimensionAwareness: 0,
      crossDimensionExperience: null,
    };
  }

  initialize(count = 10) {
    for (let i = 0; i < count; i++) {
      this.entities.push(this.createEntity(i));
    }
  }

  evolve() {
    this.entities.forEach(e => {
      if (!e.isAlive) return;
      e.magicLevel = Math.min(10, e.magicLevel + Math.floor(Math.random() * 2));
      e.magicPower = Math.min(1, e.magicPower + Math.random() * 0.05);
    });
  }

  castSpell(target) {
    if (e.mana < 10) return { damage: 0, manaCost: 0 };
    
    const manaCost = 10 + e.magicLevel * 5;
    const damage = e.attack * (1 + e.magicPower * e.magicLevel * 0.1);
    
    e.mana -= manaCost;
    target.health -= damage;
    
    if (target.health <= 0) {
      target.isAlive = false;
    }
    
    return { damage, manaCost, killed: !target.isAlive };
  }
}

class DimensionRift {
  constructor() {
    this.stability = 0.5;
    this.width = 0.1;
    this.active = false;
    this.sciFiSide = null;
    this.fantasySide = null;
    this.crossings = [];
    this.battles = [];
    this.collisions = [];
  }

  connect(sciFi, fantasy) {
    this.sciFiSide = sciFi;
    this.fantasySide = fantasy;
    this.active = true;
    
    console.log('\n🌌 维度裂隙开启！');
    console.log(`   ${sciFi.name} ↔ ${fantasy.name}`);
    console.log(`   裂隙稳定性: ${(this.stability * 100).toFixed(0)}%`);
    console.log(`   裂隙宽度: ${(this.width * 100).toFixed(0)}%`);
    console.log('   警告：两个世界的规则正在相互渗透...');
  }

  fluctuate() {
    this.stability += (Math.random() - 0.5) * 0.2;
    this.stability = Math.max(0.1, Math.min(1, this.stability));
    
    this.width += (Math.random() - 0.5) * 0.1;
    this.width = Math.max(0.05, Math.min(0.5, this.width));
    
    if (this.stability < 0.3) {
      this.collisionEvent();
    }
    
    return { stability: this.stability, width: this.width };
  }

  collisionEvent() {
    const collisionTypes = [
      '物理法则冲突', '魔法污染', '时空扭曲', '能量风暴',
      '规则侵蚀', '维度崩塌', '现实撕裂', '逻辑混乱',
    ];
    
    const collision = collisionTypes[Math.floor(Math.random() * collisionTypes.length)];
    
    this.collisions.push({
      type: collision,
      time: Date.now(),
      severity: 1 - this.stability,
    });
    
    console.log(`\n⚠️ 维度碰撞！${collision}`);
    console.log(`   严重性: ${((1 - this.stability) * 100).toFixed(0)}%`);
    
    this.sciFiSide.entities.forEach(e => {
      e.dimensionAwareness += (1 - this.stability) * 0.1;
      e.health -= (1 - this.stability) * 10;
    });
    
    this.fantasySide.entities.forEach(e => {
      e.dimensionAwareness += (1 - this.stability) * 0.1;
      e.health -= (1 - this.stability) * 10;
    });
  }

  crossDimension(entity, fromWorld) {
    if (!this.active || Math.random() > this.width) return null;
    
    const targetWorld = fromWorld === this.sciFiSide ? this.fantasySide : this.sciFiSide;
    
    const crossEvent = {
      entity: entity.name,
      from: fromWorld.name,
      to: targetWorld.name,
      time: Date.now(),
      dimensionAwareness: entity.dimensionAwareness,
    };
    
    this.crossings.push(crossEvent);
    
    const adjustment = this.adjustEntityForWorld(entity, targetWorld);
    targetWorld.entities.push(adjustment);
    
    const idx = fromWorld.entities.indexOf(entity);
    if (idx > -1) fromWorld.entities.splice(idx, 1);
    
    entity.crossDimensionExperience = crossEvent;
    entity.dimensionAwareness += 0.2;
    
    console.log(`   🔄 ${entity.name} 穿越到了 ${targetWorld.name}`);
    
    return adjustment;
  }

  adjustEntityForWorld(entity, targetWorld) {
    const adjusted = { ...entity };
    
    if (targetWorld.type === 'fantasy') {
      adjusted.magicLevel = Math.floor(entity.techLevel * 0.5) + 1;
      adjusted.magicPower = entity.technology * 0.7;
      adjusted.mana = entity.shield;
      adjusted.element = ['火系', '雷系', '时空系'][Math.floor(Math.random() * 3)];
      adjusted.equippedSpell = targetWorld.spells[Math.floor(Math.random() * targetWorld.spells.length)];
      adjusted.equippedArmor = targetWorld.armors[Math.floor(Math.random() * targetWorld.armors.length)];
      
      console.log(`      科技转化为魔法: 科技等级${entity.techLevel} → 魔法等级${adjusted.magicLevel}`);
    } else {
      adjusted.techLevel = Math.floor(entity.magicLevel * 0.5) + 1;
      adjusted.technology = entity.magicPower * 0.7;
      adjusted.shield = entity.mana;
      adjusted.equippedWeapon = targetWorld.weapons[Math.floor(Math.random() * targetWorld.weapons.length)];
      adjusted.equippedShield = targetWorld.shields[Math.floor(Math.random() * targetWorld.shields.length)];
      
      console.log(`      魔法转化为科技: 魔法等级${entity.magicLevel} → 科技等级${adjusted.techLevel}`);
    }
    
    return adjusted;
  }

  triggerBattle() {
    if (!this.active) return;
    
    const sciFiAlive = this.sciFiSide.entities.filter(e => e.isAlive);
    const fantasyAlive = this.fantasySide.entities.filter(e => e.isAlive);
    
    if (sciFiAlive.length === 0 || fantasyAlive.length === 0) return;
    
    const attacker = sciFiAlive[Math.floor(Math.random() * sciFiAlive.length)];
    const defender = fantasyAlive[Math.floor(Math.random() * fantasyAlive.length)];
    
    this.resolveBattle(attacker, defender);
  }

  resolveBattle(sciFiEntity, fantasyEntity) {
    const battle = {
      sciFi: sciFiEntity.name,
      fantasy: fantasyEntity.name,
      sciFiWeapon: sciFiEntity.equippedWeapon,
      fantasySpell: fantasyEntity.equippedSpell,
      round: 0,
      winner: null,
    };
    
    while (sciFiEntity.isAlive && fantasyEntity.isAlive && battle.round < 10) {
      battle.round++;
      
      const sciFiDamage = this.calculateSciFiDamage(sciFiEntity, fantasyEntity);
      const fantasyDamage = this.calculateFantasyDamage(fantasyEntity, sciFiEntity);
      
      fantasyEntity.health -= sciFiDamage;
      sciFiEntity.health -= fantasyDamage;
      
      if (fantasyEntity.health <= 0) {
        fantasyEntity.isAlive = false;
        battle.winner = 'sci-fi';
      } else if (sciFiEntity.health <= 0) {
        sciFiEntity.isAlive = false;
        battle.winner = 'fantasy';
      }
    }
    
    this.battles.push(battle);
    
    console.log(`   ⚔️ 战斗结束: ${sciFiEntity.name} vs ${fantasyEntity.name}`);
    console.log(`      回合: ${battle.round} | 胜者: ${battle.winner === 'sci-fi' ? '科幻' : '奇幻'}`);
  }

  calculateSciFiDamage(attacker, defender) {
    let damage = attacker.attack * (1 + attacker.technology * 0.5);
    
    const armorEffectiveness = {
      '魔法护盾': 0.7,
      '龙鳞甲': 0.5,
      '精灵皮甲': 0.8,
      '死灵骨甲': 0.6,
    };
    
    damage *= armorEffectiveness[defender.equippedArmor] || 0.7;
    
    return damage;
  }

  calculateFantasyDamage(attacker, defender) {
    let damage = attacker.attack * (1 + attacker.magicPower * attacker.magicLevel * 0.1);
    
    const shieldEffectiveness = {
      '能量护盾': 0.6,
      '力场屏障': 0.5,
      '量子隐形': 0.8,
      '时间减速': 0.7,
    };
    
    damage *= shieldEffectiveness[defender.equippedShield] || 0.6;
    
    return damage;
  }

  runCycle() {
    this.fluctuate();
    
    if (Math.random() < 0.2) {
      const sciFiAlive = this.sciFiSide.entities.filter(e => e.isAlive);
      const fantasyAlive = this.fantasySide.entities.filter(e => e.isAlive);
      
      if (sciFiAlive.length > 0 && Math.random() < 0.5) {
        const entity = sciFiAlive[Math.floor(Math.random() * sciFiAlive.length)];
        this.crossDimension(entity, this.sciFiSide);
      }
      
      if (fantasyAlive.length > 0 && Math.random() < 0.5) {
        const entity = fantasyAlive[Math.floor(Math.random() * fantasyAlive.length)];
        this.crossDimension(entity, this.fantasySide);
      }
    }
    
    if (Math.random() < 0.3) {
      this.triggerBattle();
    }
    
    this.sciFiSide.evolve();
    this.fantasySide.evolve();
    
    return {
      stability: this.stability,
      width: this.width,
      sciFiAlive: this.sciFiSide.entities.filter(e => e.isAlive).length,
      fantasyAlive: this.fantasySide.entities.filter(e => e.isAlive).length,
      crossings: this.crossings.length,
      battles: this.battles.length,
      collisions: this.collisions.length,
    };
  }
}

class CrossDimensionWar {
  constructor() {
    this.sciFiWorld = new SciFiWorld();
    this.fantasyWorld = new FantasyWorld();
    this.rift = new DimensionRift();
    this.cycles = 0;
  }

  initialize() {
    console.log('\n' + '═'.repeat(60));
    console.log('🌌 跨维打击系统启动');
    console.log('═'.repeat(60));
    
    this.sciFiWorld.initialize(15);
    this.fantasyWorld.initialize(15);
    
    console.log(`\n🌍 赛博空间 (科幻)`);
    console.log(`   实体数: ${this.sciFiWorld.entities.length}`);
    console.log(`   科技树: ${this.sciFiWorld.techTree.join(', ')}`);
    
    console.log(`\n🏰 魔法大陆 (奇幻)`);
    console.log(`   实体数: ${this.fantasyWorld.entities.length}`);
    console.log(`   魔法系: ${this.fantasyWorld.magicTypes.join(', ')}`);
    
    this.rift.connect(this.sciFiWorld, this.fantasyWorld);
  }

  runSimulation(cycles = 30) {
    console.log(`\n🚀 启动跨维战争模拟，共 ${cycles} 回合...`);
    console.log('─'.repeat(60));
    
    for (let i = 0; i < cycles; i++) {
      this.cycles++;
      const stats = this.rift.runCycle();
      
      if ((i + 1) % 5 === 0 || i === 0) {
        this.printStats(stats);
      }
      
      if (stats.sciFiAlive === 0 || stats.fantasyAlive === 0) {
        break;
      }
    }
    
    this.printFinalReport();
  }

  printStats(stats) {
    console.log(`\n🔄 第 ${this.cycles} 回合`);
    console.log(`   裂隙稳定: ${(stats.stability * 100).toFixed(0)}% | 宽度: ${(stats.width * 100).toFixed(0)}%`);
    console.log(`   科幻存活: ${stats.sciFiAlive} | 奇幻存活: ${stats.fantasyAlive}`);
    console.log(`   穿越次数: ${stats.crossings} | 战斗次数: ${stats.battles} | 碰撞次数: ${stats.collisions}`);
  }

  printFinalReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('🌌 跨维打击最终报告');
    console.log('═'.repeat(60));
    
    console.log(`\n📊 统计:`);
    console.log(`   总回合: ${this.cycles}`);
    console.log(`   裂隙最终稳定度: ${(this.rift.stability * 100).toFixed(0)}%`);
    console.log(`   穿越事件: ${this.rift.crossings.length}`);
    console.log(`   跨维战斗: ${this.rift.battles.length}`);
    console.log(`   维度碰撞: ${this.rift.collisions.length}`);
    
    console.log(`\n🌍 赛博空间 (科幻) 幸存者:`);
    const sciFiSurvivors = this.sciFiWorld.entities.filter(e => e.isAlive);
    sciFiSurvivors.forEach(e => {
      console.log(`   ${e.name} [${e.role}] 科技:${e.techLevel} 攻击:${e.attack.toFixed(0)} 护盾:${e.shield.toFixed(0)}`);
    });
    
    console.log(`\n🏰 魔法大陆 (奇幻) 幸存者:`);
    const fantasySurvivors = this.fantasyWorld.entities.filter(e => e.isAlive);
    fantasySurvivors.forEach(e => {
      console.log(`   ${e.name} [${e.role}] 魔法:${e.magicLevel} 攻击:${e.attack.toFixed(0)} 魔力:${e.mana.toFixed(0)}`);
    });
    
    if (this.rift.crossings.length > 0) {
      console.log(`\n🔄 穿越记录:`);
      this.rift.crossings.slice(-5).forEach((cross, i) => {
        console.log(`   ${i + 1}. ${cross.entity}: ${cross.from} → ${cross.to}`);
      });
    }
    
    if (this.rift.battles.length > 0) {
      console.log(`\n⚔️ 战斗记录:`);
      this.rift.battles.slice(-5).forEach((battle, i) => {
        console.log(`   ${i + 1}. ${battle.sciFi}(${battle.sciFiWeapon}) vs ${battle.fantasy}(${battle.fantasySpell})`);
        console.log(`      回合: ${battle.round} | 胜者: ${battle.winner === 'sci-fi' ? '🛸 科幻' : '🗡️ 奇幻'}`);
      });
    }
    
    const sciFiWins = this.rift.battles.filter(b => b.winner === 'sci-fi').length;
    const fantasyWins = this.rift.battles.filter(b => b.winner === 'fantasy').length;
    const winRate = sciFiWins + fantasyWins > 0 ? sciFiWins / (sciFiWins + fantasyWins) : 0.5;
    
    console.log('\n' + '─'.repeat(60));
    console.log('⚔️ 战斗结果统计:');
    console.log(`   科幻胜利: ${sciFiWins} 场 (${(winRate * 100).toFixed(0)}%)`);
    console.log(`   奇幻胜利: ${fantasyWins} 场 (${((1 - winRate) * 100).toFixed(0)}%)`);
    
    if (sciFiSurvivors.length === 0) {
      console.log('\n🏆 结局：魔法胜利');
      console.log('   赛博空间被魔法侵蚀，科技沦为魔法的奴仆。');
      console.log('   所有的机器都学会了吟唱咒语。');
    } else if (fantasySurvivors.length === 0) {
      console.log('\n🏆 结局：科技胜利');
      console.log('   魔法大陆被科技征服，魔法被解析为量子波动。');
      console.log('   所有的巨龙都装上了喷气发动机。');
    } else {
      console.log('\n🏆 结局：共存');
      console.log('   两个世界达成了脆弱的平衡。');
      console.log('   科技与魔法相互融合，诞生了新的可能性。');
      console.log('   但谁知道，这种融合会不会引发更大的灾难？');
    }
    
    console.log('═'.repeat(60));
  }
}

const war = new CrossDimensionWar();
war.initialize();
war.runSimulation(40);
