const crypto = require('crypto');
const config = require('../config/index.cjs');
const { getAccessToken, sendTemplateMessage } = require('../src/api/wechat');

const WECHAT_TOKEN = process.env.WECHAT_TOKEN || 'chaobo_love_secret_2026';

module.exports = async (req, res) => {
  // 1. 处理 GET 请求 (微信后台接口配置校验)
  if (req.method === 'GET') {
    const { signature, timestamp, nonce, echostr } = req.query || {};
    if (!signature || !timestamp || !nonce) {
      return res.status(200).send('🌸 情侣微信中继服务运行正常！');
    }

    const sortedStr = [WECHAT_TOKEN, timestamp, nonce].sort().join('');
    const hash = crypto.createHash('sha1').update(sortedStr).digest('hex');

    if (hash === signature) {
      console.log('✅ 微信 Token 校验成功！返回:', echostr);
      return res.status(200).send(echostr);
    } else {
      console.warn('❌ 微信 Token 校验不匹配！');
      return res.status(403).send('Forbidden');
    }
  }

  // 2. 处理 POST 请求 (接收小宝宝发来的消息并实时转发)
  if (req.method === 'POST') {
    let body = '';
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      body = req.body.toString('utf-8');
    } else if (req.body && typeof req.body === 'object') {
      body = JSON.stringify(req.body);
    } else {
      body = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
      });
    }

    const getTag = (tag) => {
      const match = (body || '').match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's'));
      return match ? match[1].trim() : '';
    };

    const fromUser = getTag('FromUserName');
    const toUser = getTag('ToUserName');
    const msgType = getTag('MsgType');
    let userText = getTag('Content');

    if (msgType === 'image') userText = '[图片消息]';
    if (msgType === 'voice') userText = '[语音消息]';

    const isGF = fromUser === 'o5J-u3EHfwjgkFycAYe8lLJj_HCw';
    const senderName = isGF ? '小宝宝' : '大宝宝';
    const targetOpenId = isGF ? 'o5J-u3Pet3R80SimhbmbmKMXPUcU' : 'o5J-u3EHfwjgkFycAYe8lLJj_HCw';
    const targetName = isGF ? '大宝宝' : '小宝宝';

    if (userText) {
      try {
        const accessToken = await getAccessToken(config.APP_ID, config.APP_SECRET);
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        await sendTemplateMessage(accessToken, {
          touser: targetOpenId,
          template_id: config.USERS[0]?.useTemplateId || 'nu9ZFXe1UaXui301fuLLXF5sueyeLVue50SFGiDNtAg',
          data: {
            first: { value: `💌 【${senderName}】发来新留言啦！\n`, color: '#FF1493' },
            date: { value: `留言时间：今日 ${timeStr}`, color: '#9C27B0' },
            weather: { value: `💬 消息：${userText}`, color: '#00B0FF' },
            min_temperature: { value: '', color: '#FF6D00' },
            max_temperature: { value: '', color: '#FF1744' },
            wind_direction: { value: '', color: '#00B0FF' },
            wind_scale: { value: '', color: '#00E676' },
            shidu: { value: '', color: '#00B4D8' },
            love_day: { value: `来自【${senderName}】的实时对讲`, color: '#FF0055' },
            birthday_message: { value: '', color: '#FF8F00' },
            horoscope_all: { value: `已通过情侣中继站实时转送给您`, color: '#AB47BC' },
            saylove: { value: `"${userText}"`, color: '#E91E63' },
            caihongpi: { value: '', color: '#FF6D00' },
            poetry: { value: '', color: '#7E57C2' },
            pharmacy_fact: { value: `━━━━━━━━━━━━━━━\n💕 赶紧去个人微信回复${senderName}吧～`, color: '#00C853' },
            remark: { value: `━━━━━━━━━━━━━━━\n💕 赶紧去个人微信回复${senderName}吧～`, color: '#FF1493' }
          }
        });
      } catch (err) {
        console.error('转发异常:', err.message);
      }
    }

    const replyContent = isGF
      ? `💌 收到啦宝贝！大宝宝已经收到你的留言：「${userText}」，他看到后会第一时间在微信回复你哦～💕`
      : `💌 消息「${userText}」已同步转发至小宝宝微信。`;

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

  return res.status(405).send('Method Not Allowed');
};
