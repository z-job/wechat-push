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
 * 
 * 📅 日期：{{date.DATA}}
 * 🌤 天气：{{weather.DATA}}
 * 💨 风向：{{wind_direction.DATA}} {{wind_scale.DATA}}
 * 🌊 湿度：{{shidu.DATA}}
 * 
 * ❤️ 恋爱天数：{{love_day.DATA}}
 * 🎂 距离生日：{{birthday_message.DATA}}
 * 🎓 距离考研：{{kaoyan_day.DATA}}
 * 
 * ✨ 今日运势：{{horoscope_all.DATA}}
 * 💌 今日情话：{{saylove.DATA}}
 * 🌈 每日一夸：{{caihongpi.DATA}}
 * 📜 晨读诗词：{{poetry.DATA}}
 * 
 * 💊 药学趣知：{{pharmacy_fact.DATA}}
 * 
 * {{remark.DATA}}
 * ----------------------------------------------------
 *
 * 4. 提交后记录生成的"模板ID"，填入 config/index.cjs 中。
 */

const TEMPLATE_CONFIG = [
  {
    id: '0001',
    // 🌟 高饱和亮眼醒目配色方案 (高对比度、数字突出、暗黑/浅色模式均极清晰)
    colorScheme: {
      first:           '#FF1493',  // 鲜亮玫瑰粉 (极醒目大标题)
      date:            '#9C27B0',  // 罗兰深紫 (清晰醒目)
      weather:         '#00B0FF',  // 晴空亮蓝 (明亮)
      min_temperature: '#FF6D00',  // 暖阳亮橙 (数字醒目)
      max_temperature: '#FF1744',  // 艳丽绯红 (数字醒目)
      wind_direction:  '#00B0FF',  // 晴空亮蓝
      wind_scale:      '#00E676',  // 鲜明翠绿 (风力突出)
      shidu:           '#00B4D8',  // 清澈湖蓝 (湿度醒目)
      love_day:        '#FF0055',  // 醒目高亮热恋红 (核心数字极度吸睛)
      birthday_message:'#FF8F00',  // 璀璨亮金橙 (倒数天数吸睛)
      horoscope_all:   '#AB47BC',  // 亮紫罗兰 (运势醒目)
      saylove:         '#E91E63',  // 亮丽蜜桃粉 (情话突出)
      caihongpi:       '#FF6D00',  // 亮珊瑚橙 (夸赞醒目)
      poetry:          '#7E57C2',  // 典雅深紫 (诗词有层次)
      pharmacy_fact:   '#00C853',  // 翡翠高亮绿 (专业冷知识突出)
      remark:          '#FF1493',  // 鲜亮玫瑰粉 (底栏寄语突出)
    },

    // 开头问候语
    firstText: '🌸 早安，小宝宝~ 今天也要元气满满哦！',

    // 结尾备注
    remarkText: '💕 大宝宝每天都在想你～（点击卡片直达专属小窝）',
  }
];

module.exports = TEMPLATE_CONFIG;
