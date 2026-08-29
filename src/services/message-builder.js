const { getLoveDays, getDaysUntilNextDate, getFormattedDate } = require('../utils/date');
const { getWeather } = require('../api/weather');
const { getQuotes } = require('../api/quote');

/**
 * 组装单个用户的模板消息 Payload
 * @param {object} user - 用户配置对象
 * @param {object} config - 全局配置
 * @param {object} templateConfig - 模板颜色与排版配置
 * @returns {Promise<object>}
 */
async function buildMessagePayload(user, config, templateConfig) {
  const { dateStr, weekDayStr } = getFormattedDate();
  const loveDays = getLoveDays(user.customizedDateList?.[0]?.date || '2025-04-06');

  // 计算对方生日倒数 (小宝宝端倒数大宝宝农历10-16；大宝宝端倒数小宝宝阳历03-08)
  const targetBday = user.targetBirthday || (
    user.name === '小宝宝'
      ? { name: '大宝宝', date: '10-16', isLunar: true, dateDisplay: '十月十六' }
      : { name: '小宝宝', date: '03-08', isLunar: false, dateDisplay: '3月8日' }
  );

  const birthdayDays = getDaysUntilNextDate(targetBday.date, targetBday.isLunar);

  let birthdayMsg = '';
  if (birthdayDays === 0) {
    birthdayMsg = `🎉 祝${targetBday.name}今天生日快乐！🎂✨`;
  } else {
    const displayDate = targetBday.dateDisplay || (targetBday.isLunar ? '十月十六' : '3月8日');
    birthdayMsg = `距离${targetBday.name}生日${displayDate}还有 【 ${birthdayDays} 】 天`;
  }

  // 获取天气数据 (优先彩云天气高精度气象源)
  const weatherData = await getWeather(user.city || (user.name === '大宝宝' ? '天津' : '大名'), {
    caiyunToken: config.CAIYUN_API?.token,
    tianApiKey: config.TIAN_API?.key
  });

  // 获取文案数据 (按用户星座动态适配)
  const quotesData = await getQuotes(config.TIAN_API?.key, user.horoscopeName || (user.name === '大宝宝' ? '天蝎座' : '双鱼座'));

  // 🌟 高饱和亮眼醒目配色表
  const colors = templateConfig?.colorScheme || {
    first: '#FF1493',          // 鲜亮玫瑰粉 (极醒目大标题)
    date: '#9C27B0',           // 罗兰深紫
    weather: '#00B0FF',        // 晴空亮蓝
    min_temperature: '#FF6D00',// 暖阳亮橙
    max_temperature: '#FF1744',// 艳丽绯红
    wind_direction: '#00B0FF', // 晴空亮蓝
    wind_scale: '#00E676',     // 鲜明翠绿
    shidu: '#00B4D8',          // 清澈湖蓝
    love_day: '#FF0055',       // 醒目高亮热恋红
    birthday_message: '#FF8F00', // 璀璨亮金橙
    horoscope_all: '#AB47BC',  // 亮紫罗兰
    saylove: '#E91E63',        // 亮丽蜜桃粉
    caihongpi: '#FF6D00',      // 亮珊瑚橙
    poetry: '#7E57C2',         // 典雅深紫
    pharmacy_fact: '#00C853',  // 翡翠高亮绿
    remark: '#FF1493'          // 鲜亮玫瑰粉
  };

  // 生成个性化问候与生日文案
  let firstGreeting = user.firstText;
  if (!firstGreeting) {
    firstGreeting = user.name === '大宝宝'
      ? '🌸 早安，大宝宝~ 今天科研和生活都要顺遂哦！'
      : '🌸 早安，小宝宝~ 今天也要元气满满哦！';
  }

  let remarkMessage = user.remarkText;
  if (!remarkMessage) {
    remarkMessage = user.name === '大宝宝'
      ? '💕 小宝宝和小窝时刻陪伴着你～'
      : '💕 大宝宝每天都在想你～';
  }

  // 智能降雨检测与专属带伞提醒
  const rainNotice = weatherData.has_rain
    ? (user.name === '小宝宝' ? ' 可能会下雨，小宝宝记得带伞或雨披嗷' : ' 可能会下雨，大宝宝记得带伞或雨披嗷')
    : '';

  const weatherDisplay = `${weatherData.weather_desc || '晴 ☀️'}${rainNotice}`;

  const fullFormattedCardText = [
    `📅 日期：${dateStr} ${weekDayStr}`,
    `🌤 天气：${weatherDisplay}`,
    `气温：${weatherData.min_temp} ~ ${weatherData.max_temp}`,
    `💨 风向：${weatherData.wind_direction} ${weatherData.wind_scale} ｜ 湿度：${weatherData.shidu}`,
    ``,
    `❤️ 恋爱天数：【 ${loveDays} 天 】`,
    `🎂 距离生日：${birthdayMsg}`,
    ``,
    `✨ 今日运势：${quotesData.horoscope}`,
    `🌹 今日情话：${quotesData.saylove}`,
    `🌈 每日一夸：${quotesData.caihongpi}`,
    `📜 晨读诗词：${quotesData.poetry}`,
    ``,
    `💊 药学趣知：`,
    `${quotesData.pharmacy_fact}`
  ].join('\n');

  const payload = {
    touser: user.id,
    template_id: user.useTemplateId || templateConfig.id || '0001',
    data: {
      first: {
        value: firstGreeting,
        color: colors.first
      },
      content: {
        value: fullFormattedCardText,
        color: colors.date
      },
      date: {
        value: `${dateStr} ${weekDayStr}`,
        color: colors.date
      },
      city: {
        value: user.city || (user.name === '大宝宝' ? '天津 · 红桥' : '河北 · 大名'),
        color: colors.weather
      },
      weather: {
        value: `${weatherDisplay}\n气温：${weatherData.min_temp} ~ ${weatherData.max_temp}`,
        color: colors.weather
      },
      min_temperature: {
        value: `${weatherData.min_temp}`,
        color: colors.min_temperature
      },
      max_temperature: {
        value: `${weatherData.max_temp}`,
        color: colors.max_temperature
      },
      wind_direction: {
        value: weatherData.wind_direction,
        color: colors.wind_direction
      },
      wind_scale: {
        value: `${weatherData.wind_scale}`,
        color: colors.wind_scale
      },
      shidu: {
        value: `${weatherData.shidu}`,
        color: colors.shidu
      },
      love_day: {
        value: `【 ${loveDays} 天 】`,
        color: colors.love_day
      },
      birthday_message: {
        value: birthdayMsg,
        color: colors.birthday_message
      },
      horoscope_all: {
        value: quotesData.horoscope,
        color: colors.horoscope_all
      },
      saylove: {
        value: quotesData.saylove,
        color: colors.saylove
      },
      caihongpi: {
        value: quotesData.caihongpi,
        color: colors.caihongpi
      },
      poetry: {
        value: quotesData.poetry,
        color: colors.poetry
      },
      pharmacy_fact: {
        value: `${quotesData.pharmacy_fact}\n\n━━━━━━━━━━━━━━━\n${remarkMessage}`,
        color: colors.pharmacy_fact
      },
      remark: {
        value: `━━━━━━━━━━━━━━━\n${remarkMessage}`,
        color: colors.remark
      }
    }
  };

  // 支持点击卡片跳转 (若设置了 URL 则点击直接打开网页)
  if (user.url || config.URL) {
    payload.url = user.url || config.URL;
  }

  // 如果开启了小程序跳转联动
  if (config.MINIPROGRAM && config.MINIPROGRAM.enable && config.MINIPROGRAM.appid && !config.MINIPROGRAM.appid.startsWith('${TODO')) {
    payload.miniprogram = {
      appid: config.MINIPROGRAM.appid,
      pagepath: config.MINIPROGRAM.pagepath || 'pages/MainPage/index'
    };
  }

  return payload;
}

module.exports = {
  buildMessagePayload
};
