/**
 * 農曆轉換工具 — 純 JS 天文演算法
 * 基於 Jean Meeus "Astronomical Algorithms" 第二版
 * 支援西元 1900–2100 年，精度約 ±1 分鐘
 */

// ─── 常數 ────────────────────────────────────────────────────────────────────
const HEAVENLY_STEMS   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const EARTHLY_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ZODIACS          = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'];
const LUNAR_MONTHS     = ['正','二','三','四','五','六','七','八','九','十','冬','臘'];
const LUNAR_DAYS       = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
];

/** 北京時間 UTC+8，換算為儒略日的偏移 */
const CST = 8 / 24;

// ─── 快取（避免重複天文計算）──────────────────────────────────────────────────
const _resultCache    = new Map(); // 'yyyy-mm-dd' → LunarResult
const _yearMonthCache = new Map(); // solarYear    → MonthEntry[]

// ─── 基礎天文函式 ─────────────────────────────────────────────────────────────

function toRad(deg) { return deg * Math.PI / 180; }

/**
 * 格里曆 → 儒略日數（Julian Day Number）
 * 回傳值為整數，代表當天正午的 JD
 */
function gregToJD(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
       + Math.floor(30.6001 * (month + 1))
       + day + B - 1524.5;
}

/**
 * 計算第 k 個朔（新月）的儒略暦日（JDE）
 * k = 0 對應 2000 年 1 月的朔
 * 來源：Meeus Ch.49，精度 ±2 分鐘
 */
function newMoonJDE(k) {
  const T  = k / 1236.85;
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;

  let JDE = 2451550.09766 + 29.530588861 * k
          + 0.00015437 * T2
          - 0.000000150 * T3
          + 0.00000000073 * T4;

  const E  = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;

  const M  = toRad(  2.5534    +   29.10535670 * k - 0.0000014 * T2 - 0.00000011 * T3);
  const Mp = toRad(201.5643    +  385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4);
  const F  = toRad(160.7108    +  390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4);
  const Om = toRad(124.7746    -    1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3);

  JDE += -0.40720 * Math.sin(Mp)
       +  0.17241 * E  * Math.sin(M)
       +  0.01608 * Math.sin(2 * Mp)
       +  0.01039 * Math.sin(2 * F)
       +  0.00739 * E  * Math.sin(Mp - M)
       -  0.00514 * E  * Math.sin(Mp + M)
       +  0.00208 * E2 * Math.sin(2 * M)
       -  0.00111 * Math.sin(Mp - 2 * F)
       -  0.00057 * Math.sin(Mp + 2 * F)
       +  0.00056 * E  * Math.sin(2 * Mp + M)
       -  0.00042 * Math.sin(3 * Mp)
       +  0.00042 * E  * Math.sin(M + 2 * F)
       +  0.00038 * E  * Math.sin(M - 2 * F)
       -  0.00024 * E  * Math.sin(2 * Mp - M)
       -  0.00017 * Math.sin(Om)
       -  0.00007 * Math.sin(Mp + 2 * M)
       +  0.00004 * Math.sin(2 * Mp - 2 * F)
       +  0.00004 * Math.sin(3 * M)
       +  0.00003 * Math.sin(Mp + M - 2 * F)
       +  0.00003 * Math.sin(2 * Mp + 2 * F)
       -  0.00003 * Math.sin(Mp + M + 2 * F)
       +  0.00003 * Math.sin(Mp - M + 2 * F)
       -  0.00002 * Math.sin(Mp - M - 2 * F)
       -  0.00002 * Math.sin(3 * Mp + M)
       +  0.00002 * Math.sin(4 * Mp);

  return JDE;
}

/**
 * 計算給定 JDE 的太陽視黃經（度）
 * 來源：Meeus Ch.25 低精度版，精度約 0.01°
 */
function sunLon(jde) {
  const T  = (jde - 2451545.0) / 36525;
  const T2 = T * T;

  let L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T2) % 360;
  if (L0 < 0) L0 += 360;

  const M  = toRad(((357.52911 + 35999.05029 * T - 0.0001537 * T2) % 360 + 360) % 360);
  const C  = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M)
           + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
           + 0.000289 * Math.sin(3 * M);

  let lon = L0 + C - 0.00569 - 0.00478 * Math.sin(toRad(125.04 - 1934.136 * T));
  lon = ((lon % 360) + 360) % 360;
  return lon;
}

/**
 * 牛頓法迭代，找到太陽黃經達到 targetLon 的 JDE
 * 以 year 年某大致時間為初始估算值
 */
function solarTermJDE(year, targetLon) {
  // 春分 (0°) 約在 3/20；每度需 365.25/360 天
  const doy = ((targetLon / 360) * 365.25 + 79) % 365.25;
  let jde = gregToJD(year, 1, 1) + doy;

  for (let i = 0; i < 50; i++) {
    const lon = sunLon(jde);
    let delta = targetLon - lon;
    while (delta >  180) delta -= 360;
    while (delta < -180) delta += 360;
    if (Math.abs(delta) < 0.000001) break;
    jde += (delta / 360) * 365.25;
  }
  return jde;
}

/**
 * 判斷時間段 [startJDE, endJDE) 內（TT 時間，非北京時間）
 * 是否包含中氣（中氣位於太陽黃經 0°, 30°, 60°, …, 330°）
 */
function hasPrincipalTerm(startJDE, endJDE) {
  const lon1 = sunLon(startJDE);
  const lon2 = sunLon(endJDE);
  if (lon2 >= lon1) {
    // 未跨過 360°→0°：看是否跨越一個 30 的整數倍
    return Math.floor(lon1 / 30) < Math.floor(lon2 / 30);
  }
  // 跨過 360°→0°：一定包含 0°（春分），是中氣
  return true;
}

// ─── 農曆年結構 ───────────────────────────────────────────────────────────────

/**
 * 計算包含西元 solarYear 年大部分時間的農曆月份結構。
 *
 * 以「冬至前最後一個朔日」（11月/子月初一）為起點，
 * 到下一個冬至前最後一個朔日為止（共 12 或 13 個月）。
 *
 * @returns {Array<{ jd: number, month: number, isLeap: boolean }>}
 *   jd = 初一的儒略日（已含北京時間 +8h 偏移）
 *   month = 1–12
 *   isLeap = 是否為閏月
 */
function getLunarYearMonths(solarYear) {
  if (_yearMonthCache.has(solarYear)) return _yearMonthCache.get(solarYear);

  // 取得兩個相鄰冬至（北京時間）
  const ws1 = solarTermJDE(solarYear - 1, 270) + CST; // 上一年冬至
  const ws2 = solarTermJDE(solarYear,     270) + CST; // 本年冬至

  // 找冬至前最後一個朔：newMoonJDE(k)+CST <= ws，newMoonJDE(k+1)+CST > ws
  function kBeforeWS(ws) {
    let k = Math.round((ws - CST - 2451550.09766) / 29.530588861);
    while (newMoonJDE(k)     + CST >  ws) k--;
    while (newMoonJDE(k + 1) + CST <= ws) k++;
    return k;
  }

  const kStart = kBeforeWS(ws1);
  const kEnd   = kBeforeWS(ws2);

  // 收集所有朔日 JD（含首尾）
  const newMoons = [];
  for (let ki = kStart; ki <= kEnd; ki++) {
    newMoons.push(newMoonJDE(ki) + CST);
  }

  const count    = newMoons.length - 1; // 12 或 13
  const hasLeap  = count === 13;

  const months = [];
  let monthNum      = 11;   // 第一個月是冬月（11月）
  let leapInserted  = false;

  for (let i = 0; i < count; i++) {
    const startJD = newMoons[i];
    const endJD   = newMoons[i + 1];

    // 注意：sunLon 使用 TT（≈ JDE），要去掉 CST 偏移
    const hasTerm = hasPrincipalTerm(startJD - CST, endJD - CST);

    if (hasLeap && !leapInserted && !hasTerm) {
      // 此月無中氣 → 閏月，月號與前一月相同
      months.push({ jd: startJD, month: monthNum, isLeap: true });
      leapInserted = true;
    } else {
      months.push({ jd: startJD, month: monthNum, isLeap: false });
      monthNum = monthNum === 12 ? 1 : monthNum + 1;
    }
  }

  _yearMonthCache.set(solarYear, months);
  return months;
}

// ─── 對外 API ─────────────────────────────────────────────────────────────────

/**
 * 西元日期轉農曆
 * @param {number} year  西元年
 * @param {number} month 月（1-12）
 * @param {number} day   日
 * @returns {{
 *   lunarYear: number,
 *   lunarMonth: number,
 *   lunarDay: number,
 *   isLeap: boolean,
 *   monthStr: string,   // e.g. "正月" "閏五月"
 *   dayStr: string,     // e.g. "初一" "十五"
 *   ganZhi: string,     // e.g. "甲辰"
 *   zodiac: string,     // e.g. "龍"
 * }}
 */
export function solarToLunar(year, month, day) {
  const key = `${year}-${month}-${day}`;
  if (_resultCache.has(key)) return _resultCache.get(key);

  // 目標日期的 JD（北京時間正午 = JD + 0.5 - CST 誤差忽略，直接取整天）
  const targetJD = gregToJD(year, month, day) + 0.5;

  let result = null;

  // 搜尋當年及次年的農曆月份結構（涵蓋所有邊界情況）
  outer:
  for (const sy of [year, year + 1]) {
    const months = getLunarYearMonths(sy);

    for (let i = 0; i < months.length; i++) {
      const startJD = months[i].jd;
      const endJD   = i + 1 < months.length
        ? months[i + 1].jd
        : months[i].jd + 32; // 最後一個月給個寬裕的結束點

      if (targetJD >= startJD && targetJD < endJD) {
        const lunarDay = Math.floor(targetJD - startJD) + 1;

        // 判斷農曆年：以正月初一為界
        const springFestivalEntry = months.find(m => m.month === 1 && !m.isLeap);
        const isBeforeNewYear = springFestivalEntry && targetJD < springFestivalEntry.jd;
        const lunarYear = isBeforeNewYear ? sy - 1 : sy;

        // 干支 & 生肖（以農曆年計算）
        const stemIdx   = ((lunarYear - 4) % 10 + 10) % 10;
        const branchIdx = ((lunarYear - 4) % 12 + 12) % 12;

        result = {
          lunarYear,
          lunarMonth : months[i].month,
          lunarDay,
          isLeap     : months[i].isLeap,
          monthStr   : (months[i].isLeap ? '閏' : '') + LUNAR_MONTHS[months[i].month - 1] + '月',
          dayStr     : LUNAR_DAYS[lunarDay - 1] || '?',
          ganZhi     : HEAVENLY_STEMS[stemIdx] + EARTHLY_BRANCHES[branchIdx],
          zodiac     : ZODIACS[branchIdx],
        };
        break outer;
      }
    }
  }

  // 後備（理論上不會到這裡）
  if (!result) {
    result = {
      lunarYear: year, lunarMonth: month, lunarDay: day,
      isLeap: false, monthStr: '—', dayStr: '—', ganZhi: '', zodiac: '',
    };
  }

  _resultCache.set(key, result);
  return result;
}

/**
 * 取得適合顯示在日曆格的農曆短文字
 *   初一 → 顯示月份（e.g. "正月"、"閏五月"）
 *   其他 → 顯示日名（e.g. "初五"、"十五"）
 */
export function getLunarDateStr(year, month, day) {
  try {
    const lunar = solarToLunar(year, month, day);
    if (lunar.lunarDay === 1) {
      return (lunar.isLeap ? '閏' : '') + LUNAR_MONTHS[lunar.lunarMonth - 1] + '月';
    }
    return lunar.dayStr;
  } catch {
    return '';
  }
}

/**
 * 取得完整農曆日期字串，例如「農曆 正月十五」
 */
export function getLunarFullStr(year, month, day) {
  try {
    const lunar = solarToLunar(year, month, day);
    return `農曆 ${lunar.monthStr}${lunar.dayStr}`;
  } catch {
    return '';
  }
}

/**
 * 取得農曆年份標示，例如「民國 115 年・龍年」
 * 以該西元年 6 月 1 日所屬農曆年為準（避免春節前後歧義）
 */
export function getLunarYearStr(solarYear) {
  try {
    const lunar = solarToLunar(solarYear, 6, 1);
    const rocYear = lunar.lunarYear - 1911;
    return `民國 ${rocYear} 年・${lunar.zodiac}年`;
  } catch {
    return '';
  }
}

/**
 * 取得農曆完整年月日標示，例如「農曆 民國 115 年 正月十五」
 */
export function getLunarFullWithYearStr(year, month, day) {
  try {
    const lunar = solarToLunar(year, month, day);
    const rocYear = lunar.lunarYear - 1911;
    return `農曆 民國 ${rocYear} 年 ${lunar.monthStr}${lunar.dayStr}`;
  } catch {
    return '';
  }
}
