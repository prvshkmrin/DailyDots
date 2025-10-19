// Habit Dots — main app (rendering, interactions, state)

(function () {
  // --- State ---
  let data = Store.load();
  const state = {
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(), // 0-11
  };

  // --- DOM refs ---
  const habitsWrap = document.getElementById("habitsWrap");
  const emptyState = document.getElementById("emptyState");

  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const thisMonthBtn = document.getElementById("thisMonth");
  const monthLabel = document.getElementById("monthLabel");
  const todayFilter = document.getElementById("todayFilter");

  const addForm = document.getElementById("addForm");
  const nameInput = document.getElementById("habitName");
  const emojiInput = document.getElementById("habitEmoji");
  const colorInput = document.getElementById("habitColor");

  const exportBtn = document.getElementById("exportBtn");
  const importInput = document.getElementById("importInput");
  const clearAllBtn = document.getElementById("clearAll");

  // --- Init UI ---
  todayFilter.checked = !!data.settings.showTodayOnly;
  render();

  // --- Handlers ---
  prevMonthBtn.addEventListener("click", () => {
    const m = state.viewMonth - 1;
    state.viewMonth = (m + 12) % 12;
    if (m < 0) state.viewYear--;
    render();
  });
  nextMonthBtn.addEventListener("click", () => {
    const m = state.viewMonth + 1;
    state.viewMonth = m % 12;
    if (m > 11) state.viewYear++;
    render();
  });
  thisMonthBtn.addEventListener("click", () => {
    const now = new Date();
    state.viewYear = now.getFullYear();
    state.viewMonth = now.getMonth();
    render();
  });

  todayFilter.addEventListener("change", () => {
    data.settings.showTodayOnly = todayFilter.checked;
    Store.save(data);
    render();
  });

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) return;
    const emoji = emojiInput.value.trim();
    const color = colorInput.value || "#60a5fa";
    const id = "h" + Math.random().toString(36).slice(2, 8);
    data.habits.push({ id, name, emoji, color, createdAt: Dates.todayISO() });
    data.records[id] = [];
    Store.save(data);
    nameInput.value = "";
    emojiInput.value = "";
    render();
  });

  exportBtn.addEventListener("click", () => Store.exportJSON());
  importInput.addEventListener("change", () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;
    Store.importJSON(file, (obj) => { data = obj; render(); alert("Import successful."); },
      (err) => alert("Import failed: " + err));
    importInput.value = "";
  });

  clearAllBtn.addEventListener("click", () => {
    if (!confirm("Clear all Habit Dots data? This cannot be undone.")) return;
    Store.clearAll();
    data = Store.load();
    render();
  });

  // --- Render ---
  function render() {
    monthLabel.textContent = Dates.monthLabel(state.viewYear, state.viewMonth);
    habitsWrap.innerHTML = "";
    emptyState.hidden = data.habits.length !== 0;

    const matrix = Dates.monthMatrix(state.viewYear, state.viewMonth, data.settings.firstDayMonday);
    const today = Dates.todayISO();
    const todayColISO = today;

    // Weekday header (same for all)
    const header = document.createElement("div");
    header.className = "grid";
    Dates.WEEKDAYS.forEach(d => {
      const el = document.createElement("div");
      el.className = "weekday";
      el.textContent = d;
      header.appendChild(el);
    });

    data.habits.forEach(h => {
      const card = document.createElement("article");
      card.className = "habit-card";

      const head = document.createElement("div");
      head.className = "habit-head";

      const title = document.createElement("div");
      title.className = "habit-title";
      const indicator = document.createElement("span");
      indicator.style.width = "14px";
      indicator.style.height = "14px";
      indicator.style.borderRadius = "999px";
      indicator.style.background = h.color || "#60a5fa";

      const name = document.createElement("span");
      name.textContent = `${h.emoji ? h.emoji + " " : ""}${h.name}`;
      title.append(indicator, name);

      const badges = document.createElement("div");
      badges.className = "habit-badges";
      const recSet = new Set(data.records[h.id] || []);
      const cur = Streaks.currentStreak(recSet, today);
      const best = Streaks.bestStreak(recSet);
      badges.innerHTML = `<span>Current: <strong>${cur}</strong></span><span>Best: <strong>${best}</strong></span>`;

      const actions = document.createElement("div");
      actions.className = "habit-actions";
      const editBtn = btn("Edit");
      const delBtn = btn("Delete");
      actions.append(editBtn, delBtn);

      editBtn.addEventListener("click", () => editHabit(h));
      delBtn.addEventListener("click", () => deleteHabit(h));

      head.append(title, badges, actions);
      card.appendChild(head);

      // Weekday header
      card.appendChild(header.cloneNode(true));

      // Calendar grid
      const grid = document.createElement("div");
      grid.className = "grid";

      matrix.forEach(iso => {
        const cell = document.createElement("div");
        cell.className = "cell";
        // Dim out days not in current month
        const inMonth = iso >= Dates.startOfMonthISO(state.viewYear, state.viewMonth) &&
                        iso <= Dates.endOfMonthISO(state.viewYear, state.viewMonth);
        if (!inMonth) cell.classList.add("dim");
        if (iso === today) cell.classList.add("today");

        const done = recSet.has(iso);
        if (done) cell.classList.add("done");

        // label: day number
        cell.textContent = (new Date(iso)).getDate();

        // click to toggle
        cell.addEventListener("click", () => {
          toggleRecord(h.id, iso);
        });

        // filter: show only today's pending
        if (data.settings.showTodayOnly) {
          const isTodayCol = iso === todayColISO;
          const shouldShow = (isTodayCol && !done) || (!isTodayCol && false);
          cell.style.display = shouldShow ? "" : "none";
        }

        grid.appendChild(cell);
      });

      card.appendChild(grid);
      habitsWrap.appendChild(card);
    });
  }

  function toggleRecord(habitId, iso) {
    const arr = data.records[habitId] || (data.records[habitId] = []);
    const idx = arr.indexOf(iso);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(iso);
    Store.save(data);
    render();
  }

  function editHabit(h) {
    const newName = prompt("Habit name:", h.name);
    if (newName === null) return;
    const newEmoji = prompt("Emoji (optional):", h.emoji || "");
    const newColor = prompt("Hex color (#RRGGBB):", h.color || "#60a5fa");
    h.name = newName.trim() || h.name;
    h.emoji = (newEmoji || "").trim();
    if (/^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(newColor)) h.color = newColor;
    Store.save(data);
    render();
  }

  function deleteHabit(h) {
    if (!confirm(`Delete "${h.name}" and all its records?`)) return;
    data.habits = data.habits.filter(x => x.id !== h.id);
    delete data.records[h.id];
    Store.save(data);
    render();
  }

  function btn(text) {
    const b = document.createElement("button");
    b.textContent = text;
    return b;
  }
})();
