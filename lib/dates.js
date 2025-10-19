/* dates.js — date helpers & month grid generation */

(function (global) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  function todayISO() {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  }

  function toISO(d) {
    const x = new Date(d);
    x.setHours(0,0,0,0);
    return x.toISOString().slice(0,10);
  }

  function fromISO(iso) {
    const d = new Date(iso + "T00:00:00");
    d.setHours(0,0,0,0);
    return d;
  }

  function addDays(iso, n) {
    const d = fromISO(iso);
    d.setTime(d.getTime() + n * MS_PER_DAY);
    return toISO(d);
  }

  function isSameISO(a,b){ return a === b; }

  function startOfMonthISO(year, month /* 0-11 */) {
    return toISO(new Date(year, month, 1));
  }

  function endOfMonthISO(year, month) {
    return toISO(new Date(year, month + 1, 0));
  }

  // Weekday headers
  const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // Returns 6x7 matrix (array of ISO strings) for calendar view
  // startOnMonday=false keeps Sunday as first column
  function monthMatrix(year, month, startOnMonday=false) {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const firstWeekday = (first.getDay() + (startOnMonday?6:0)) % 7;
    const daysInMonth = last.getDate();

    const cells = 42;
    const matrix = [];
    const startDate = new Date(first);
    startDate.setDate(first.getDate() - firstWeekday);

    for (let i=0;i<cells;i++){
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      matrix.push(toISO(d));
    }
    return matrix;
  }

  function monthLabel(year, month) {
    return new Date(year, month, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
  }

  global.Dates = {
    WEEKDAYS, todayISO, toISO, fromISO,
    addDays, isSameISO, startOfMonthISO, endOfMonthISO,
    monthMatrix, monthLabel
  };
})(window);
