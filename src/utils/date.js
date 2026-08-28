const dayjs = require('dayjs');

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
 * 计算距离下一个生日/纪念日还有多少天
 * @param {string} monthDayStr - 格式 'MM-DD'
 * @returns {number}
 */
function getDaysUntilNextDate(monthDayStr) {
  const [month, day] = monthDayStr.split('-').map(Number);
  const now = dayjs();
  const currentYear = now.year();
  let target = dayjs(`${currentYear}-${month}-${day}`).startOf('day');
  const today = now.startOf('day');

  if (target.isBefore(today)) {
    target = dayjs(`${currentYear + 1}-${month}-${day}`).startOf('day');
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
