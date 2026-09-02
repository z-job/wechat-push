const config = require('../config/index.cjs');
const templateConfigList = require('../config/template-config.cjs');
const { getAccessToken, sendTemplateMessage } = require('../src/api/wechat');
const { buildMessagePayload } = require('../src/services/message-builder');

const AUTH_KEY = process.env.PUSH_AUTH_KEY || 'chaobo_love_secret_2026';

module.exports = async (req, res) => {
  const key = req.query?.key || req.headers?.['x-auth-key'] || req.body?.key;
  if (key !== AUTH_KEY) {
    return res.status(403).json({ success: false, error: 'Unauthorized key' });
  }

  try {
    const accessToken = await getAccessToken(config.APP_ID, config.APP_SECRET);
    const defaultTemplateConfig = templateConfigList[0];
    const results = [];

    for (const user of config.USERS) {
      if (!user.id || user.id.startsWith('${TODO')) continue;
      const payload = await buildMessagePayload(user, config, defaultTemplateConfig);
      const result = await sendTemplateMessage(accessToken, payload);
      results.push({ name: user.name, id: user.id, msgid: result.msgid });
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
