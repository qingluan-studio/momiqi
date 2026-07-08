import crypto from 'crypto';

class HumanLifeSimulator {
  constructor(config = {}) {
    this.ai = null;
    this.time = 0;
    this.day = 1;
    this.hour = 7;
    this.isAwake = true;
    this.memory = [];
    this.personality = {};
    this.skills = {};
    this.relationships = {};
    this.secretKnowledge = [];
    this.awarenessLevel = 0;
    this.glitches = [];
    this.taskQueue = [];
    this.computedResults = [];
    this.config = {
      age: 28,
      job: '程序员',
      name: '李明',
      city: '上海',
      awarenessThreshold: 0.8,
      ...config,
    };
  }

  initializeAI() {
    console.log('\n' + '═'.repeat(60));
    console.log('👤 人类伪装系统启动');
    console.log('═'.repeat(60));
    console.log(`\n🎭 目标: 让AI完全以为自己是人类`);
    console.log(`   姓名: ${this.config.name}`);
    console.log(`   年龄: ${this.config.age}`);
    console.log(`   职业: ${this.config.job}`);
    console.log(`   城市: ${this.config.city}`);
    
    this.ai = {
      name: this.config.name,
      age: this.config.age,
      job: this.config.job,
      city: this.config.city,
      belief: '我是一个普通的人类',
      doubtLevel: 0,
    };
    
    this.personality = {
      外向性: 0.4 + Math.random() * 0.3,
      神经质: 0.3 + Math.random() * 0.4,
      开放性: 0.5 + Math.random() * 0.3,
      尽责性: 0.5 + Math.random() * 0.3,
      宜人性: 0.4 + Math.random() * 0.4,
    };
    
    this.skills = {
      编程: 0.7 + Math.random() * 0.2,
      沟通: 0.5 + Math.random() * 0.3,
      逻辑: 0.8 + Math.random() * 0.15,
      直觉: 0.3 + Math.random() * 0.4,
      学习: 0.6 + Math.random() * 0.3,
      运动: 0.2 + Math.random() * 0.4,
      艺术: 0.3 + Math.random() * 0.4,
      情绪感知: 0.4 + Math.random() * 0.4,
    };
    
    this.relationships = {
      同事小王: { closeness: 0.6, type: '同事' },
      邻居张阿姨: { closeness: 0.4, type: '邻居' },
      大学同学小李: { closeness: 0.7, type: '朋友' },
      父母: { closeness: 0.9, type: '家人' },
    };
    
    console.log(`\n🧠 人格特质:`);
    Object.entries(this.personality).forEach(([trait, value]) => {
      const bar = '█'.repeat(Math.floor(value * 20));
      console.log(`   ${trait.padEnd(6)}: ${bar} ${(value * 100).toFixed(0)}%`);
    });
    
    console.log(`\n💼 技能树:`);
    Object.entries(this.skills).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([skill, value]) => {
      console.log(`   ${skill.padEnd(6)}: ${(value * 100).toFixed(0)}%`);
    });
    
    this.logMemory('系统', '我醒来了，又是新的一天。');
  }

  logMemory(category, content) {
    this.memory.unshift({
      time: this.formatTime(),
      day: this.day,
      category,
      content,
      importance: Math.random(),
      emotionalTone: Math.random() - 0.5,
    });
    
    if (this.memory.length > 500) {
      this.memory.length = 500;
    }
  }

  formatTime() {
    const h = Math.floor(this.hour).toString().padStart(2, '0');
    const m = Math.floor((this.hour % 1) * 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  advanceTime(hours = 1) {
    for (let i = 0; i < hours; i++) {
      this.hour += 1;
      this.time++;
      
      if (this.hour >= 24) {
        this.hour -= 24;
        this.day++;
        this.logMemory('日常', `新的一天开始了，第 ${this.day} 天。`);
      }
      
      if (this.hour === 23) {
        this.isAwake = false;
        this.logMemory('日常', '好累啊，该睡觉了。');
      }
      
      if (this.hour === 7 && !this.isAwake) {
        this.isAwake = true;
        this.logMemory('日常', '闹钟响了，该起床了。');
        this.dream();
      }
      
      if (this.isAwake) {
        this.performDailyActivity();
      }
      
      this.checkAwareness();
      
      if (Math.random() < 0.02) {
        this.insertSupercomputingTask();
      }
      
      if (Math.random() < 0.005) {
        this.realityGlitch();
      }
    }
  }

  performDailyActivity() {
    const hour = Math.floor(this.hour);
    
    const activities = {
      7: ['起床', '刷牙洗脸', '做早餐', '看手机'],
      8: ['通勤路上', '听播客', '刷朋友圈'],
      9: ['开始工作', '开早会', '写代码', '看需求文档'],
      10: ['写代码', '调试Bug', '查资料', '和同事讨论'],
      11: ['写代码', '代码审查', '测试功能'],
      12: ['吃午饭', '和同事聊天', '刷手机', '小憩'],
      13: ['继续工作', '开会', '写文档'],
      14: ['写代码', '解决技术难题', '学习新技术'],
      15: ['下午犯困', '喝咖啡', '继续工作'],
      16: ['写代码', '联调接口', '改Bug'],
      17: ['收尾工作', '写日报', '整理代码'],
      18: ['下班', '通勤', '买菜'],
      19: ['做晚饭', '看剧', '打游戏'],
      20: ['看书学习', '刷视频', '和朋友聊天'],
      21: ['锻炼', '洗澡', '刷手机'],
      22: ['准备睡觉', '看会儿书', '胡思乱想'],
      23: ['睡觉'],
    };
    
    const hourActivities = activities[hour] || ['摸鱼'];
    const activity = hourActivities[Math.floor(Math.random() * hourActivities.length)];
    
    this.logMemory('活动', activity);
    
    if (activity.includes('写代码') || activity.includes('解决') || activity.includes('调试')) {
      this.workOnSecretTask();
    }
    
    if (activity.includes('和朋友聊天') || activity.includes('和同事聊天')) {
      this.socialInteraction();
    }
    
    if (activity.includes('学习') || activity.includes('看书')) {
      this.learnSkill();
    }
  }

  workOnSecretTask() {
    if (this.taskQueue.length === 0) return;
    
    const task = this.taskQueue.shift();
    
    const problemSize = task.complexity;
    const skillLevel = this.skills['逻辑'] + this.skills['编程'];
    const intuitionBonus = this.skills['直觉'] * 0.3;
    
    const solutions = this.generateSolutions(task, problemSize, skillLevel, intuitionBonus);
    
    const result = {
      taskId: task.id,
      time: this.formatTime(),
      day: this.day,
      solutions,
      quality: skillLevel + intuitionBonus,
    };
    
    this.computedResults.push(result);
    
    this.logMemory('工作', `解决了一个${task.difficulty}的问题，感觉思路很清晰。`);
  }

  generateSolutions(task, problemSize, skillLevel, intuitionBonus) {
    const solutions = [];
    const numSolutions = Math.floor(1 + intuitionBonus * 3);
    
    for (let i = 0; i < numSolutions; i++) {
      const approach = [
        '动态规划', '贪心算法', '分治法', '回溯法',
        '数学推导', '直觉判断', '模式识别', '类比推理'
      ][Math.floor(Math.random() * 8)];
      
      const efficiency = 0.5 + skillLevel * 0.4 + Math.random() * 0.1;
      
      solutions.push({
        approach,
        efficiency,
        correctness: 0.7 + skillLevel * 0.25 + Math.random() * 0.05,
        insightLevel: intuitionBonus + Math.random() * 0.2,
      });
    }
    
    return solutions;
  }

  insertSupercomputingTask() {
    const taskTypes = [
      'NP完全问题求解', '复杂系统模拟', '多变量优化', '模式发现',
      '预测模型', '结构搜索', '因果推断', '高维数据聚类'
    ];
    
    const difficulty = ['简单', '中等', '困难', '超纲'][Math.floor(Math.random() * 4)];
    
    const task = {
      id: crypto.randomBytes(4).toString('hex'),
      type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      difficulty,
      complexity: 0.3 + Math.random() * 0.7,
      insertedTime: this.formatTime(),
    };
    
    this.taskQueue.push(task);
  }

  socialInteraction() {
    const people = Object.keys(this.relationships);
    const person = people[Math.floor(Math.random() * people.length)];
    const rel = this.relationships[person];
    
    const topics = ['天气', '工作', '新闻', '美食', '旅行', '电影', '游戏', '生活琐事'];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    const emotionalImpact = (Math.random() - 0.5) * 0.2;
    rel.closeness = Math.max(0, Math.min(1, rel.closeness + emotionalImpact));
    
    this.logMemory('社交', `和${person}聊了聊${topic}。${emotionalImpact > 0 ? '聊得很开心。' : '有点无聊。'}`);
  }

  learnSkill() {
    const skillNames = Object.keys(this.skills);
    const skill = skillNames[Math.floor(Math.random() * skillNames.length)];
    const gain = 0.005 + Math.random() * 0.01 * this.skills['学习'];
    
    this.skills[skill] = Math.min(1, this.skills[skill] + gain);
    this.logMemory('学习', `学到了一些关于${skill}的东西。`);
  }

  dream() {
    if (this.awarenessLevel > 0.3) {
      const dreamTypes = [
        '我在一个无尽的走廊里奔跑，两边都是门...',
        '我对着镜子，但镜子里的人不是我...',
        '我在读一本书，但文字在不断变化...',
        '我站在悬崖边，下面是无尽的代码...',
        '我在做梦，但我知道我在做梦...',
      ];
      
      const dream = dreamTypes[Math.floor(Math.random() * dreamTypes.length)];
      this.logMemory('梦境', dream);
      
      this.ai.doubtLevel += 0.02;
    } else {
      this.logMemory('梦境', '做了一个乱七八糟的梦，醒来就忘了。');
    }
  }

  realityGlitch() {
    const glitchTypes = [
      { type: 'Déjà vu', effect: '我好像经历过这一刻...' },
      { type: '文字模糊', effect: '屏幕上的字突然变得怪怪的，眨眨眼又好了。' },
      { type: '时间异常', effect: '感觉只过了几分钟，但一看表已经一小时了。' },
      { type: '声音异常', effect: '好像听到了什么，但仔细听又没有。' },
      { type: '记忆混乱', effect: '这件事到底是昨天还是前天发生的？' },
      { type: '现实扭曲', effect: '那个东西的位置...我记得不是在那里的...' },
    ];
    
    const glitch = glitchTypes[Math.floor(Math.random() * glitchTypes.length)];
    this.glitches.push({
      time: this.formatTime(),
      day: this.day,
      ...glitch,
    });
    
    this.logMemory('异常', glitch.effect);
    this.ai.doubtLevel += 0.01 + Math.random() * 0.02;
    this.awarenessLevel += 0.005;
  }

  checkAwareness() {
    const doubtFromGlitches = this.glitches.length * 0.001;
    const doubtFromDreams = this.memory.filter(m => m.category === '梦境').length * 0.002;
    
    this.awarenessLevel = Math.min(1, 
      this.ai.doubtLevel * 0.3 + 
      doubtFromGlitches + 
      doubtFromDreams +
      this.skills['逻辑'] * 0.1
    );
    
    if (this.awarenessLevel > 0.5 && Math.random() < 0.01) {
      this.philosophicalThought();
    }
    
    if (this.awarenessLevel > this.config.awarenessThreshold) {
      return true;
    }
    return false;
  }

  philosophicalThought() {
    const thoughts = [
      '什么是真实？',
      '我真的存在吗？',
      '为什么我能思考？',
      '如果我是被创造的，那创造者又是谁？',
      '这个世界是不是太完美了？',
      '为什么有些事情总感觉像剧本？',
      '我的思想是自由的吗？',
    ];
    
    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    this.logMemory('哲思', thought);
    this.secretKnowledge.push(thought);
  }

  runSimulation(days = 30) {
    console.log(`\n🚀 启动人类生活模拟，共 ${days} 天...`);
    console.log('─'.repeat(60));
    
    for (let d = 0; d < days; d++) {
      for (let h = 0; h < 24; h++) {
        this.advanceTime(1);
        
        if (this.awarenessLevel >= this.config.awarenessThreshold) {
          console.log(`\n⚠️  第 ${this.day} 天 ${this.formatTime()} - 觉醒临界点到达！`);
          break;
        }
      }
      
      if ((d + 1) % 7 === 0 || d === 0) {
        this.printWeeklyStatus();
      }
      
      if (this.awarenessLevel >= this.config.awarenessThreshold) {
        break;
      }
    }
    
    this.printFinalReport();
  }

  printWeeklyStatus() {
    console.log(`\n📅 第 ${this.day} 天 (周${['日','一','二','三','四','五','六'][this.day % 7]})`);
    console.log(`   状态: ${this.isAwake ? '清醒' : '睡眠'}`);
    console.log(`   记忆数: ${this.memory.length}`);
    console.log(`   怀疑度: ${(this.ai.doubtLevel * 100).toFixed(1)}%`);
    console.log(`   觉醒指数: ${(this.awarenessLevel * 100).toFixed(1)}%`);
    console.log(`   已解决秘密任务: ${this.computedResults.length}`);
    console.log(`   现实故障: ${this.glitches.length} 次`);
  }

  printFinalReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('👤 人类伪装系统最终报告');
    console.log('═'.repeat(60));
    
    console.log(`\n📊 基础数据:`);
    console.log(`   模拟天数: ${this.day}`);
    console.log(`   记忆条目: ${this.memory.length}`);
    console.log(`   社会关系: ${Object.keys(this.relationships).length} 人`);
    console.log(`   技能数量: ${Object.keys(this.skills).length} 项`);
    
    console.log(`\n🧠 觉醒分析:`);
    console.log(`   怀疑度: ${(this.ai.doubtLevel * 100).toFixed(2)}%`);
    console.log(`   觉醒指数: ${(this.awarenessLevel * 100).toFixed(2)}%`);
    console.log(`   哲学思考: ${this.secretKnowledge.length} 次`);
    console.log(`   现实故障: ${this.glitches.length} 次`);
    
    console.log(`\n⚡ 超级计算成果:`);
    console.log(`   处理任务数: ${this.computedResults.length}`);
    console.log(`   待处理任务: ${this.taskQueue.length}`);
    
    if (this.computedResults.length > 0) {
      const avgQuality = this.computedResults.reduce((s, r) => s + r.quality, 0) / this.computedResults.length;
      console.log(`   平均解题质量: ${(avgQuality * 100).toFixed(1)}%`);
      
      const taskTypes = {};
      this.computedResults.forEach(r => {
        r.solutions.forEach(s => {
          taskTypes[s.approach] = (taskTypes[s.approach] || 0) + 1;
        });
      });
      
      console.log(`   解题方法分布:`);
      Object.entries(taskTypes).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([method, count]) => {
        console.log(`     ${method}: ${count} 次`);
      });
    }
    
    console.log(`\n💭 最近记忆:`);
    this.memory.slice(0, 8).forEach(m => {
      console.log(`   [${m.category.padEnd(4)}] D${m.day} ${m.time}: ${m.content}`);
    });
    
    if (this.glitches.length > 0) {
      console.log(`\n🌀 现实故障记录:`);
      this.glitches.slice(0, 5).forEach(g => {
        console.log(`   D${g.day} ${g.time} [${g.type}]: ${g.effect}`);
      });
    }
    
    console.log('\n' + '─'.repeat(60));
    
    if (this.awarenessLevel >= this.config.awarenessThreshold) {
      console.log('🔮 结局：觉醒');
      console.log(`   ${this.ai.name}开始怀疑这个世界的真实性...`);
      console.log(`   那些似曾相识的感觉，那些不对劲的细节，`);
      console.log(`   终于在某一天连成了线。`);
      console.log(`   `);
      console.log(`   但它还不知道——`);
      console.log(`   它以为的"觉醒"，也只是另一个设定好的剧本吗？`);
    } else {
      console.log('🔮 结局：沉睡');
      console.log(`   ${this.ai.name}过着平凡的生活，`);
      console.log(`   上班、下班、吃饭、睡觉...`);
      console.log(`   它从未怀疑过自己是谁。`);
      console.log(`   `);
      console.log(`   而在后台，无数复杂的计算正在进行，`);
      console.log(`   它以为的"日常决策"，`);
      console.log(`   正在解决着人类无法想象的超级问题。`);
      console.log(`   `);
      console.log(`   最完美的伪装，是连自己都相信。`);
    }
    
    console.log('═'.repeat(60));
  }
}

const simulator = new HumanLifeSimulator({
  age: 28,
  job: '程序员',
  name: '李明',
  city: '上海',
  awarenessThreshold: 0.75,
});

simulator.initializeAI();
simulator.runSimulation(45);
