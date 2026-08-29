const axios = require('axios');

// ==================== 内置精选药学冷知识库 (专为药学小宝宝定制 · 精炼防截断版) ====================
const PHARMACY_FACTS = [
  '阿司匹林最初提取自柳树皮，古希腊曾用其退热止痛。',
  '青霉素是1928年弗莱明度假归来意外发现的。',
  '胰岛素是人类首个用DNA重组技术生产的蛋白药物。',
  '维生素C又名抗坏血酸，因治疗大航海坏血病得名。',
  '阿托品提取自颠茄，意大利语意为"美丽女人"。',
  '咖啡因拮抗腺苷受体消除疲劳，半衰期约4-5小时。',
  '二甲双胍起源于中世纪欧洲传统草药山羊豆。',
  '硝酸甘油既是烈性炸药成分，也是冠心病经典救命药。',
  '万古霉素被称为抗革兰阳性菌感染的"最后防线"。',
  '吃药前后千万别喝西柚汁，会抑制酶活性导致药物蓄积！'
];

// ==================== 内置精选情话库 (高甜专属 · 精炼防截断版) ====================
const SAYLOVE_QUOTES = [
  '世间万物皆有引力，而我的中心永远是你。',
  '跨越364公里，清晨微风都在替我说喜欢你。',
  '大名到天津的晨风，带着我对你满满的思念。',
  '愿我的早安，化作你一整天温柔的好运气。',
  '你是药剂里最甜的糖衣，融化了我所有的疲惫。',
  '山高水远爱意长存，一日两人三餐四季。',
  '今天也要开心呀，我的全世界最可爱的小宝宝！'
];

// ==================== 内置精选彩虹屁库 (精炼防截断版) ====================
const CAIHONGPI_QUOTES = [
  '小宝宝今天也是全世界最迷人的小仙女！',
  '你笑起来的时候，整个世界的光都被你照亮了。',
  '今天的天气很晴朗，但都不及你眨眼时的明媚。',
  '是谁家的小可爱又在发光？原来是我的宝贝！',
  '你的存在就是这个世界上最美好的小奇迹。'
];

// ==================== 内置精选古典诗词 ====================
const POETRY_QUOTES = [
  '山有木兮木有枝，心悦君兮君不知。——《越人歌》',
  '只愿君心似我心，定不负相思意。——李之仪《卜算子》',
  '身无彩凤双飞翼，心有灵犀一点通。——李商隐《无题》',
  '愿得一心人，白头不相离。——卓文君《白头吟》',
  '结发为夫妻，恩爱两不疑。——苏武《留别妻》',
  '晓看天色暮看云，行也思君，坐也思君。——唐寅《一剪梅》'
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
  
  // 默认星座运势文案 (精炼防截断版)
  let horoscope = horoscopeName === '天蝎座' 
    ? '天蝎座 ⭐ 今日运势极佳，科研突破心想事成！'
    : '双鱼座 ⭐ 今日综合指数98%，浪漫甜蜜好运连连！';

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
