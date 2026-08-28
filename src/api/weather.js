const axios = require('axios');

/**
 * 获取指定城市的天气预报
 * 优先调用天行数据 API，失败时降级为 wttr.in 免费 API 或本地兜底数据
 * @param {string} city - 城市名称，如 "大名" 或 "天津"
 * @param {string} tianApiKey - 天行数据 API Key
 * @returns {Promise<object>}
 */
async function getWeather(city = '大名', tianApiKey = '') {
  // 尝试 1: 天行数据 TianAPI
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
          weather: r.weather || '晴',
          min_temp: r.lowest || '18℃',
          max_temp: r.highest || '28℃',
          wind_direction: r.wind || '微风',
          wind_scale: r.windsc || '1-2级',
          shidu: r.humidity || '45%'
        };
      }
    } catch (e) {
      console.warn(`[Weather] TianAPI fetch failed for ${city}: ${e.message}, trying fallback...`);
    }
  }

  // 尝试 2: wttr.in 免费公开气象源
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
        weather: current.weatherDesc[0].value || '晴',
        min_temp: `${today.mintempC}℃`,
        max_temp: `${today.maxtempC}℃`,
        wind_direction: `${current.winddir16Point}风`,
        wind_scale: `${current.windspeedKmph} km/h`,
        shidu: `${current.humidity}%`
      };
    }
  } catch (e) {
    console.warn(`[Weather] wttr.in fetch failed for ${city}: ${e.message}, using mock fallback.`);
  }

  // 兜底数据 (保证推送绝对不中断)
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
  getWeather
};
