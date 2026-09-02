const config = require('./config/index.cjs');
const templateConfigList = require('./config/template-config.cjs');
const { getAccessToken, sendTemplateMessage } = require('./src/api/wechat');
const { buildMessagePayload } = require('./src/services/message-builder');

/**
 * 智能预热与定点毫秒级开火引擎
 * 默认目标时间：每天北京时间 07:10:00
 * 如果在 05:30 ~ 07:09:59 期间被提前唤醒启动，脚本会在内存中进行高精度倒计时等待，并在 07:10:00 准秒发送！
 * 如果在 07:10 之后被触发（例如手动测试），则立即秒发，绝不等待。
 */
async function waitUntilTargetTime(targetHour = 7, targetMinute = 10) {
  const beijingFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const formatted = beijingFormatter.format(new Date());
  const [datePart, timePart] = formatted.split(', ');
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  const currentTotalSec = hours * 3600 + minutes * 60 + seconds;
  const targetTotalSec = targetHour * 3600 + targetMinute * 60;

  // 如果处于清晨 05:30 至 07:09:59 预热窗口期
  if (currentTotalSec >= (5 * 3600 + 30 * 60) && currentTotalSec < targetTotalSec) {
    const waitSeconds = targetTotalSec - currentTotalSec;
    const waitMins = Math.floor(waitSeconds / 60);
    const remainingSecs = waitSeconds % 60;

    console.log(`\n⏳ [提前预热开火引擎] 当前北京时间为 ${timePart}，云端环境已就绪！`);
    console.log(`⏱️ 正在进行高精度静默倒计时，将于 07:10:00 准点开火（剩余 ${waitMins}分${remainingSecs}秒，共 ${waitSeconds} 秒）...`);

    // 循环睡眠，每 60 秒输出一次心跳日志
    let leftSec = waitSeconds;
    while (leftSec > 0) {
      const step = Math.min(leftSec, 60);
      await new Promise(resolve => setTimeout(resolve, step * 1000));
      leftSec -= step;
      if (leftSec > 0 && leftSec % 60 === 0) {
        console.log(`💓 [心跳保持] 距离 07:10:00 发送还剩 ${Math.floor(leftSec / 60)} 分钟...`);
      }
    }
    console.log(`🚀 [07:10:00 准点到达] 启动全自动微信推送！\n`);
  } else {
    console.log(`⚡ [即时触发] 当前北京时间为 ${timePart}，无需预热等待，立即执行推送！\n`);
  }
}

async function main() {
  console.log('====================================================');
  console.log('🌸 大宝宝 × 小宝宝 早安微信推送自动化引擎启动...');
  console.log('====================================================');

  // 0. 检查是否需要精准等待至 07:10:00
  await waitUntilTargetTime(7, 10);

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
