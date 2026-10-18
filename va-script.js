// ===== Schedule Management: interactive month calendar with event editor =====
// Everything here lives only in this page's memory — it resets on reload and
// never sends or saves data anywhere. It's a demo of the scheduling experience.
(function initCalendar(){
  const grid = document.getElementById('calGrid');
  const monthLabel = document.getElementById('calMonthLabel');
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');
  const editor = document.getElementById('calEditor');
  const editorDate = document.getElementById('calEditorDate');
  const titleInput = document.getElementById('calEventTitle');
  const timeInput = document.getElementById('calEventTime');
  const priorityInput = document.getElementById('calEventPriority');
  const saveBtn = document.getElementById('calSaveBtn');
  const deleteBtn = document.getElementById('calDeleteBtn');
  const closeBtn = document.getElementById('calEditorClose');
  const selectedBox = document.getElementById('calSelected');
  if (!grid || !editor) return;

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayLabels = ['S','M','T','W','T','F','S'];

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let activeKey = null;

  const events = {}; // { "YYYY-MM-DD": { title, time, priority } }

  function dateKey(y, m, d){
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  function seed(day, title, time, priority){
    events[dateKey(viewYear, viewMonth, day)] = { title, time, priority };
  }
  // A couple of sample bookings so the calendar isn't empty on first load
  seed(Math.min(6, 27), 'Content calendar review', '13:00', false);
  seed(Math.min(12, 27), 'Client onboarding call', '09:00', true);
  seed(Math.min(20, 27), 'Ad creative approval', '15:00', false);

  function formatTime(t){
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  function render(){
    grid.innerHTML = '';
    monthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;

    dayLabels.forEach(l => {
      const cell = document.createElement('div');
      cell.className = 'cal-day cal-label';
      cell.textContent = l;
      grid.appendChild(cell);
    });

    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstWeekday; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day cal-empty';
      grid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = dateKey(viewYear, viewMonth, day);
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = day;

      const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
      if (isToday) cell.classList.add('is-today');
      if (events[key]) {
        cell.classList.add('has-event');
        if (events[key].priority) cell.classList.add('is-priority');
      }
      if (key === activeKey) cell.classList.add('is-selected');

      cell.addEventListener('click', () => openEditor(key, day));
      grid.appendChild(cell);
    }
  }

  function openEditor(key, day){
    activeKey = key;
    render();
    editor.hidden = false;
    editorDate.textContent = `${monthNames[viewMonth]} ${day}`;

    const existing = events[key];
    if (existing) {
      titleInput.value = existing.title || '';
      timeInput.value = existing.time || '';
      priorityInput.checked = !!existing.priority;
      deleteBtn.style.display = 'inline-flex';
    } else {
      titleInput.value = '';
      timeInput.value = '';
      priorityInput.checked = false;
      deleteBtn.style.display = 'none';
    }
    titleInput.style.borderColor = '';
    titleInput.focus();
    updateSummary(key);
  }

  function updateSummary(key){
    const ev = events[key];
    if (!ev) { selectedBox.textContent = 'No event saved for this day yet.'; return; }
    const parts = [];
    if (ev.time) parts.push(formatTime(ev.time));
    parts.push(ev.title || 'Untitled event');
    if (ev.priority) parts.push('★ Priority day');
    selectedBox.innerHTML = `<strong>Saved:</strong> ${parts.join(' · ')}`;
  }

  saveBtn.addEventListener('click', () => {
    if (!activeKey) return;
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.style.borderColor = 'var(--accent)';
      titleInput.focus();
      return;
    }
    events[activeKey] = { title, time: timeInput.value, priority: priorityInput.checked };
    render();
    updateSummary(activeKey);
    editor.hidden = true;
  });

  deleteBtn.addEventListener('click', () => {
    if (!activeKey) return;
    delete events[activeKey];
    render();
    selectedBox.textContent = 'Event removed.';
    editor.hidden = true;
  });

  closeBtn.addEventListener('click', () => { editor.hidden = true; });

  prevBtn.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    editor.hidden = true;
    render();
  });
  nextBtn.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    editor.hidden = true;
    render();
  });

  render();
})();

// ===== Creating Ads: front/mid/back card slideshow =====
(function initAdStack(){
  const stack = document.getElementById('adStack');
  if (!stack) return;
  const cards = [...stack.querySelectorAll('.ad-card')];
  const order = ['is-front', 'is-mid', 'is-back'];
  let rotation = 0;

  function paint(){
    cards.forEach((card, i) => {
      card.classList.remove('is-front', 'is-mid', 'is-back');
      const pos = (i + rotation) % cards.length;
      card.classList.add(order[pos]);
    });
  }
  function next(){
    rotation = (rotation + 1) % cards.length;
    paint();
  }
  paint();
  stack.addEventListener('click', next);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    setInterval(next, 3200);
  }
})();

// ===== Editing Videos: timeline playhead scrub =====
(function initTimeline(){
  const track = document.getElementById('timelineTrack');
  const playBtn = document.querySelector('.timeline-play');
  if (!track || !playBtn) return;

  const playhead = document.createElement('div');
  playhead.className = 'timeline-playhead';
  track.appendChild(playhead);

  let playing = false;
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.textContent = playing ? '❚❚' : '▶';
    if (playing) {
      playhead.style.transition = 'none';
      playhead.style.left = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          playhead.style.transition = 'left 6s linear';
          playhead.style.left = '100%';
        });
      });
      setTimeout(() => {
        playing = false;
        playBtn.textContent = '▶';
      }, 6000);
    } else {
      const currentLeft = getComputedStyle(playhead).left;
      playhead.style.transition = 'none';
      playhead.style.left = currentLeft;
    }
  });
})();
