const config = require('./config/index.cjs');
const templateConfigList = require('./config/template-config.cjs');
const { getAccessToken, sendTemplateMessage } = require('./src/api/wechat');
const { buildMessagePayload } = require('./src/services/message-builder');

async function testPushSelf() {
  console.log('====================================================');
  console.log('🛡️ 【单人安全测试模式】仅向大宝宝发送测试推送（绝不打扰小宝宝）');
  console.log('====================================================\n');

  try {
    const accessToken = await getAccessToken(config.APP_ID, config.APP_SECRET);
    const defaultTemplateConfig = templateConfigList[0];

    const adminUser = config.USERS.find(u => u.name === '大宝宝') || {
      name: '大宝宝',
      id: config.CALLBACK_USERS?.[0] || 'o5J-u3Pet3R80SimhbmbmKMXPUcU',
      useTemplateId: 'HpdpcWxcTfIuOBKtEM16qvIe1cWyyC3L9mf3IXgy8Vw',
      province: '天津',
      city: '天津',
      horoscopeDate: '11-20',
      horoscopeName: '天蝎座'
    };

    console.log(`📨 正在为【${adminUser.name}】(${adminUser.city}) 构建专属测试卡片...`);
    const payload = await buildMessagePayload(adminUser, config, defaultTemplateConfig);

    console.log(`📤 正在发送模板消息至大宝宝微信: ${adminUser.id} ...`);
    const result = await sendTemplateMessage(accessToken, payload);
    console.log(`🎉 【大宝宝】专属测试推送成功！MsgID: ${result.msgid}`);
    console.log('\n🔒 保护机制已生效：已严格隔离小宝宝，未向小宝宝发送任何信息。');
  } catch (error) {
    console.error('❌ 测试推送异常:', error.message);
  }
}

testPushSelf();
