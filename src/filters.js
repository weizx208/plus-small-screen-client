import plueMessageBundle from "plus-message-bundle";

/**
 * ThinkSNS Plus 消息解析器，获取顶部消息.
 *
 * @param {Object} message
 * @param {String} defaultMessage
 * @return {String}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function plusMessageFirst(message, defaultMessage) {
  return plueMessageBundle(message, defaultMessage).getMessage();
}

/**
 * ThinkSNS Plus 消息解析器，获取顶部消息.
 *
 * @param {Object} message
 * @param {String} defaultMessage
 * @return {String}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function plusMessageAnalyze(message, defaultMessage) {
  return plueMessageBundle(message, defaultMessage).getMessage();
}

/**
 * 格式化时间
 * @author jsonleex <jsonlseex@163.com>
 * @param  {Object} date
 * @param  {String} fmt
 * @return {String}
 */
export function formatDate(date, fmt = "yyyy/MM/dd hh:mm") {
  date = new Date(date);
  const o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
}

/**
 * 时间转提示
 * 用于显示在我的动态时间轴
 * @author jsonleex <jsonlseex@163.com>
 * @param  {String} str
 * @return {String}
 */
export const time2txt = str => {
  if (!str) return "";
  // 兼容 IOS 保证传入数据格式 YYYY/MM/dd HH:mm:ss
  let date = new Date(str);

  // 时间差 = 当前时间 - date (单位: 毫秒)
  let time = new Date() - date;

  if (time < 0) {
    return "";
  } else if (time / 3600000 < 24) {
    return "今天";
  } else {
    const M = (date.getMonth() + 1 + "").padStart(2, "0");
    const D = (date.getDate() + "").padStart(2, "0");
    return M + "月" + D;
  }
};

/**
 * 祖鲁时间和本地时间之间的时差 (单位:毫秒)
 * @returns {number} timezone offset
 */
export const timeOffset = new Date().getTimezoneOffset() * 60 * 1000;

/**
 * 将非标准祖鲁时间转化为标准祖鲁时间的时间戳
 * @param {Date|string|number} date 非标准祖鲁时间，需要进行转化 类似（"2018-10-10 06:14:24"）
 */
export const addTimeOffset = date => {
  if (typeof date === "string") date = date.replace(/-/g, "/"); // for safari
  return +new Date(date) - timeOffset;
};

/**
 * 根据目标时间计算与当前时间的时间差
 * @param {Date|number|string} date 祖鲁时间
 */
export const time2tips = date => {
  if (typeof date === "string") date = date.replace(/-/g, "/"); // for safari
  const time = +new Date(date);
  const offset = (+new Date() - time) / 1000;
  if (offset < 60) return "1分钟内";
  if (offset < 3600) return `${~~(offset / 60)}分钟前`;
  if (offset < 3600 * 24) return `${~~(offset / 3600)}小时前`;
  // 根据 time 获取到 "16:57"
  let timeStr;
  try {
    timeStr = new Date(time).toTimeString().match(/^\d{2}:\d{2}/)[0];
  } catch (e) {
    return offset;
  }
  if (offset < 3600 * 24 * 2) return `昨天 ${timeStr}`;
  if (offset < 3600 * 24 * 9) return `${~~(offset / 3600 / 24)}天前 ${timeStr}`;
  // 根据 time 获取到 "2018-06-16T23:12:32.000Z" 然后正则转化为 6-19 16:57
  return new Date(time)
    .toISOString()
    .replace(/^\d+-(\d+)-(\d+)T(\d+:\d+):\d+\.\d{3}Z$/, "$1-$2 $3");
};

/**
 * 格式化数字
 *     @author jsonleex <jsonlseex@163.com>
 */
export const formatNum = (a = 0) => {
  return (
    a > 0 &&
      (a > 99999999 && (a = Math.floor(a / 1e8) + "亿"),
      a > 9999 &&
        (a =
          a > 99999999
            ? Math.floor(a / 1e8) + "亿"
            : Math.floor(a / 1e4) + "万")),
    a
  );
};

/**
 * Markdown to text fiter.
 *
 * @param {string} markdown
 * @return {string}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function markdownText(markdown) {
  return require("./util/markdown").syntaxTextAndImage(markdown).text;
}
