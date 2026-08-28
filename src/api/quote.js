const axios = require('axios');

// ==================== 内置精选药学冷知识库 (专为药学小宝宝定制) ====================
const PHARMACY_FACTS = [
  '阿司匹林（Aspirin）最初提取自柳树皮中的水杨酸，古希腊希波克拉底就曾用柳树皮退烧解痛。',
  '青霉素的发现纯属意外——1928年弗莱明度假归来发现培养皿被霉菌污染，霉菌周围细菌全部融解。',
  '胰岛素是人类第一个用重组DNA技术大规模工业化生产的蛋白质药物（1982年），挽救数亿生命。',
  '人体肝脏中的CYP450酶系统代谢约75%临床药物。吃药前后千万别喝西柚汁，会抑制酶活性导致药物蓄积！',
  '维生素C的化学名叫抗坏血酸（Ascorbic acid），因大航海时代治疗水手坏血病而得名。',
  '阿托品（Atropine）提取自颠茄（Belladonna），意大利语意为"美丽女人"，文艺复兴女性用其散瞳美目。',
  '咖啡因是全球摄入最多的精神活性物质，通过竞争性拮抗腺苷受体消除疲劳感，半衰期约4-5小时。',
  '对乙酰氨基酚（扑热息痛/泰诺）是全球使用最广的解热镇痛药之一，但其中枢作用机制至今未完全阐明。',
  '世界上第一支疫苗由爱德华·詹纳在1796年发明，用牛痘预防天花，"vaccine"词源即拉丁语"vacca"（牛）。',
  '二甲双胍（降糖一线药）起源于中世纪欧洲传统草药山羊豆（Galega officinalis）。',
  '硝酸甘油既是诺贝尔发明的烈性炸药成分，也是治疗冠心病心绞痛的经典血管扩张救命药。',
  '万古霉素被称为抗革兰阳性菌感染的"最后防线"（last resort），需严格监控血药浓度。'
];

// ==================== 内置精选情话库 (高甜专属) ====================
const SAYLOVE_QUOTES = [
  '世间万物皆有引力，而我的引力中心永远是你。',
  '大名到天津的距离，挡不住我每天清晨想你的心跳。',
  '愿我的早安，能化作你一整天温柔的好运气。',
  '你是药剂里最甜的那味糖衣，融化了我所有的疲惫。',
  '山高水远，爱意长存；一日两人，三餐四季。',
  '今天也要开心呀，我的全世界最可爱的小宝宝！',
  '跨越距离的思念，每一缕微风都在替我说喜欢你。'
];

// ==================== 内置精选彩虹屁库 ====================
const CAIHONGPI_QUOTES = [
  '小宝宝今天也是全世界最迷人、最优秀的小仙女！',
  '你笑起来的时候，整个世界的光都被你照亮了。',
  '今天的天气晴朗，但都不及你眨眼时的万分之一明媚。',
  '是谁家的小可爱又在发光？原来是大宝宝最爱的宝贝！',
  '你的存在就是这个世界上最美好的奇迹。'
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
 * @returns {Promise<object>}
 */
async function getQuotes(tianApiKey = '') {
  let saylove = getRandom(SAYLOVE_QUOTES);
  let caihongpi = getRandom(CAIHONGPI_QUOTES);
  let poetry = getRandom(POETRY_QUOTES);
  let pharmacy_fact = getRandom(PHARMACY_FACTS);
  let horoscope = '今日整体运势极佳，心想事成，爱情指数五颗星 ⭐⭐⭐⭐⭐！';

  // 尝试从天行数据获取更多动态文案
  if (tianApiKey && !tianApiKey.startsWith('${TODO')) {
    try {
      const [sayRes, piRes, starRes] = await Promise.allSettled([
        axios.get('https://apis.tianapi.com/saylove/index', { params: { key: tianApiKey }, timeout: 3000 }),
        axios.get('https://apis.tianapi.com/caihongpi/index', { params: { key: tianApiKey }, timeout: 3000 }),
        axios.get('https://apis.tianapi.com/star/index', { params: { key: tianApiKey, astro: '双鱼座' }, timeout: 3000 })
      ]);

      if (sayRes.status === 'fulfilled' && sayRes.value.data && sayRes.value.data.result) {
        saylove = sayRes.value.data.result.content || saylove;
      }
      if (piRes.status === 'fulfilled' && piRes.value.data && piRes.value.data.result) {
        caihongpi = piRes.value.data.result.content || caihongpi;
      }
      if (starRes.status === 'fulfilled' && starRes.value.data && starRes.value.data.result) {
        const r = starRes.value.data.result;
        horoscope = `双鱼座 ♓ 今日综合指数：${r.all || '95%'} | 爱情指数：${r.love || '100%'} ✨`;
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
