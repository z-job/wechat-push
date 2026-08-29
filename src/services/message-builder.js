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
  const birthdayDays = getDaysUntilNextDate(user.horoscopeDate || (user.name === '大宝宝' ? '11-20' : '03-08'));

  // 获取天气数据 (优先彩云天气高精度气象源)
  const weatherData = await getWeather(user.city || (user.name === '大宝宝' ? '天津' : '大名'), {
    caiyunToken: config.CAIYUN_API?.token,
    tianApiKey: config.TIAN_API?.key
  });

  // 获取文案数据 (按用户星座动态适配)
  const quotesData = await getQuotes(config.TIAN_API?.key, user.horoscopeName || (user.name === '大宝宝' ? '天蝎座' : '双鱼座'));

  // 莫兰迪配色表
  const colors = templateConfig?.colorScheme || {
    first: '#E8A0BF',
    date: '#BA90C6',
    weather: '#C0DBEA',
    min_temperature: '#F5B7B1',
    max_temperature: '#E8A0BF',
    wind_direction: '#C0DBEA',
    wind_scale: '#C0DBEA',
    shidu: '#A8E6CF',
    love_day: '#FF69B4',
    birthday_message: '#DDA0DD',
    horoscope_all: '#87CEEB',
    saylove: '#F8B4B8',
    caihongpi: '#E8A0BF',
    poetry: '#C3B1E1',
    pharmacy_fact: '#A8E6CF',
    remark: '#B0B0B0'
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

  let birthdayMsg = '';
  if (birthdayDays === 0) {
    birthdayMsg = `🎉 祝${user.name}今天生日快乐！🎂✨`;
  } else {
    birthdayMsg = user.name === '大宝宝'
      ? `距离大宝宝生日还有 ${birthdayDays} 天`
      : `还有 ${birthdayDays} 天`;
  }

  const payload = {
    touser: user.id,
    template_id: user.useTemplateId || templateConfig.id || '0001',
    data: {
      first: {
        value: firstGreeting,
        color: colors.first
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
        value: weatherData.weather,
        color: colors.weather
      },
      min_temperature: {
        value: weatherData.min_temp,
        color: colors.min_temperature
      },
      max_temperature: {
        value: weatherData.max_temp,
        color: colors.max_temperature
      },
      wind_direction: {
        value: weatherData.wind_direction,
        color: colors.wind_direction
      },
      wind_scale: {
        value: weatherData.wind_scale,
        color: colors.wind_scale
      },
      shidu: {
        value: weatherData.shidu,
        color: colors.shidu
      },
      love_day: {
        value: `${loveDays} 天`,
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
        value: quotesData.pharmacy_fact,
        color: colors.pharmacy_fact
      },
      remark: {
        value: remarkMessage,
        color: colors.remark
      }
    }
  };

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
