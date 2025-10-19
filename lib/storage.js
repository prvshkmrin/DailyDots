/* storage.js — simple localStorage wrapper */

(function (global) {
  const KEY = "habitDotsData_v1";

  const defaultData = () => ({
    habits: [],                // [{id, name, emoji, color, createdAt}]
    records: {},               // { [habitId]: [ISO, ...] }
    settings: { firstDayMonday: false, showTodayOnly: false }
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultData();
      const data = JSON.parse(raw);
      data.habits ||= [];
      data.records ||= {};
      data.settings ||= { firstDayMonday:false, showTodayOnly:false };
      return data;
    } catch {
      return defaultData();
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(load(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `habit-dots-${Dates.todayISO()}.json`;
    a.click();
  }

  function importJSON(file, onDone, onError) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        save(obj);
        onDone && onDone(obj);
      } catch (e) {
        onError && onError(e);
      }
    };
    reader.onerror = () => onError && onError(reader.error);
    reader.readAsText(file);
  }

  function clearAll() { localStorage.removeItem(KEY); }

  global.Store = { load, save, exportJSON, importJSON, clearAll, KEY };
})(window);
