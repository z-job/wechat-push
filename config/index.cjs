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

  // ============ 卡片点击跳转网页配置 ============
  // 若配置了国内可访问的 URL，点击卡片可打开网页；留空则为纯卡片模式（防止微信误入海外白屏页面）
  URL: process.env.URL || '',

  // ============ 小程序联动配置 ============
  // 微信测试号官方规则：只有全网公开发布上线的小程序才支持模板卡片跳转。
  // 作为情侣私密体验版小程序，建议保持 false，直接通过微信下拉列表使用更安全。
  MINIPROGRAM: {
    enable: false, // 私密体验版小程序请保持 false
    appid: process.env.MINIPROGRAM_APPID || 'wx0744350fe50decee',
    pagepath: 'pages/MainPage/index'
  },

  // ============ 第三方数据平台密钥 ============
  // 彩云天气开放平台 (高精度分钟级降水、自然语言描述)
  CAIYUN_API: {
    token: process.env.CAIYUN_TOKEN || 'lQDN5mDzagcnN0sa'
  },
  // 天行数据平台 (备用天气与文案)
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
      useTemplateId: process.env.TEMPLATE_ID || 'nu9ZFXe1UaXui301fuLLXF5sueyeLVue50SFGiDNtAg',
      province: '河北',
      city: '大名',
      horoscopeDate: '03-08',  // 双鱼座 ♓ (02-19 ~ 03-20)
      horoscopeName: '双鱼座',
      firstText: '🌸 早安，小宝宝~ 今天也要元气满满哦！',
      remarkText: '💕 大宝宝每天都在想你～',
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
    },
    {
      // --- 大宝宝的早安推送 ---
      name: '大宝宝',
      id: process.env.ADMIN_USER_OPENID || 'o5J-u3Pet3R80SimhbmbmKMXPUcU',
      useTemplateId: process.env.TEMPLATE_ID || 'nu9ZFXe1UaXui301fuLLXF5sueyeLVue50SFGiDNtAg',
      province: '天津',
      city: '天津',
      horoscopeDate: '11-20',  // 天蝎座 ♏ (10-24 ~ 11-22)
      horoscopeName: '天蝎座',
      firstText: '🌸 早安，大宝宝~ 今天科研和生活都要顺遂哦！',
      remarkText: '💕 小宝宝和小窝时刻陪伴着你～',
      festivals: [
        {
          type: 'Birthday',
          name: '大宝宝阳历生日',
          year: '2002',
          date: '11-20',
          isLunar: false
        },
        {
          type: 'Birthday',
          name: '小宝宝阳历生日',
          year: '2003',
          date: '03-08',
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
