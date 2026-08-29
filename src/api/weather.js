const axios = require('axios');

/**
 * 彩云天气天气状况代码对照表
 */
const SKYCON_MAP = {
  CLEAR_DAY: '晴 ☀️',
  CLEAR_NIGHT: '晴夜 🌙',
  PARTLY_CLOUDY_DAY: '多云 ⛅',
  PARTLY_CLOUDY_NIGHT: '多云 ☁️',
  CLOUDY: '阴天 ☁️',
  LIGHT_HAZE: '轻度雾霾 🌫️',
  MODERATE_HAZE: '中度雾霾 🌫️',
  HEAVY_HAZE: '重度雾霾 🌫️',
  LIGHT_RAIN: '小雨 🌧️',
  MODERATE_RAIN: '中雨 🌧️',
  HEAVY_RAIN: '大雨 ⛈️',
  STORM_RAIN: '暴雨 ⛈️',
  FOG: '大雾 🌫️',
  LIGHT_SNOW: '小雪 🌨️',
  MODERATE_SNOW: '中雪 ❄️',
  HEAVY_SNOW: '大雪 ❄️',
  STORM_SNOW: '暴雪 ❄️',
  DUST: '浮尘 🌪️',
  SAND: '沙尘 🌪️',
  WIND: '大风 💨'
};

/**
 * 常用城市经纬度映射 (经度,纬度)
 */
const CITY_COORDINATES = {
  '大名': '115.1472,36.2854',
  '大名县': '115.1472,36.2854',
  '邯郸': '114.4907,36.6123',
  '天津': '117.1767,39.1422',
  '天津市': '117.1767,39.1422',
  '北京': '116.4074,39.9042',
  '红桥': '117.1523,39.1712'
};

/**
 * 根据角度计算风向描述
 */
function getWindDirection(deg) {
  if (deg === undefined || deg === null) return '微风';
  if (deg >= 337.5 || deg < 22.5) return '北风';
  if (deg >= 22.5 && deg < 67.5) return '东北风';
  if (deg >= 67.5 && deg < 112.5) return '东风';
  if (deg >= 112.5 && deg < 157.5) return '东南风';
  if (deg >= 157.5 && deg < 202.5) return '南风';
  if (deg >= 202.5 && deg < 247.5) return '西南风';
  if (deg >= 247.5 && deg < 292.5) return '西风';
  return '西北风';
}

/**
 * 根据风速计算风力等级
 */
function getWindScale(speed) {
  if (speed === undefined || speed === null) return '1-2级';
  if (speed < 1) return '0级';
  if (speed <= 5) return '1级';
  if (speed <= 11) return '2级';
  if (speed <= 19) return '3级';
  if (speed <= 28) return '4级';
  if (speed <= 38) return '5级';
  return '6级以上';
}

/**
 * 获取指定城市的天气预报
 * 优先调用彩云天气高精度 API，备用天行数据 API，底层 wttr.in 与本地兜底
 * @param {string} city - 城市名称，如 "大名" 或 "天津"
 * @param {object|string} options - 配置参数对象或天行 API Key
 * @returns {Promise<object>}
 */
async function getWeather(city = '大名', options = {}) {
  let caiyunToken = '';
  let tianApiKey = '';

  if (typeof options === 'string') {
    tianApiKey = options;
  } else if (options && typeof options === 'object') {
    caiyunToken = options.caiyunToken || '';
    tianApiKey = options.tianApiKey || '';
  }

  // 尝试 1: 彩云天气开放平台 API (最高精度、自然语言短评、分钟级降水)
  if (caiyunToken && !caiyunToken.startsWith('${TODO')) {
    try {
      const coords = CITY_COORDINATES[city] || '115.1472,36.2854';
      const url = `https://api.caiyunapp.com/v2.6/${caiyunToken}/${coords}/weather?dailysteps=1&hourlysteps=24`;
      const res = await axios.get(url, { timeout: 6000 });
      if (res.data && res.data.status === 'ok' && res.data.result) {
        const result = res.data.result;
        const realtime = result.realtime;
        const daily = result.daily;
        const minTemp = daily.temperature?.[0]?.min !== undefined ? Math.round(daily.temperature[0].min) : 18;
        const maxTemp = daily.temperature?.[0]?.max !== undefined ? Math.round(daily.temperature[0].max) : 28;
        const weatherDesc = SKYCON_MAP[realtime.skycon] || '多云 ⛅';
        const humidity = realtime.humidity !== undefined ? `${Math.round(realtime.humidity * 100)}%` : '50%';
        const windDirection = getWindDirection(realtime.wind?.direction);
        const windScale = getWindScale(realtime.wind?.speed);
        const keypoint = result.forecast_keypoint || result.hourly?.description || '';

        return {
          weather: weatherDesc,
          min_temp: `${minTemp}℃`,
          max_temp: `${maxTemp}℃`,
          wind_direction: windDirection,
          wind_scale: windScale,
          shidu: humidity,
          keypoint: keypoint,
          comfort: daily.life_index?.comfort?.[0]?.desc || '舒适',
          dressing: daily.life_index?.dressing?.[0]?.desc || '适宜',
          ultraviolet: daily.life_index?.ultraviolet?.[0]?.desc || '中等'
        };
      }
    } catch (e) {
      console.warn(`[Weather] 彩云天气请求异常 (${city}): ${e.message}，正在尝试备用源...`);
    }
  }

  // 尝试 2: 天行数据 TianAPI
  if (tianApiKey && !tianApiKey.startsWith('${TODO')) {
    try {
      const res = await axios.get('https://apis.tianapi.com/tianqi/index', {
        params: {
          key: tianApiKey,
          city: city,
          type: '1'
        },
        timeout: 5000
      });
      if (res.data && res.data.code === 200 && res.data.result) {
        const r = res.data.result;
        return {
          weather: r.weather || '晴 ☀️',
          min_temp: r.lowest || '18℃',
          max_temp: r.highest || '28℃',
          wind_direction: r.wind || '微风',
          wind_scale: r.windsc || '1-2级',
          shidu: r.humidity || '45%'
        };
      }
    } catch (e) {
      console.warn(`[Weather] TianAPI 请求异常 (${city}): ${e.message}，正在尝试备用源...`);
    }
  }

  // 尝试 3: wttr.in 免费公开气象源
  try {
    const encodedCity = encodeURIComponent(city);
    const res = await axios.get(`https://wttr.in/${encodedCity}?format=j1`, {
      timeout: 5000,
      headers: { 'User-Agent': 'curl/7.68.0' }
    });
    if (res.data && res.data.current_condition && res.data.weather && res.data.weather.length > 0) {
      const current = res.data.current_condition[0];
      const today = res.data.weather[0];
      return {
        weather: current.weatherDesc[0].value || '晴 ☀️',
        min_temp: `${today.mintempC}℃`,
        max_temp: `${today.maxtempC}℃`,
        wind_direction: `${current.winddir16Point}风`,
        wind_scale: `${current.windspeedKmph} km/h`,
        shidu: `${current.humidity}%`
      };
    }
  } catch (e) {
    console.warn(`[Weather] wttr.in 请求异常 (${city}): ${e.message}，使用兜底数据。`);
  }

  // 尝试 4: 本地智能兜底数据 (保证推送绝对不中断)
  return {
    weather: '晴朗温和 ☀️',
    min_temp: '18℃',
    max_temp: '26℃',
    wind_direction: '微风',
    wind_scale: '2级',
    shidu: '50%'
  };
}

module.exports = {
  getWeather,
  CITY_COORDINATES,
  SKYCON_MAP
};
