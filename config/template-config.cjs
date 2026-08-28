/**
 * ===================================================
 *  🌸 莫兰迪樱花奶油配色 — 模板消息排版设计
 *  与 Rainbow-Cats 小程序主题色完全统一
 * ===================================================
 *
 * 微信测试号模板消息创建步骤:
 * 1. 登录 https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
 * 2. 页面下方找到"模板消息接口" → 新增测试模板
 * 3. 将以下【模板内容】逐行粘贴到微信后台的"模板内容"文本框中：
 *
 * ----------------------------------------------------
 * {{first.DATA}}
 * 📅 日期：{{date.DATA}}
 * 🌤 天气：{{weather.DATA}}
 * 🌡 气温：{{min_temperature.DATA}} ~ {{max_temperature.DATA}}
 * 💨 风向风力：{{wind_direction.DATA}} {{wind_scale.DATA}}
 * 💧 相对湿度：{{shidu.DATA}}
 * ❤️ 恋爱天数：{{love_day.DATA}}
 * 🎂 距离生日：{{birthday_message.DATA}}
 * 🔮 今日运势：{{horoscope_all.DATA}}
 * 🌹 今日情话：{{saylove.DATA}}
 * 🌈 每日一夸：{{caihongpi.DATA}}
 * 📜 晨读诗词：{{poetry.DATA}}
 * 💊 药学趣知：{{pharmacy_fact.DATA}}
 * {{remark.DATA}}
 * ----------------------------------------------------
 *
 * 4. 提交后记录生成的"模板ID"，填入 config/index.cjs 中。
 */

const TEMPLATE_CONFIG = [
  {
    id: '0001',
    // 🌸 莫兰迪樱花奶油配色方案
    colorScheme: {
      first:           '#E8A0BF',  // 温柔藕粉 — 开头问候语
      date:            '#BA90C6',  // 淡香芋紫 — 日期
      weather:         '#C0DBEA',  // 晴空薄蓝 — 天气描述
      min_temperature: '#F5B7B1',  // 浅珊瑚粉 — 最低温
      max_temperature: '#E8A0BF',  // 藕粉 — 最高温
      wind_direction:  '#C0DBEA',  // 晴空薄蓝 — 风向
      wind_scale:      '#C0DBEA',  // 晴空薄蓝 — 风力
      shidu:           '#A8E6CF',  // 薄荷绿 — 湿度
      love_day:        '#FF69B4',  // 热恋粉（醒目）— 恋爱天数
      birthday_message:'#DDA0DD',  // 浪漫淡紫 — 生日倒数
      horoscope_all:   '#87CEEB',  // 天蓝 — 星座运势
      saylove:         '#F8B4B8',  // 蜜桃粉 — 情话
      caihongpi:       '#E8A0BF',  // 藕粉 — 彩虹屁
      poetry:          '#C3B1E1',  // 薰衣草紫 — 诗词
      pharmacy_fact:   '#A8E6CF',  // 薄荷绿 — 药学冷知识
      remark:          '#B0B0B0',  // 柔灰 — 结尾备注
    },

    // 开头问候语
    firstText: '🌸 早安，小宝宝~ 今天也要元气满满哦！',

    // 结尾备注
    remarkText: '💕 大宝宝每天都在想你～（点击卡片直达专属小窝）',
  }
];

module.exports = TEMPLATE_CONFIG;
