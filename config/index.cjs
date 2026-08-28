/**
 * ===================================================
 *  🌸 大宝宝 × 小宝宝 专属早安推送配置
 *  项目: wechat-push-chaobo-custom
 *  深度适我化配置
 * ===================================================
 */

module.exports = {
  // ============ 微信测试号凭证 ============
  // 获取途径: https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
  APP_ID: process.env.APP_ID || 'wx2a24d755841b8137',
  APP_SECRET: process.env.APP_SECRET || '1653c3fb53933b7d1103d85add07574d',

  // ============ 小程序联动配置 ============
  // 填写后，微信用户点击推送卡片可直接跳转进小程序
  MINIPROGRAM: {
    enable: true, // 开启小程序点击直达联动
    appid: process.env.MINIPROGRAM_APPID || 'wx0744350fe50decee',
    pagepath: 'pages/MainPage/index'
  },

  // ============ 第三方数据平台密钥 ============
  // 获取途径: https://www.tianapi.com/
  TIAN_API: {
    key: process.env.TIAN_API_KEY || '${TODO: 填入你的天行数据 API Key}'
  },

  // ============ 功能开关 ============
  SWITCH: {
    weather: true,          // ✅ 天气预报
    caihongpi: true,        // ✅ 每日彩虹屁
    horoscope: true,        // ✅ 星座运势 (双鱼座 ♓)
    poetry: true,           // ✅ 今日诗词
    saylove: true,          // ✅ 土味情话
    one_talk: true,         // ✅ 治愈一言
    pharmacy_fact: true,    // ✅ 药学冷知识 (专属定制)
    note_en: false,         // ❌ 每日英语 (如需备考开启改为 true)
    courseSchedule: false,  // ❌ 课程表 (研究生无需)
  },

  // ============ 推送用户列表 ============
  USERS: [
    {
      // --- 小宝宝的早安推送 ---
      name: '小宝宝',
      id: process.env.TARGET_USER_OPENID || 'o5J-u3EHfwjgkFycAYe8lLJj_HCw',
      useTemplateId: 'BtR7DY91nbUf7SiVjQAJIVBMEKYuWpaKU8p02VaOlTc',
      province: '河北',
      city: '大名',
      horoscopeDate: '03-08',  // 双鱼座 ♓ (02-19 ~ 03-20)
      horoscopeName: '双鱼座',
      festivals: [
        {
          type: 'Birthday',
          name: '小宝宝阳历生日',
          year: '2003',
          date: '03-08',
          isLunar: false
        },
        {
          type: 'Birthday',
          name: '大宝宝阳历生日',
          year: '2002',
          date: '11-20',
          isLunar: false
        }
      ],
      customizedDateList: [
        { keyword: 'love_day', date: '2025-04-06' }, // 恋爱纪念日
      ]
    }
  ],

  // ============ 状态回执通知 ============
  // 推送完成后向大宝宝自己推送一条状态回执
  CALLBACK_TEMPLATE_ID: process.env.CALLBACK_TEMPLATE_ID || '',
  CALLBACK_USERS: [process.env.ADMIN_USER_OPENID || 'o5J-u3Pet3R80SimhbmbmKMXPUcU']
};
