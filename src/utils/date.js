const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// 强制全局默认时区为中国北京时间 (Asia/Shanghai, UTC+8)
dayjs.tz.setDefault('Asia/Shanghai');
process.env.TZ = 'Asia/Shanghai';

let Lunar, Solar;
try {
  const lunarPkg = require('lunar-javascript');
  Lunar = lunarPkg.Lunar;
  Solar = lunarPkg.Solar;
} catch (e) {
  // fallback
}

/**
 * 获取当前北京时间 dayjs 实例
 * @returns {dayjs.Dayjs}
 */
function getBeijingNow() {
  return dayjs().tz('Asia/Shanghai');
}

/**
 * 计算恋爱在一起的天数
 * @param {string} startDateStr - 格式 'YYYY-MM-DD'
 * @returns {number}
 */
function getLoveDays(startDateStr = '2025-04-06') {
  const start = dayjs.tz(startDateStr, 'Asia/Shanghai').startOf('day');
  const today = getBeijingNow().startOf('day');
  return today.diff(start, 'day');
}

/**
 * 计算距离下一个生日/纪念日还有多少天 (支持阳历和农历)
 * 严格锁定北京时间计算，杜绝云端 UTC 导致日期晚一天的问题
 * @param {string} monthDayStr - 格式 'MM-DD'，如 '10-16' 或 '03-08'
 * @param {boolean} isLunar - 是否为农历生日
 * @returns {number}
 */
function getDaysUntilNextDate(monthDayStr, isLunar = false) {
  const [month, day] = monthDayStr.split('-').map(Number);
  const now = getBeijingNow();
  const today = now.startOf('day');

  if (isLunar && Lunar && Solar) {
    // 强制使用北京时间的年月日构造 Solar，杜绝 UTC 导致农历偏移
    const todaySolar = Solar.fromYmd(now.year(), now.month() + 1, now.date());
    const currentLunarYear = todaySolar.getLunar().getYear();
    
    let targetSolar = Lunar.fromYmd(currentLunarYear, month, day).getSolar();
    let target = dayjs.tz(targetSolar.toString(), 'Asia/Shanghai').startOf('day');

    if (target.isBefore(today)) {
      targetSolar = Lunar.fromYmd(currentLunarYear + 1, month, day).getSolar();
      target = dayjs.tz(targetSolar.toString(), 'Asia/Shanghai').startOf('day');
    }

    return target.diff(today, 'day');
  }

  // 阳历计算
  const currentYear = now.year();
  let target = dayjs.tz(`${currentYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`, 'Asia/Shanghai').startOf('day');

  if (target.isBefore(today)) {
    target = dayjs.tz(`${currentYear + 1}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`, 'Asia/Shanghai').startOf('day');
  }

  return target.diff(today, 'day');
}

/**
 * 获取格式化当前北京时间日期
 * @returns {{dateStr: string, weekDayStr: string}}
 */
function getFormattedDate() {
  const now = getBeijingNow();
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return {
    dateStr: now.format('YYYY年MM月DD日'),
    weekDayStr: weekDays[now.day()]
  };
}

module.exports = {
  getBeijingNow,
  getLoveDays,
  getDaysUntilNextDate,
  getFormattedDate
};
