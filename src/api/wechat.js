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
  throw new Error(`[WeChat Send Error] errcode: ${res.data.errcode}, errmsg: ${res.data.errmsg}`);
}

module.exports = {
  getAccessToken,
  sendTemplateMessage
};
