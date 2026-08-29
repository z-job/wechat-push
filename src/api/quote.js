const axios = require('axios');

// ==================== 内置精选考研药物化学核心考点库 (专为考研小宝宝定制 · 60条 13-17字极简防截断金句) ====================
const PHARMACY_FACTS = [
  // --- 1. β-内酰胺与抗生素考点 ---
  '青霉素母核为β-内酰胺并噻唑烷环。',
  '头孢菌素母核为β-内酰胺并二氢噻嗪环。',
  '克拉维酸是自杀性β-内酰胺酶抑制剂。',
  '红霉素属大环内酯，抑制细菌50S亚基。',
  '链霉素属氨基糖苷类，抑制核糖体30S亚基。',
  '万古霉素抑制细胞壁合成，抗阳性菌底牌。',
  '环丙沙星为氟喹诺酮类，抑制DNA回旋酶。',
  '喹诺酮类3位羧基与4位酮基为抗菌必需。',
  
  // --- 2. 磺胺与抗代谢考点 ---
  '磺胺类竞争性抑制二氢叶酸合成酶。',
  '甲氧苄啶TMP特异抑制二氢叶酸还原酶。',
  '磺胺与TMP合用可双重阻断叶酸代谢。',
  '异烟肼为异烟酸酰肼，用于一线抗结核。',
  '利福平特异性抑制细菌依赖DNA的RNA聚合酶。',
  '阿昔洛韦为无环鸟苷类似物抗疱疹病毒。',
  '奥司他韦为前药，抑制流感神经氨酸酶。',
  
  // --- 3. 抗肿瘤药物高频考点 ---
  '环磷酰胺为前药，经肝CYP450代谢活化。',
  '氟尿嘧啶为嘧啶拮抗剂抑制胸苷酸合成酶。',
  '甲氨蝶呤是二氢叶酸还原酶竞争性抑制剂。',
  '紫杉醇促进微管蛋白聚合，抑制微管解聚。',
  '顺铂为金属配合物，与DNA链内双交联。',
  '阿霉素嵌入DNA双螺旋并抑制拓扑异构酶Ⅱ。',

  // --- 4. 心血管系统药物考点 ---
  '卡托普利分子含巯基，特异性抑制ACE酶。',
  '氯沙坦为咪唑联苯类血管紧张素AT1拮抗剂。',
  '硝苯地平为1,4-二氢吡啶类，遇光易歧化。',
  '氨氯地平为长效二氢吡啶类钙通道阻滞剂。',
  '普萘洛尔为芳氧丙醇胺类非选择性β阻断剂。',
  '美托洛尔为选择性β1受体阻断剂降血压。',
  '他汀类药物竞争性抑制HMG-CoA还原酶。',
  '硝酸甘油在平滑肌释放NO激活鸟苷酸环化酶。',
  '胺碘酮为苯并呋喃类，属Ⅲ类抗心律失常药。',
  '地高辛为强心苷，特异抑制Na+/K+-ATP酶。',

  // --- 5. 消化与呼吸系统考点 ---
  '奥美拉唑为前药，特异抑制质子泵H+/K+-ATP酶。',
  '西咪替丁为咪唑类H2受体拮抗剂抑制胃酸。',
  '雷尼替丁分子含呋喃环，拮抗H2受体。',
  '昂丹司琼为咔唑酮类5-HT3受体拮抗剂止吐。',
  '沙丁胺醇为选择性β2受体激动剂用于平喘。',
  '茶碱通过抑制磷酸二酯酶PDE舒张支气管。',

  // --- 6. 中枢神经与麻醉镇痛考点 ---
  '地西泮母核为1,4-苯二氮䓬类镇静催眠。',
  '苯妥英钠结构含乙内酰脲，主治癫痫大发作。',
  '氯丙嗪为吩噻嗪类，阻断中枢多巴胺D2受体。',
  '氟哌啶醇为丁酰苯类强效抗精神病药。',
  '吗啡具5个手性中心，天然左旋体激动μ受体。',
  '哌替啶为苯基哌啶类，成瘾性弱于吗啡。',
  '普鲁卡因为对氨基苯甲酸酯类，易水解失效。',
  '利多卡因为酰胺类局麻药，耐酸碱不易水解。',

  // --- 7. 解热镇痛抗炎与激素代谢考点 ---
  '阿司匹林不可逆乙酰化抑制COX环氧酶。',
  '对乙酰氨基酚具对氨基酚结构，解热镇痛。',
  '布洛芬为芳基丙酸类，S-对映异构体活性强。',
  '塞来昔布为二芳基吡唑类选择性COX-2抑制剂。',
  '维生素C含连烯二醇结构，具有强还原性。',
  '维生素D3在肝25位和肾1α位羟基化活化。',
  '二甲双胍为双胍类降糖药，激活AMPK通路。',
  '阿卡波糖为伪四糖，竞争抑制α-葡萄糖苷酶。',
  '地塞米松为9α-氟-16α-甲基糖皮质激素。',

  // --- 8. 药化通用原理与代谢考点 ---
  '生物电子等排体替换可优化药物活性与毒性。',
  '前药修饰可显著改善药物脂溶性与生物利用度。',
  '左旋多巴能通过血脑屏障，脱羧生成多巴胺。',
  'CYP3A4是肝脏中催化药物代谢最主要的同工酶。',
  '吃西柚会抑制CYP3A4，显著增加药物毒性！'
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

// ==================== 内置精选双鱼座专属好运签 (小宝宝专属 · 7条纯吉金句 · <=15字) ====================
const PISCES_HOROSCOPE = [
  '双鱼座⭐好运连连，复习如有神助！',
  '双鱼座⭐今日诸事顺遂，元气满满！',
  '双鱼座⭐幸运值满格，考点过目不忘！',
  '双鱼座⭐喜气盈门，所遇皆是美好！',
  '双鱼座⭐贵人相助，难题迎刃而解！',
  '双鱼座⭐福气满满，心想皆能事成！',
  '双鱼座⭐吉星高照，每天都是上上签！'
];

// ==================== 内置精选天蝎座专属好运签 (大宝宝专属 · 7条纯吉金句 · <=15字) ====================
const SCORPIO_HOROSCOPE = [
  '天蝎座⭐科研顺利，灵感源源不断！',
  '天蝎座⭐今日运势极佳，心想事成！',
  '天蝎座⭐突破在即，实验数据喜人！',
  '天蝎座⭐财福双全，诸事皆得圆满！',
  '天蝎座⭐气场全开，难题迎刃而解！',
  '天蝎座⭐吉星庇佑，所向披靡大吉！',
  '天蝎座⭐鸿运当头，每天都是上上签！'
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
  
  // 随机抽取专属 100% 纯吉好运签 (严格控制在 15 字以内，每日随机不同)
  let horoscope = horoscopeName === '天蝎座' 
    ? getRandom(SCORPIO_HOROSCOPE)
    : getRandom(PISCES_HOROSCOPE);

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
