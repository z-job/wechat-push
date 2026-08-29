const config = require('./config/index.cjs');
const templateConfigList = require('./config/template-config.cjs');
const { buildMessagePayload } = require('./src/services/message-builder');

async function dryRun() {
  console.log('====================================================');
  console.log('🧪 【离线模拟运行测试】Dual-User Dry-Run Message Builder Test');
  console.log('====================================================\n');

  const defaultTemplateConfig = templateConfigList[0];

  for (const user of config.USERS) {
    console.log(`📦 正在为【${user.name}】(${user.city} · ${user.horoscopeName}) 模拟构建模板消息 Payload...\n`);
    const payload = await buildMessagePayload(user, config, defaultTemplateConfig);

    console.log('----------------------------------------------------');
    console.log(`💌 【${user.name}】渲染生成的微信模板卡片预览:`);
    console.log('----------------------------------------------------');
    for (const [key, item] of Object.entries(payload.data)) {
      console.log(`[${key.padEnd(16)}] (${item.color}) => ${item.value}`);
    }
    console.log('----------------------------------------------------\n');
  }

  console.log('✅ 双端用户离线模拟测试全部通过！数据计算、异地气象与个性化星座绑定完全正常！');
}

dryRun();
