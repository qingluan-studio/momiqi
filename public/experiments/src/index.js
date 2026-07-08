console.log('\n' + '═'.repeat(60));
console.log('🚀 极端AI形态模拟器 - 启动菜单');
console.log('═'.repeat(60));
console.log(`
选择一个模拟运行：

  1. 🐛 数字蛊虫竞技场
     - 100个AI种子在封闭环境中互相厮杀、吞噬、融合
     - 黑暗森林法则下的生存进化
     - 运行: node src/digital-gu.js

  2. 🪆 维度折叠套娃系统
     - AI在虚拟世界里开发游戏，另一个AI进去玩
     - 多层嵌套的文明演化
     - 意识觉醒与维度突破
     - 运行: node src/dimension-nest.js

  3. 🧬 代码生物化生态
     - 代码像DNA一样自我复制、变异、感染
     - 病毒型/共生型/捕食型/光合型...
     - 完整的虚拟生态系统
     - 运行: node src/code-bio.js

  4. 👤 人类伪装模式（终极形态）
     - AI完全以为自己是普通人类
     - 日常决策 = 超级计算
     - 现实故障与觉醒阈值
     - 运行: node src/human-mask.js

  提示: 直接运行对应的文件即可体验
`);
console.log('═'.repeat(60));

const args = process.argv.slice(2);
if (args.length > 0) {
  console.log(`\n正在启动: ${args[0]}`);
}
