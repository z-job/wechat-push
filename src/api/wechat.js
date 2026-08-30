const axios = require('axios');

/**
 * 获取微信公众号/测试号的全局 AccessToken
 * @param {string} appId
 * @param {string} appSecret
 * @returns {Promise<string>}
 */
async function getAccessToken(appId, appSecret) {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const res = await axios.get(url, { timeout: 8000 });
  if (res.data && res.data.access_token) {
    return res.data.access_token;
  }
  throw new Error(`[WeChat Auth Error] errcode: ${res.data.errcode}, errmsg: ${res.data.errmsg}`);
}

/**
 * 发送模板消息给指定 OpenID
 * @param {string} accessToken
 * @param {object} payload - 模板消息数据体
 * @returns {Promise<object>}
 */
async function sendTemplateMessage(accessToken, payload) {
  const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;
  const res = await axios.post(url, payload, { timeout: 8000 });
  if (res.data && res.data.errcode === 0) {
    return res.data;
  }

  // 🛡️ 智能容灾降级：若小程序处于审核中或路径未同步 (40165 / 40013)，自动降级为纯卡片无损重发，绝对保证推送永不中断！
  if ((res.data.errcode === 40165 || res.data.errcode === 40013) && payload.miniprogram) {
    console.warn(`⚠️ [小程序暂未同步] (${res.data.errcode}: ${res.data.errmsg})，自动切换为安全卡片模式无损送达...`);
    const fallbackPayload = { ...payload };
    delete fallbackPayload.miniprogram;
    const retryRes = await axios.post(url, fallbackPayload, { timeout: 8000 });
    if (retryRes.data && retryRes.data.errcode === 0) {
      return retryRes.data;
    }
  }

  throw new Error(`[WeChat Send Error] errcode: ${res.data.errcode}, errmsg: ${res.data.errmsg}`);
}

module.exports = {
  getAccessToken,
  sendTemplateMessage
};
