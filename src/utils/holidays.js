// src/utils/holidays.js
// 台灣國定假日 · 美國國定假日 · 農曆重要節日

import { solarToLunar } from './lunarUtils';

// ── 顯示色彩定義 ──────────────────────────────────────────────
export const HolidayColors = {
  TW    : { text: '#C62828', bg: '#FFEBEE', label: '[台]' },
  US    : { text: '#1565C0', bg: '#E3F2FD', label: '[美]' },
  LUNAR : { text: '#BF360C', bg: '#FBE9E7', label: '[農]' },
};

// ── 工具函式 ──────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }
function toDS(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }

/**
 * 第 n 個星期幾
 * weekday: 0=日 1=一 … 6=六
 * n: 正整數 or -1 (最後一個)
 */
function nthWeekday(year, month, weekday, n) {
  if (n > 0) {
    const first = new Date(year, month - 1, 1);
    const diff  = (weekday - first.getDay() + 7) % 7;
    return 1 + diff + (n - 1) * 7;
  } else {
    const last = new Date(year, month, 0);
    const diff = (last.getDay() - weekday + 7) % 7;
    return last.getDate() - diff;
  }
}

/**
 * 清明節日期（21 世紀近似值）
 * 實際以天文演算為準，此公式對 2001–2099 年誤差通常 ≤1 天
 */
function qingmingDay(year) {
  // year%4==0 or year%4==1 → 4月4日；其他 → 4月5日
  return (year % 4 === 0 || year % 4 === 1) ? 4 : 5;
}

// ── 台灣固定國定假日 ──────────────────────────────────────────
const TW_FIXED = [
  { m: 1,  d: 1,    dFn: null, name: '開國紀念日' },
  { m: 2,  d: 28,   dFn: null, name: '和平紀念日' },
  { m: 4,  d: 4,    dFn: null, name: '兒童節'     },
  { m: 4,  d: null, dFn: qingmingDay, name: '清明節' },
  { m: 10, d: 10,   dFn: null, name: '國慶日'     },
];

// ── 台灣農曆國定假日 ──────────────────────────────────────────
const TW_LUNAR = [
  { lm: 1, ld: 1,  name: '春節' },
  { lm: 1, ld: 2,  name: '春節' },
  { lm: 1, ld: 3,  name: '春節' },
  { lm: 5, ld: 5,  name: '端午節' },
  { lm: 8, ld: 15, name: '中秋節' },
];

// ── 農曆民俗節日 ──────────────────────────────────────────────
const LUNAR_FESTIVALS = [
  { lm: 1,  ld: 15, name: '元宵節' },
  { lm: 2,  ld: 2,  name: '龍抬頭' },
  { lm: 7,  ld: 7,  name: '七夕'   },
  { lm: 7,  ld: 15, name: '中元節' },
  { lm: 9,  ld: 9,  name: '重陽節' },
];

// ── 美國國定假日 ──────────────────────────────────────────────
function buildUSHolidays(year) {
  return [
    { date: toDS(year, 1,  1),                              name: '元旦'       },
    { date: toDS(year, 1,  nthWeekday(year, 1,  1, 3)),    name: 'MLK紀念日'  },
    { date: toDS(year, 2,  nthWeekday(year, 2,  1, 3)),    name: '總統日'     },
    { date: toDS(year, 5,  nthWeekday(year, 5,  1, -1)),   name: '國殤日'     },
    { date: toDS(year, 6,  19),                             name: 'Juneteenth' },
    { date: toDS(year, 7,  4),                              name: '獨立日'     },
    { date: toDS(year, 9,  nthWeekday(year, 9,  1, 1)),    name: '勞動節'     },
    { date: toDS(year, 10, nthWeekday(year, 10, 1, 2)),    name: '哥倫布日'   },
    { date: toDS(year, 11, 11),                             name: '退伍軍人節' },
    { date: toDS(year, 11, nthWeekday(year, 11, 4, 4)),    name: '感恩節'     },
    { date: toDS(year, 12, 25),                             name: '聖誕節'     },
  ];
}

// ── 快取 ──────────────────────────────────────────────────────
const _cache = new Map();

/**
 * 計算指定年份所有節假日
 * @param {number} year  西元年
 * @returns {Map<string, Array<{name:string, type:'TW'|'US'|'LUNAR'}>>}
 *          key = 'YYYY-MM-DD'
 */
export function getHolidaysForYear(year) {
  if (_cache.has(year)) return _cache.get(year);

  const map = new Map();

  // 新增一筆節日（自動去重）
  const add = (ds, name, type) => {
    if (!map.has(ds)) map.set(ds, []);
    const list = map.get(ds);
    if (!list.some(h => h.name === name && h.type === type)) {
      list.push({ name, type });
    }
  };

  // 1. 台灣固定假日
  TW_FIXED.forEach(({ m, d, dFn, name }) => {
    add(toDS(year, m, dFn ? dFn(year) : d), name, 'TW');
  });

  // 2. 美國假日
  buildUSHolidays(year).forEach(({ date, name }) => add(date, name, 'US'));

  // 3. 農曆假日：掃描全年每一天
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      let lunar;
      try { lunar = solarToLunar(year, month, day); }
      catch { continue; }
      if (!lunar || lunar.isLeap) continue;   // 跳過閏月

      const { lunarMonth: lm, lunarDay: ld } = lunar;
      const ds = toDS(year, month, day);

      // 台灣農曆國定假日
      TW_LUNAR.forEach(def => {
        if (def.lm === lm && def.ld === ld) add(ds, def.name, 'TW');
      });

      // 農曆民俗節日
      LUNAR_FESTIVALS.forEach(def => {
        if (def.lm === lm && def.ld === ld) add(ds, def.name, 'LUNAR');
      });

      // 除夕：農曆12月最後一天（隔天是農曆正月初一）
      if (lm === 12 && ld >= 28) {
        try {
          const next = new Date(year, month - 1, day + 1);
          const nl = solarToLunar(
            next.getFullYear(), next.getMonth() + 1, next.getDate()
          );
          if (nl && !nl.isLeap && nl.lunarMonth === 1 && nl.lunarDay === 1) {
            add(ds, '除夕', 'LUNAR');
          }
        } catch { /* skip */ }
      }
    }
  }

  // 排序：TW > LUNAR > US
  const ORDER = { TW: 0, LUNAR: 1, US: 2 };
  map.forEach(list => list.sort((a, b) => ORDER[a.type] - ORDER[b.type]));

  _cache.set(year, map);
  return map;
}

/**
 * 取得指定日期的節假日清單
 * @returns {Array<{name:string, type:'TW'|'US'|'LUNAR'}>}
 */
export function getHolidaysForDate(year, month, day) {
  return getHolidaysForYear(year).get(toDS(year, month, day)) || [];
}
