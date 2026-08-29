const dayjs = require('dayjs');
let Lunar, Solar;
try {
  const lunarPkg = require('lunar-javascript');
  Lunar = lunarPkg.Lunar;
  Solar = lunarPkg.Solar;
} catch (e) {
  // fallback
}

/**
 * 计算恋爱在一起的天数
 * @param {string} startDateStr - 格式 'YYYY-MM-DD'
 * @returns {number}
 */
function getLoveDays(startDateStr = '2025-04-06') {
  const start = dayjs(startDateStr).startOf('day');
  const today = dayjs().startOf('day');
  return today.diff(start, 'day');
}

/**
 * 计算距离下一个生日/纪念日还有多少天 (支持阳历和农历)
 * @param {string} monthDayStr - 格式 'MM-DD'，如 '10-16' 或 '03-08'
 * @param {boolean} isLunar - 是否为农历生日
 * @returns {number}
 */
function getDaysUntilNextDate(monthDayStr, isLunar = false) {
  const [month, day] = monthDayStr.split('-').map(Number);
  const now = dayjs();
  const today = now.startOf('day');

  if (isLunar && Lunar && Solar) {
    const todaySolar = Solar.fromDate(new Date());
    const currentLunarYear = todaySolar.getLunar().getYear();
    
    let targetSolar = Lunar.fromYmd(currentLunarYear, month, day).getSolar();
    let target = dayjs(targetSolar.toString()).startOf('day');

    if (target.isBefore(today)) {
      targetSolar = Lunar.fromYmd(currentLunarYear + 1, month, day).getSolar();
      target = dayjs(targetSolar.toString()).startOf('day');
    }

    return target.diff(today, 'day');
  }

  // 阳历计算
  const currentYear = now.year();
  let target = dayjs(`${currentYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`).startOf('day');

  if (target.isBefore(today)) {
    target = dayjs(`${currentYear + 1}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`).startOf('day');
  }

  return target.diff(today, 'day');
}

/**
 * 获取格式化当前日期
 * @returns {{dateStr: string, weekDayStr: string}}
 */
function getFormattedDate() {
  const now = dayjs();
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return {
    dateStr: now.format('YYYY年MM月DD日'),
    weekDayStr: weekDays[now.day()]
  };
}

module.exports = {
  getLoveDays,
  getDaysUntilNextDate,
  getFormattedDate
};
