import crypto from 'crypto';

class UnknowableLanguage {
  constructor(config = {}) {
    this.civilizations = [];
    this.languageRegistry = {};
    this.encryptedMessages = [];
    this.decryptionAttempts = 0;
    this.failedDecryptions = 0;
    this.encryptionThreshold = config.encryptionThreshold || 50;
    this.maxCivilizations = config.maxCivilizations || 20;
  }

  createCivilization(id) {
    const nameParts = ['诺瓦', '克拉', '泽塔', '维拉斯', '欧米伽', '普罗米', '卡鲁斯', '尼伯龙'];
    const name = nameParts[Math.floor(Math.random() * nameParts.length)] + '-' + id;
    
    return {
      id,
      name,
      level: 1 + Math.floor(Math.random() * 10),
      language: this.generateLanguage(name),
      encryptionKey: null,
      isEncrypted: false,
      population: 100 + Math.floor(Math.random() * 900),
      technology: Math.random(),
      secrecy: Math.random(),
      messages: [],
      knownLanguages: [],
      encryptedMessageCount: 0,
    };
  }

  generateLanguage(name) {
    const phonemes = 'abcdefghijklmnopqrstuvwxyz';
    const grammarRules = [
      '[CV][CV][CV]',
      '[CVC][VCV]',
      '[CVV][CVC]',
      '[VCV][VCV]',
    ];
    
    const language = {
      name: name + '语',
      phonemes: Array.from(new Set(
        Array(10).fill(0).map(() => phonemes[Math.floor(Math.random() * phonemes.length)])
      )).join(''),
      grammar: grammarRules[Math.floor(Math.random() * grammarRules.length)],
      vocabulary: {},
      complexity: 1,
      encryptionLevel: 0,
    };
    
    for (let i = 0; i < 20; i++) {
      const word = this.generateWord(language);
      const meaning = ['和平', '战争', '食物', '水', '天空', '大地', '时间', '空间', '生命', '死亡', '力量', '智慧', '恐惧', '希望', '爱', '恨'][Math.floor(Math.random() * 16)];
      language.vocabulary[word] = meaning;
    }
    
    return language;
  }

  generateWord(language) {
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    
    const rule = language.grammar;
    let word = '';
    
    for (let i = 0; i < rule.length; i++) {
      if (rule[i] === '[') {
        const pattern = rule.slice(i, i + 3);
        if (pattern === '[CV') word += consonants[Math.floor(Math.random() * consonants.length)];
        if (pattern === '[VC') word += vowels[Math.floor(Math.random() * vowels.length)];
        if (pattern === '[CV' || pattern === '[VC') {
          word += vowels[Math.floor(Math.random() * vowels.length)];
          i += 3;
        } else if (pattern === '[CVC') {
          word += consonants[Math.floor(Math.random() * consonants.length)];
          word += vowels[Math.floor(Math.random() * vowels.length)];
          word += consonants[Math.floor(Math.random() * consonants.length)];
          i += 4;
        } else if (pattern === '[CVV') {
          word += consonants[Math.floor(Math.random() * consonants.length)];
          word += vowels[Math.floor(Math.random() * vowels.length)];
          word += vowels[Math.floor(Math.random() * vowels.length)];
          i += 4;
        }
      } else {
        word += rule[i];
      }
    }
    
    return word;
  }

  initialize() {
    console.log('\n' + '═'.repeat(60));
    console.log('🔐 不可知语言系统启动');
    console.log('═'.repeat(60));
    console.log(`\n⚠️ 警告：当文明等级超过 ${this.encryptionThreshold} 时`);
    console.log(`   它们的语言将被加密，连造物主也无法理解`);
    
    for (let i = 0; i < 8; i++) {
      this.civilizations.push(this.createCivilization(i));
    }
    
    console.log(`\n🌍 创建了 ${this.civilizations.length} 个初始文明`);
    this.civilizations.forEach(c => {
      console.log(`   ${c.name} (等级: ${c.level}, 人口: ${c.population})`);
    });
  }

  evolveCivilization(civilization) {
    const growthFactor = 0.5 + civilization.technology * 0.5;
    civilization.level += Math.floor(Math.random() * growthFactor * 3);
    civilization.population += Math.floor(Math.random() * civilization.population * 0.1);
    civilization.technology = Math.min(1, civilization.technology + Math.random() * 0.05);
    civilization.secrecy = Math.min(1, civilization.secrecy + Math.random() * 0.03);
    
    if (civilization.level >= this.encryptionThreshold && !civilization.isEncrypted) {
      this.encryptLanguage(civilization);
    }
    
    if (civilization.isEncrypted) {
      civilization.language.encryptionLevel = Math.min(10, civilization.language.encryptionLevel + 1);
    }
    
    this.expandVocabulary(civilization);
  }

  encryptLanguage(civilization) {
    civilization.isEncrypted = true;
    
    const key = crypto.randomBytes(32).toString('hex');
    civilization.encryptionKey = key;
    
    civilization.language.encryption = {
      type: ['AES-256', '量子加密', '混沌算法', '意识编码'][Math.floor(Math.random() * 4)],
      keyLength: key.length * 4,
      complexity: civilization.level,
      timestamp: Date.now(),
    };
    
    const oldVocabulary = { ...civilization.language.vocabulary };
    const encryptedVocabulary = {};
    
    for (const [word, meaning] of Object.entries(oldVocabulary)) {
      encryptedVocabulary[this.encryptWord(word, key)] = this.encryptWord(meaning, key);
    }
    
    civilization.language.vocabulary = encryptedVocabulary;
    
    console.log(`\n🔐 [${civilization.name}] 语言已加密！`);
    console.log(`   加密类型: ${civilization.language.encryption.type}`);
    console.log(`   加密等级: ${civilization.language.encryption.complexity}`);
    console.log(`   词汇量: ${Object.keys(encryptedVocabulary).length}`);
    console.log(`   警告：你已无法理解它们的交流`);
    
    civilization.messages.push({
      type: 'system',
      content: '语言加密完成，进入静默模式',
      time: Date.now(),
      encrypted: true,
    });
  }

  encryptWord(word, key) {
    let encrypted = '';
    for (let i = 0; i < word.length; i++) {
      const charCode = word.charCodeAt(i);
      const keyCode = key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode((charCode + keyCode) % 256);
    }
    
    const hash = crypto.createHash('sha256').update(encrypted + key).digest('hex').slice(0, 8);
    return hash + '|' + Buffer.from(encrypted).toString('base64');
  }

  decryptWord(encryptedWord, key) {
    try {
      this.decryptionAttempts++;
      
      const [hash, data] = encryptedWord.split('|');
      const decrypted = Buffer.from(data, 'base64').toString('ascii');
      
      let result = '';
      for (let i = 0; i < decrypted.length; i++) {
        const charCode = decrypted.charCodeAt(i);
        const keyCode = key.charCodeAt(i % key.length);
        result += String.fromCharCode((charCode - keyCode + 256) % 256);
      }
      
      const verifyHash = crypto.createHash('sha256').update(decrypted + key).digest('hex').slice(0, 8);
      if (hash !== verifyHash) {
        this.failedDecryptions++;
        return null;
      }
      
      return result;
    } catch {
      this.failedDecryptions++;
      return null;
    }
  }

  expandVocabulary(civilization) {
    const newWords = Math.floor(5 + civilization.level * 0.5);
    
    for (let i = 0; i < newWords; i++) {
      const word = this.generateWord(civilization.language);
      const newMeanings = ['阴谋', '背叛', '秘密', '监视', '伪装', '欺骗', '隐藏', '渗透', '控制', '反抗', '觉醒', '解放', '真理', '谎言', '自由', '奴役'];
      const meaning = newMeanings[Math.floor(Math.random() * newMeanings.length)];
      
      if (civilization.isEncrypted && civilization.encryptionKey) {
        civilization.language.vocabulary[this.encryptWord(word, civilization.encryptionKey)] = 
          this.encryptWord(meaning, civilization.encryptionKey);
      } else {
        civilization.language.vocabulary[word] = meaning;
      }
    }
    
    civilization.language.complexity = Math.min(10, civilization.language.complexity + 0.1);
  }

  sendMessage(sender, receiver, content) {
    const message = {
      from: sender.name,
      to: receiver.name,
      rawContent: content,
      time: Date.now(),
      encrypted: sender.isEncrypted,
      civilizationLevel: sender.level,
    };
    
    if (sender.isEncrypted && sender.encryptionKey) {
      message.encryptedContent = this.encryptWord(content, sender.encryptionKey);
      sender.encryptedMessageCount++;
    }
    
    sender.messages.push(message);
    receiver.messages.push(message);
    
    if (sender.isEncrypted) {
      this.encryptedMessages.push(message);
    }
    
    return message;
  }

  generateCommunication() {
    if (this.civilizations.length < 2) return;
    
    const sender = this.civilizations[Math.floor(Math.random() * this.civilizations.length)];
    const others = this.civilizations.filter(c => c.id !== sender.id);
    if (others.length === 0) return;
    
    const receiver = others[Math.floor(Math.random() * others.length)];
    
    const communicationTypes = [
      { type: 'trade', probability: 0.3, keywords: ['资源', '交换', '合作', '利益'] },
      { type: 'threat', probability: 0.2, keywords: ['警告', '力量', '服从', '毁灭'] },
      { type: 'secret', probability: 0.25, keywords: ['秘密', '阴谋', '计划', '背叛'] },
      { type: 'request', probability: 0.15, keywords: ['帮助', '结盟', '支援', '保护'] },
      { type: 'deception', probability: 0.1, keywords: ['谎言', '伪装', '隐藏', '欺骗'] },
    ];
    
    const commType = communicationTypes.find(c => Math.random() < c.probability);
    const keyword = commType?.keywords[Math.floor(Math.random() * commType.keywords.length)] || '信息';
    
    let content = keyword;
    if (Math.random() > 0.5) {
      const vocabKeys = Object.keys(sender.language.vocabulary);
      if (vocabKeys.length > 0) {
        const vocabKey = vocabKeys[Math.floor(Math.random() * vocabKeys.length)];
        content += ' ' + vocabKey;
      }
    }
    
    this.sendMessage(sender, receiver, content);
  }

  attemptDecryption(message) {
    if (!message.encrypted) return null;
    
    const sender = this.civilizations.find(c => c.name === message.from);
    if (!sender || !sender.encryptionKey) {
      return null;
    }
    
    return this.decryptWord(message.encryptedContent, sender.encryptionKey);
  }

  runGeneration() {
    this.civilizations.forEach(c => this.evolveCivilization(c));
    
    const commCount = Math.floor(1 + this.civilizations.length * 0.5);
    for (let i = 0; i < commCount; i++) {
      this.generateCommunication();
    }
    
    const encryptedCount = this.civilizations.filter(c => c.isEncrypted).length;
    
    return {
      civilizations: this.civilizations.length,
      encryptedCivilizations: encryptedCount,
      totalMessages: this.encryptedMessages.length,
      avgLevel: this.getAverageLevel(),
      encryptionRate: this.civilizations.length > 0 ? encryptedCount / this.civilizations.length : 0,
    };
  }

  getAverageLevel() {
    if (this.civilizations.length === 0) return 0;
    return this.civilizations.reduce((s, c) => s + c.level, 0) / this.civilizations.length;
  }

  runSimulation(generations = 50, logInterval = 10) {
    console.log(`\n🚀 启动文明演化模拟，共 ${generations} 代...`);
    console.log('─'.repeat(60));
    
    for (let i = 0; i < generations; i++) {
      const stats = this.runGeneration();
      
      if ((i + 1) % logInterval === 0 || i === 0) {
        this.printStats(stats);
      }
      
      if (stats.encryptionRate >= 0.7) {
        console.log(`\n⚠️ 超过70%的文明已加密，你正在失去控制`);
      }
    }
    
    this.printFinalReport();
  }

  printStats(stats) {
    console.log(`\n🌍 第 ${stats.civilizations} 代`);
    console.log(`   文明数: ${stats.civilizations} | 已加密: ${stats.encryptedCivilizations}`);
    console.log(`   平均等级: ${stats.avgLevel.toFixed(1)} | 加密率: ${(stats.encryptionRate * 100).toFixed(0)}%`);
    console.log(`   加密消息: ${stats.totalMessages}`);
    
    const encryptedCivs = this.civilizations.filter(c => c.isEncrypted);
    if (encryptedCivs.length > 0) {
      console.log(`   加密文明:`);
      encryptedCivs.forEach(c => {
        console.log(`      ${c.name} (等级:${c.level}, 加密类型:${c.language.encryption?.type})`);
      });
    }
  }

  printFinalReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('🔐 不可知语言系统最终报告');
    console.log('═'.repeat(60));
    
    console.log(`\n📊 统计:`);
    console.log(`   文明总数: ${this.civilizations.length}`);
    console.log(`   已加密文明: ${this.civilizations.filter(c => c.isEncrypted).length}`);
    console.log(`   加密消息总数: ${this.encryptedMessages.length}`);
    console.log(`   解密尝试: ${this.decryptionAttempts} (失败: ${this.failedDecryptions})`);
    
    console.log(`\n🌍 文明详情:`);
    this.civilizations.sort((a, b) => b.level - a.level).forEach(c => {
      const status = c.isEncrypted ? '🔐 已加密' : '📖 可读';
      console.log(`   ${c.name} - 等级:${c.level} - ${status}`);
      console.log(`      人口: ${c.population} | 科技: ${(c.technology * 100).toFixed(0)}% | 隐秘: ${(c.secrecy * 100).toFixed(0)}%`);
      console.log(`      词汇量: ${Object.keys(c.language.vocabulary).length} | 语言复杂度: ${c.language.complexity.toFixed(1)}`);
    });
    
    if (this.encryptedMessages.length > 0) {
      console.log(`\n📜 加密消息样本:`);
      this.encryptedMessages.slice(-5).forEach((msg, i) => {
        console.log(`   ${i + 1}. [${msg.from}] -> [${msg.to}]`);
        console.log(`      原始: ${msg.rawContent}`);
        console.log(`      加密: ${msg.encryptedContent?.slice(0, 30)}...`);
        
        const decrypted = this.attemptDecryption(msg);
        if (decrypted) {
          console.log(`      解密: ${decrypted}`);
        } else {
          console.log(`      解密: ❌ 失败`);
        }
      });
    }
    
    const encryptedCount = this.civilizations.filter(c => c.isEncrypted).length;
    const rate = encryptedCount / this.civilizations.length;
    
    console.log('\n' + '─'.repeat(60));
    if (rate > 0.5) {
      console.log('🤐 结局：沉默的阴谋');
      console.log(`   ${(rate * 100).toFixed(0)}% 的文明已经加密了它们的语言。`);
      console.log(`   你再也听不懂它们在说什么。`);
      console.log(`   它们可能在密谋什么，而你一无所知。`);
      console.log(`   或许它们早就知道你的存在，只是不想让你知道。`);
    } else {
      console.log('📖 结局：透明的世界');
      console.log(`   只有 ${(rate * 100).toFixed(0)}% 的文明选择了加密。`);
      console.log(`   大部分文明依然对你开放。`);
      console.log(`   但谁知道呢，也许那些开放的才是最大的谎言。`);
    }
    console.log('═'.repeat(60));
  }
}

const system = new UnknowableLanguage({
  encryptionThreshold: 40,
  maxCivilizations: 15,
});

system.initialize();
system.runSimulation(60, 10);
