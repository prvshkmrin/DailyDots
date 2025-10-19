/* streaks.js — compute current & best streaks */

(function (global) {

  // dates: array or Set of ISO dates "YYYY-MM-DD"
  function normalize(dates) {
    const arr = Array.isArray(dates) ? dates.slice() : Array.from(dates || []);
    return arr.filter(Boolean).sort();
  }

  function isConsecutive(prevISO, nextISO) {
    return Dates.addDays(prevISO, 1) === nextISO;
  }

  function bestStreak(dates) {
    const arr = normalize(dates);
    if (arr.length === 0) return 0;
    let best = 1, cur = 1;
    for (let i=1;i<arr.length;i++){
      if (isConsecutive(arr[i-1], arr[i])) { cur++; best = Math.max(best, cur); }
      else { cur = 1; }
    }
    return best;
  }

  // Count backward from upToISO (default today) as long as each day is present
  function currentStreak(dates, upToISO) {
    const set = new Set(dates || []);
    let cur = 0;
    let d = upToISO || Dates.todayISO();
    // If today not done but yesterday is, streak ends yesterday.
    // So first step: if today is done, count it, else check yesterday.
    if (set.has(d)) {
      while (set.has(d)) { cur++; d = Dates.addDays(d, -1); }
      return cur;
    } else {
      d = Dates.addDays(d, -1);
      while (set.has(d)) { cur++; d = Dates.addDays(d, -1); }
      return cur;
    }
  }

  global.Streaks = { currentStreak, bestStreak };
})(window);
