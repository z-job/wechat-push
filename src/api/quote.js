const axios = require('axios');

// ==================== 内置精选药学冷知识库 (专为药学小宝宝定制 · 极简防截断版 14-17字) ====================
const PHARMACY_FACTS = [
  '阿司匹林源自柳树皮，可解热镇痛。',
  '青霉素是弗莱明度假归来意外发现的。',
  '胰岛素是首个DNA重组工业化蛋白药。',
  '维生素C又名抗坏血酸，治坏血病得名。',
  '阿托品提取自颠茄，意为"美丽女人"。',
  '咖啡因拮抗腺苷受体，半衰期4-5小时。',
  '二甲双胍起源于传统草药山羊豆。',
  '硝酸甘油既是炸药，也是心绞痛救命药。',
  '万古霉素被称为抗阳性菌的"最后防线"。',
  '吃药别喝西柚汁，会抑制药物代谢！'
];

// ==================== 内置精选情话库 (高甜专属 · 极简防截断版 12-14字) ====================
const SAYLOVE_QUOTES = [
  '万物皆有引力，我的中心永远是你。',
  '跨越364公里，清晨都在想你。',
  '愿我的早安，化作你一整天好运。',
  '你是药剂里的糖衣，融化疲惫。',
  '山高水远爱意长存，三餐四季。',
  '今天也要开心呀，我的小宝贝！',
  '晨风拂面，每一缕都在说喜欢你。'
];

// ==================== 内置精选彩虹屁库 (极简防截断版 12-15字) ====================
const CAIHONGPI_QUOTES = [
  '小宝宝今天也是最迷人的小仙女！',
  '你笑起来的时候，照亮了全世界。',
  '今天天气晴朗，不及你眨眼明媚。',
  '是谁家的小可爱？原来是我的宝贝！',
  '你的存在就是世间最美好的奇迹。'
];

// ==================== 内置精选古典诗词 ====================
const POETRY_QUOTES = [
  '只愿君心似我心，定不负相思意。',
  '身无彩凤双飞翼，心有灵犀一点通。',
  '愿得一心人，白头不相离。',
  '结发为夫妻，恩爱两不疑。',
  '山有木兮木有枝，心悦君兮君不知。',
  '晓看天色暮看云，行也思君，坐也思君。'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 聚合获取每日文案
 * @param {string} tianApiKey - 天行数据 API Key
 * @param {string} horoscopeName - 星座名称，如 '双鱼座' 或 '天蝎座'
 * @returns {Promise<object>}
 */
async function getQuotes(tianApiKey = '', horoscopeName = '双鱼座') {
  let saylove = getRandom(SAYLOVE_QUOTES);
  let caihongpi = getRandom(CAIHONGPI_QUOTES);
  let poetry = getRandom(POETRY_QUOTES);
  let pharmacy_fact = getRandom(PHARMACY_FACTS);
  
  // 默认星座运势文案 (极简防截断版 14-16字)
  let horoscope = horoscopeName === '天蝎座' 
    ? '天蝎座 ⭐ 运势极佳，科研突破心想事成！'
    : '双鱼座 ⭐ 综合指数98%，浪漫甜蜜好运连连！';

  // 尝试从天行数据获取更多动态文案
  if (tianApiKey && !tianApiKey.startsWith('${TODO')) {
    try {
      const [sayRes, piRes, starRes] = await Promise.allSettled([
        axios.get('https://apis.tianapi.com/saylove/index', { params: { key: tianApiKey }, timeout: 3000 }),
        axios.get('https://apis.tianapi.com/caihongpi/index', { params: { key: tianApiKey }, timeout: 3000 }),
        axios.get('https://apis.tianapi.com/star/index', { params: { key: tianApiKey, astro: horoscopeName }, timeout: 3000 })
      ]);

      if (sayRes.status === 'fulfilled' && sayRes.value.data && sayRes.value.data.result) {
        saylove = sayRes.value.data.result.content || saylove;
      }
      if (piRes.status === 'fulfilled' && piRes.value.data && piRes.value.data.result) {
        caihongpi = piRes.value.data.result.content || caihongpi;
      }
      if (starRes.status === 'fulfilled' && starRes.value.data && starRes.value.data.result) {
        const r = starRes.value.data.result;
        horoscope = `${horoscopeName} ⭐ 今日综合指数：${r.all || '95%'} | 爱情指数：${r.love || '100%'} ✨`;
      }
    } catch (e) {
      console.warn(`[Quotes] TianAPI enrichment partially failed: ${e.message}, using built-in high-quality quotes.`);
    }
  }

  // 尝试从今日诗词公共 API 获取诗词
  try {
    const poetRes = await axios.get('https://v2.jinrishici.com/one.json', { timeout: 3000 });
    if (poetRes.data && poetRes.data.status === 'success' && poetRes.data.data) {
      poetry = `"${poetRes.data.data.content}" —— ${poetRes.data.data.origin.author}《${poetRes.data.data.origin.title}》`;
    }
  } catch (e) {
    // 降级使用内置经典诗词
  }

  return {
    saylove,
    caihongpi,
    poetry,
    pharmacy_fact,
    horoscope
  };
}

module.exports = {
  getQuotes,
  getRandom
};
