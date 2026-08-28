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
  const birthdayDays = getDaysUntilNextDate(user.horoscopeDate || '03-08');

  // 获取天气数据
  const weatherData = await getWeather(user.city || '大名', config.TIAN_API?.key);

  // 获取文案数据
  const quotesData = await getQuotes(config.TIAN_API?.key);

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

  const payload = {
    touser: user.id,
    template_id: user.useTemplateId || templateConfig.id || '0001',
    data: {
      first: {
        value: templateConfig.firstText || `🌸 早安，${user.name}~`,
        color: colors.first
      },
      date: {
        value: `${dateStr} ${weekDayStr}`,
        color: colors.date
      },
      city: {
        value: user.city || '大名',
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
        value: birthdayDays === 0 ? '🎉 宝贝今天生日快乐！🎂✨' : `还有 ${birthdayDays} 天`,
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
        value: templateConfig.remarkText || '💕 大宝宝每天都在想你～',
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
