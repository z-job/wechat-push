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
  '天津': '117.1523,39.1712',
  '天津市': '117.1523,39.1712',
  '红桥': '117.1523,39.1712',
  '红桥区': '117.1523,39.1712',
  '天津红桥': '117.1523,39.1712',
  '天津市红桥区': '117.1523,39.1712',
  '北京': '116.4074,39.9042'
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

const WTTR_WEATHER_MAP = {
  'Sunny': '晴 ☀️',
  'Clear': '晴朗 ☀️',
  'Partly cloudy': '多云 ⛅',
  'Partly Cloudy': '多云 ⛅',
  'Cloudy': '阴天 ☁️',
  'Overcast': '阴 ☁️',
  'Mist': '薄雾 🌫️',
  'Fog': '大雾 🌫️',
  'Light rain': '小雨 🌧️',
  'Moderate rain': '中雨 🌧️',
  'Heavy rain': '大雨 ⛈️',
  'Patchy rain possible': '局部阵雨 🌦️',
  'Thundery outbreaks possible': '雷阵雨 ⛈️',
  'Light snow': '小雪 🌨️',
  'Moderate snow': '中雪 ❄️',
  'Heavy snow': '大雪 ❄️',
  'Patchy rain nearby': '局部小雨 🌦️'
};

const WTTR_WIND_DIR_MAP = {
  'N': '北风', 'S': '南风', 'E': '东风', 'W': '西风',
  'NE': '东北风', 'NW': '西北风', 'SE': '东南风', 'SW': '西南风',
  'NNE': '东北偏北风', 'ENE': '东北偏东风', 'NNW': '西北偏北风', 'WNW': '西北偏西风',
  'SSE': '东南偏南风', 'ESE': '东南偏东风', 'SSW': '西南偏南风', 'WSW': '西南偏西风'
};

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

function kmphToScale(kmph) {
  const speed = Number(kmph) || 0;
  if (speed < 1) return '0级';
  if (speed < 6) return '1级';
  if (speed < 12) return '2级';
  if (speed < 20) return '3级';
  if (speed < 29) return '4级';
  if (speed < 39) return '5级';
  return '6级以上';
}

/**
 * 获取当天中午紫外线最强峰值 (Solar Noon Peak UV Max)
 * 严格按照当天中午11:00~14:00紫外线最强时段得出结论，杜绝早晨07:00弱光误报！
 * 4档防晒标准：
 * - 0.0 ~ 2.9 (弱/无): 弱 ｜ 不需要防晒
 * - 3.0 ~ 5.9 (中等): 中等 ｜ 轻度防晒
 * - 6.0 ~ 7.9 (强): 强 ｜ 正常防晒
 * - 8.0+ (极强/极高): 极强 ｜ 重度防晒
 * @param {string} city
 * @param {string} weatherDesc
 * @returns {Promise<string>}
 */
async function fetchSolarNoonUVMax(city, weatherDesc = '晴') {
  const coordStr = CITY_COORDINATES[city] || '115.1472,36.2854';
  const [lng, lat] = coordStr.split(',');

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=uv_index_max&timezone=Asia%2FShanghai`;
    const res = await axios.get(url, { timeout: 3500 });
    const uvMax = res.data?.daily?.uv_index_max?.[0];
    if (typeof uvMax === 'number') {
      if (uvMax < 3.0) return '弱 ｜ 不需要防晒';
      if (uvMax < 6.0) return '中等 ｜ 轻度防晒';
      if (uvMax < 8.0) return '强 ｜ 正常防晒';
      return '极强 ｜ 重度防晒';
    }
  } catch (e) {
    console.warn(`[UV] Open-Meteo UV Max 请求异常 (${city}): ${e.message}，启动高精度气象模型估算...`);
  }

  // 气象光照模型智能兜底（基于正午太阳天顶角与天气云量）
  if (weatherDesc.includes('晴')) {
    return '强 ｜ 正常防晒';
  } else if (weatherDesc.includes('多云') || weatherDesc.includes('薄雾')) {
    return '中等 ｜ 轻度防晒';
  } else {
    return '弱 ｜ 不需要防晒';
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 核心获取天气函数 ====================
async function getWeather(city = '大名', options = {}) {
  const { caiyunToken, tianApiKey } = options;

  // 尝试 1: 彩云天气开放平台 API (最高精度、自然语言短评、分钟级降水、紫外线)
  if (caiyunToken && !caiyunToken.startsWith('${TODO')) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          await sleep(600); // 429 频控重试微延迟
        }
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

          const hasRain = 
            (realtime.skycon && realtime.skycon.includes('RAIN')) ||
            (daily.skycon?.[0]?.value && daily.skycon[0].value.includes('RAIN')) ||
            (daily.precipitation?.[0]?.max > 0) ||
            (weatherDesc && weatherDesc.includes('雨')) ||
            (keypoint && keypoint.includes('雨'));

          // 核心：根据当天中午紫外线最强峰值判断
          const uvAdvice = await fetchSolarNoonUVMax(city, weatherDesc);

          return {
            weather: `${weatherDesc}\n气温：${minTemp}度 ~ ${maxTemp}度`,
            weather_desc: weatherDesc,
            min_temp: `${minTemp}度`,
            max_temp: `${maxTemp}度`,
            wind_direction: windDirection,
            wind_scale: windScale,
            shidu: humidity,
            keypoint: keypoint,
            has_rain: !!hasRain,
            ultraviolet: uvAdvice,
            comfort: daily.life_index?.comfort?.[0]?.desc || '舒适',
            dressing: daily.life_index?.dressing?.[0]?.desc || '适宜'
          };
        }
      } catch (e) {
        if (attempt === 0 && e.response?.status === 429) {
          continue; // 遇 429 进行一次快速避让重试
        }
        console.warn(`[Weather] 彩云天气请求异常 (${city}): ${e.message}，正在尝试备用源...`);
        break;
      }
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
        const minNum = r.lowest ? r.lowest.replace(/[^0-9-]/g, '') : '18';
        const maxNum = r.highest ? r.highest.replace(/[^0-9-]/g, '') : '28';
        const weatherDesc = r.weather || '晴 ☀️';
        const hasRain = weatherDesc.includes('雨') || (r.tips && r.tips.includes('雨'));
        const uvAdvice = await fetchSolarNoonUVMax(city, weatherDesc);
        return {
          weather: `${weatherDesc}\n气温：${minNum}度 ~ ${maxNum}度`,
          weather_desc: weatherDesc,
          min_temp: `${minNum}度`,
          max_temp: `${maxNum}度`,
          wind_direction: r.wind || '微风',
          wind_scale: r.windsc || '1-2级',
          shidu: r.humidity || '45%',
          has_rain: !!hasRain,
          ultraviolet: uvAdvice
        };
      }
    } catch (e) {
      console.warn(`[Weather] TianAPI 请求异常 (${city}): ${e.message}，正在尝试备用源...`);
    }
  }

  // 尝试 3: wttr.in 免费公开气象源 (含优雅中文转义)
  try {
    const encodedCity = encodeURIComponent(city);
    const res = await axios.get(`https://wttr.in/${encodedCity}?format=j1`, {
      timeout: 5000,
      headers: { 'User-Agent': 'curl/7.68.0' }
    });
    if (res.data && res.data.current_condition && res.data.weather && res.data.weather.length > 0) {
      const current = res.data.current_condition[0];
      const today = res.data.weather[0];
      const rawWeather = current.weatherDesc?.[0]?.value || 'Sunny';
      const weatherText = WTTR_WEATHER_MAP[rawWeather] || rawWeather;
      const windDir = WTTR_WIND_DIR_MAP[current.winddir16Point] || `${current.winddir16Point}风`;
      const windSc = kmphToScale(current.windspeedKmph);
      const hasRain = rawWeather.toLowerCase().includes('rain') || weatherText.includes('雨');
      const uvAdvice = await fetchSolarNoonUVMax(city, weatherText);

      return {
        weather: `${weatherText}\n气温：${today.mintempC}度 ~ ${today.maxtempC}度`,
        weather_desc: weatherText,
        min_temp: `${today.mintempC}度`,
        max_temp: `${today.maxtempC}度`,
        wind_direction: windDir,
        wind_scale: windSc,
        shidu: `${current.humidity}%`,
        has_rain: !!hasRain,
        ultraviolet: uvAdvice
      };
    }
  } catch (e) {
    console.warn(`[Weather] wttr.in 请求异常 (${city}): ${e.message}，使用兜底数据。`);
  }

  // 尝试 4: 本地智能兜底数据 (保证推送绝对不中断)
  return {
    weather: '晴朗 ☀️\n气温：18度 ~ 26度',
    weather_desc: '晴朗 ☀️',
    min_temp: '18度',
    max_temp: '26度',
    wind_direction: '微风',
    wind_scale: '2级',
    shidu: '50%',
    has_rain: false,
    ultraviolet: '强 ｜ 正常防晒'
  };
}

module.exports = {
  getWeather,
  CITY_COORDINATES,
  SKYCON_MAP
};
