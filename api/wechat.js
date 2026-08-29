const crypto = require('crypto');
const config = require('../config/index.cjs');
const { getAccessToken, sendTemplateMessage } = require('../src/api/wechat');

const WECHAT_TOKEN = process.env.WECHAT_TOKEN || 'chaobo_love_secret_2026';

/**
 * 微信验证接口 (GET)
 */
function verifyWechat(req, res) {
  const { signature, timestamp, nonce, echostr } = req.query || {};
  if (!signature || !timestamp || !nonce) {
    return res.status(400).send('Missing params');
  }

  const sortedStr = [WECHAT_TOKEN, timestamp, nonce].sort().join('');
  const hash = crypto.createHash('sha1').update(sortedStr).digest('hex');

  if (hash === signature) {
    console.log('✅ 微信接口配置 Token 校验成功！');
    return res.status(200).send(echostr);
  } else {
    console.warn('❌ 微信接口配置 Token 校验失败！');
    return res.status(403).send('Forbidden');
  }
}

/**
 * 极简 XML 解析
 */
function parseXml(xmlStr) {
  const getTag = (tag) => {
    const match = xmlStr.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's'));
    return match ? match[1].trim() : '';
  };
  return {
    ToUserName: getTag('ToUserName'),
    FromUserName: getTag('FromUserName'),
    CreateTime: getTag('CreateTime'),
    MsgType: getTag('MsgType'),
    Content: getTag('Content'),
    MsgId: getTag('MsgId'),
    PicUrl: getTag('PicUrl')
  };
}

/**
 * 微信消息接收与对讲转发 (POST)
 */
async function handleWechatMessage(req, res, xmlData) {
  const msg = parseXml(xmlData || '');
  const fromUser = msg.FromUserName;
  const toUser = msg.ToUserName;
  const msgType = msg.MsgType;
  let userText = msg.Content || '';

  if (msgType === 'image') {
    userText = '[图片消息]';
  } else if (msgType === 'voice') {
    userText = '[语音消息]';
  }

  console.log(`📨 收到来自 ${fromUser} 的消息: ${userText}`);

  // 判断发送人是小宝宝还是大宝宝
  const isGF = fromUser === 'o5J-u3EHfwjgkFycAYe8lLJj_HCw';
  const senderName = isGF ? '小宝宝' : '大宝宝';
  const targetOpenId = isGF ? 'o5J-u3Pet3R80SimhbmbmKMXPUcU' : 'o5J-u3EHfwjgkFycAYe8lLJj_HCw';
  const targetName = isGF ? '大宝宝' : '小宝宝';

  // 1. 异步转发通知卡片至对方微信
  if (userText && userText !== '') {
    try {
      const accessToken = await getAccessToken(config.APP_ID, config.APP_SECRET);
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const forwardPayload = {
        touser: targetOpenId,
        template_id: config.USERS[0]?.useTemplateId || 'nu9ZFXe1UaXui301fuLLXF5sueyeLVue50SFGiDNtAg',
        data: {
          first: {
            value: `💌 【${senderName}】发来新留言啦！\n`,
            color: '#FF1493'
          },
          date: {
            value: `留言时间：今日 ${timeStr}`,
            color: '#9C27B0'
          },
          weather: {
            value: `💬 消息：${userText}`,
            color: '#00B0FF'
          },
          min_temperature: { value: '', color: '#FF6D00' },
          max_temperature: { value: '', color: '#FF1744' },
          wind_direction: { value: '', color: '#00B0FF' },
          wind_scale: { value: '', color: '#00E676' },
          shidu: { value: '', color: '#00B4D8' },
          love_day: {
            value: `来自【${senderName}】的实时对讲`,
            color: '#FF0055'
          },
          birthday_message: { value: '', color: '#FF8F00' },
          horoscope_all: {
            value: `已通过情侣中继站实时转送给您`,
            color: '#AB47BC'
          },
          saylove: {
            value: `"${userText}"`,
            color: '#E91E63'
          },
          caihongpi: { value: '', color: '#FF6D00' },
          poetry: { value: '', color: '#7E57C2' },
          pharmacy_fact: {
            value: `━━━━━━━━━━━━━━━\n💕 赶紧去个人微信回复${senderName}吧～`,
            color: '#00C853'
          },
          remark: {
            value: `━━━━━━━━━━━━━━━\n💕 赶紧去个人微信回复${senderName}吧～`,
            color: '#FF1493'
          }
        }
      };

      await sendTemplateMessage(accessToken, forwardPayload);
      console.log(`🎉 消息已成功转发至【${targetName}】微信！`);
    } catch (err) {
      console.error('❌ 消息转发推送异常:', err.message);
    }
  }

  // 2. 立即给发送者微信窗口返回暖心自动回复
  const replyContent = isGF
    ? `💌 收到啦宝贝！大宝宝已经收到你的留言：「${userText}」，他看到后会第一时间在微信回复你哦～💕`
    : `💌 收到大宝宝的指令！消息「${userText}」已同步转发至小宝宝微信。`;

  const replyXml = `<xml>
    <ToUserName><![CDATA[${fromUser}]]></ToUserName>
    <FromUserName><![CDATA[${toUser}]]></FromUserName>
    <CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${replyContent}]]></Content>
  </xml>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  return res.status(200).send(replyXml);
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return verifyWechat(req, res);
  } else if (req.method === 'POST') {
    if (typeof req.body === 'string' && req.body.length > 0) {
      return await handleWechatMessage(req, res, req.body);
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
      await handleWechatMessage(req, res, body);
    });
  } else {
    return res.status(405).send('Method Not Allowed');
  }
};
