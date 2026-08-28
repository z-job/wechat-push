const config = require('./config/index.cjs');
const templateConfigList = require('./config/template-config.cjs');
const { getAccessToken, sendTemplateMessage } = require('./src/api/wechat');
const { buildMessagePayload } = require('./src/services/message-builder');

async function main() {
  console.log('====================================================');
  console.log('🌸 大宝宝 × 小宝宝 早安微信推送自动化引擎启动...');
  console.log('====================================================');

  // 1. 检查必要凭据
  if (!config.APP_ID || config.APP_ID.startsWith('${TODO') || !config.APP_SECRET || config.APP_SECRET.startsWith('${TODO')) {
    console.error('❌ [配置错误] 请先在 config/index.cjs 中填写正确的 APP_ID 和 APP_SECRET！');
    console.log('👉 测试号申请地址: https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login');
    console.log('👉 或者使用 npm test 运行离线模拟渲染测试。');
    process.exit(1);
  }

  try {
    // 2. 获取微信 AccessToken
    console.log('🔑 正在获取微信公众平台全局 AccessToken...');
    const accessToken = await getAccessToken(config.APP_ID, config.APP_SECRET);
    console.log('✅ AccessToken 获取成功！');

    const defaultTemplateConfig = templateConfigList[0];

    // 3. 逐个用户推送
    for (const user of config.USERS) {
      if (!user.id || user.id.startsWith('${TODO')) {
        console.warn(`⚠️ 跳过未配置 OpenID 的用户: ${user.name}`);
        continue;
      }

      console.log(`\n📨 正在为【${user.name}】(${user.city}) 构建专属早安消息...`);
      const payload = await buildMessagePayload(user, config, defaultTemplateConfig);

      console.log(`📤 正在发送模板消息至: ${user.id} ...`);
      const result = await sendTemplateMessage(accessToken, payload);
      console.log(`🎉 【${user.name}】推送成功！MsgID: ${result.msgid}`);
    }

    console.log('\n====================================================');
    console.log('✨ 全部推送任务执行完毕！');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ 推送执行异常:', error.message);
    process.exit(1);
  }
}

main();
