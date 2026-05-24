'use strict';

/* =============================================================
   PLANT TRACKER — app.js  (full rewrite, event delegation)
   ============================================================= */

// ───── CONFIG ─────
const CFG = {
  lat: 51.7592, lon: 19.4560, city: 'Łódź Górna',
  STORE: 'plantTracker_v3'
};

// ───── ICONS helper ─────
function icon(name, size = 16) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center"></i>`;
}
function renderIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// ───── STATE ─────
const S = {
  plants: [], events: [], scheduled: [], aiForecasts: {},
  view: 'home', locationFilter: 'all', timelineFilter: 'all',
  calMonth: new Date(), selectedDate: new Date(),
  editingPlantId: null, waterPlantId: null, harvestPlantId: null,
  schedType: 'water',
  charts: {}
};

// ───── STORAGE ─────
function save() {
  try {
    localStorage.setItem(CFG.STORE, JSON.stringify({
      plants: S.plants, events: S.events,
      scheduled: S.scheduled, aiForecasts: S.aiForecasts
    }));
  } catch(e) { console.error(e); }
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(CFG.STORE) || '{}');
    S.plants     = d.plants     || [];
    S.events     = d.events     || [];
    S.scheduled  = d.scheduled  || [];
    S.aiForecasts = d.aiForecasts || {};
  } catch(e) { console.error(e); }
}

// ───── HELPERS ─────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('pl-PL', { day:'numeric', month:'short', year:'numeric' });
}
function fmtDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('pl-PL', { day:'numeric', month:'short' }) + ' ' +
         d.toLocaleTimeString('pl-PL', { hour:'2-digit', minute:'2-digit' });
}
function daysAgo(ts) {
  if (!ts) return null;
  return Math.floor((Date.now() - new Date(ts)) / 86400000);
}
function daysUntil(ts) {
  if (!ts) return null;
  return Math.ceil((new Date(ts) - Date.now()) / 86400000);
}
function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
function sameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
         da.getMonth() === db.getMonth() &&
         da.getDate() === db.getDate();
}
function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function toast(msg, err = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (err ? ' error' : '');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.add('hidden'), 2800);
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  renderIcons();
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// ───── SERVICE WORKER ─────
async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('./sw.js');
  } catch(e) { console.warn('SW:', e); }
}

// ───── NOTIFICATIONS ─────
async function requestNotifPermission() {
  if (!('Notification' in window)) { toast('Powiadomienia nieobsługiwane', true); return; }
  const p = await Notification.requestPermission();
  if (p === 'granted') {
    document.getElementById('notif-dot').classList.add('hidden');
    toast('✓ Powiadomienia włączone');
  } else {
    toast('Powiadomienia zablokowane', true);
  }
}

function scheduleNotif(title, body, delayMs) {
  if (Notification.permission !== 'granted') return;
  setTimeout(() => new Notification(title, { body, icon: './icons/icon-192.png' }), delayMs);
}

function checkScheduled() {
  const now = Date.now();
  S.scheduled.forEach(ev => {
    if (ev.notified || !ev.datetime) return;
    const diff = new Date(ev.datetime) - now;
    if (diff > 0 && diff < 86400000) {
      const plant = S.plants.find(p => p.id === ev.plantId);
      const pName = plant ? plant.name : 'Roślina';
      const labels = { water: 'Podlej', fertilize: 'Nawóź', harvest: 'Zbierz' };
      scheduleNotif(`${labels[ev.type] || 'Akcja'}: ${pName}`, fmtDateTime(ev.datetime), diff);
      ev.notified = true;
      save();
    }
  });
}



// ───── PREDICTION ─────
function predict(plant) {
  if (S.aiForecasts[plant.id]) return S.aiForecasts[plant.id];

  const waters = S.events.filter(e =>
    e.plantId === plant.id && (e.type === 'water' || e.type === 'fertilize')
  ).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (waters.length === 0) {
    if (plant.waterFreq && plant.planted) {
      return { nextDate: addDays(plant.planted, plant.waterFreq).toISOString(), freq: plant.waterFreq, source: 'default' };
    }
    return null;
  }

  const recent = waters.slice(-5);
  const intervals = [];
  for (let i = 1; i < recent.length; i++) {
    intervals.push((new Date(recent[i].timestamp) - new Date(recent[i-1].timestamp)) / 86400000);
  }
  const avgInterval = intervals.length
    ? Math.round(intervals.reduce((a,b) => a+b,0) / intervals.length)
    : (plant.waterFreq || 7);

  const last = new Date(recent[recent.length-1].timestamp);
  return {
    nextDate: addDays(last, avgInterval).toISOString(),
    freq: avgInterval,
    source: 'algorithm',
    conf: intervals.length >= 3 ? 'wysokie' : intervals.length >= 1 ? 'średnie' : 'niskie'
  };
}

function lastEvent(plantId, types) {
  return S.events.filter(e => e.plantId === plantId && types.includes(e.type))
    .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;
}

function plantEmoji(name) {
  const n = (name||'').toLowerCase();
  if (n.includes('pomidor')||n.includes('tomat')) return 'cherry';
  if (n.includes('papryka')) return 'flame';
  if (n.includes('bazylia')||n.includes('zioł')) return 'leaf';
  if (n.includes('monstera')||n.includes('fikus')) return 'leaf';
  if (n.includes('kaktus')||n.includes('sukulent')) return 'mountain';
  if (n.includes('orchidea')||n.includes('storczyk')) return 'sparkles';
  if (n.includes('lawend')) return 'flower-2';
  if (n.includes('rozmaryn')) return 'leaf';
  return 'sprout';
}

// ───── PLANTS ─────
function renderPlants() {
  const grid = document.getElementById('plants-grid');
  const empty = document.getElementById('empty-plants');
  const filter = S.locationFilter;

  let plants = filter === 'all' ? S.plants : S.plants.filter(p => p.location === filter);

  if (plants.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    renderIcons();
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = plants.map(p => {
    const pred = predict(p);
    const lastW = lastEvent(p.id, ['water','fertilize']);
    const ago = lastW ? daysAgo(lastW.timestamp) : null;
    let urgCls = '', urgTxt = '';
    if (pred) {
      const u = daysUntil(pred.nextDate);
      if (u <= 0)    { urgCls = 'urgent'; urgTxt = 'Podlej!'; }
      else if (u===1){ urgCls = 'soon';   urgTxt = 'Jutro'; }
      else            { urgCls = 'ok';     urgTxt = `Za ${u}d`; }
    }
    const imgHtml = p.photo
      ? `<img class="plant-img" src="${p.photo}" alt="${p.name}" loading="lazy" />`
      : `<div class="plant-placeholder">${icon(plantEmoji(p.name), 44)}</div>`;
    const locLabel = p.location === 'balkon' ? 'Balkon' : 'Parapet';
    const locIco = p.location === 'balkon' ? 'sun' : 'layout-panel-left';

    return `<div class="plant-card" data-plant-id="${p.id}">
      ${imgHtml}
      ${urgTxt ? `<div class="predict-badge">${urgTxt}</div>` : ''}
      <div class="plant-body">
        <div class="plant-name">${p.name}</div>
        ${p.species ? `<div class="plant-species">${p.species}</div>` : ''}
        <div class="plant-meta">
          <span class="loc-badge">${icon(locIco,10)} ${locLabel}</span>
          ${ago!==null ? `<span class="next-water ${urgCls}">💧 ${ago===0?'Dziś':ago+'d temu'}</span>` : ''}
        </div>
      </div>
      <div class="plant-actions">
        <button class="plant-btn water"    data-action="water"     title="Podlej">${icon('droplets',16)}</button>
        <button class="plant-btn fertilize" data-action="fertilize" title="Nawóź">${icon('flask-conical',16)}</button>
        <button class="plant-btn harvest"  data-action="harvest"   title="Zbiory">${icon('apple',16)}</button>
      </div>
    </div>`;
  }).join('');

  renderIcons();
}

// ───── PLANT MODAL ─────
function openPlantModal(editId = null) {
  S.editingPlantId = editId;
  document.getElementById('modal-plant-title').textContent = editId ? 'Edytuj roślinę' : 'Nowa roślina';

  const nameEl    = document.getElementById('plant-name');
  const speciesEl = document.getElementById('plant-species');
  const plantedEl = document.getElementById('plant-planted');
  const freqEl    = document.getElementById('plant-water-freq');
  const notesEl   = document.getElementById('plant-notes');
  const preview   = document.getElementById('plant-photo-preview');

  // Reset
  nameEl.value = ''; speciesEl.value = ''; notesEl.value = ''; freqEl.value = 7;
  plantedEl.value = new Date().toISOString().split('T')[0];
  preview.innerHTML = `${icon('image',32)}<span>Dodaj zdjęcie</span>`;
  setGroupActive('location-group', 'balkon');

  if (editId) {
    const p = S.plants.find(x => x.id === editId);
    if (!p) return;
    nameEl.value    = p.name    || '';
    speciesEl.value = p.species || '';
    plantedEl.value = p.planted || '';
    freqEl.value    = p.waterFreq || 7;
    notesEl.value   = p.notes  || '';
    if (p.photo) preview.innerHTML = `<img src="${p.photo}" />`;
    setGroupActive('location-group', p.location || 'balkon');
  }

  openModal('modal-plant');
}

function savePlant() {
  const name = document.getElementById('plant-name').value.trim();
  if (!name) { toast('Podaj nazwę rośliny', true); return; }

  const locBtn = document.querySelector('#location-group .btn-toggle.active');
  const location = locBtn ? locBtn.dataset.value : 'balkon';
  const preview = document.getElementById('plant-photo-preview');
  const photo = preview.querySelector('img')?.src || null;

  const plant = {
    id: S.editingPlantId || uid(),
    name,
    species:   document.getElementById('plant-species').value.trim(),
    location,
    planted:   document.getElementById('plant-planted').value,
    waterFreq: parseInt(document.getElementById('plant-water-freq').value) || 7,
    notes:     document.getElementById('plant-notes').value.trim(),
    photo,
    createdAt: new Date().toISOString()
  };

  if (S.editingPlantId) {
    const idx = S.plants.findIndex(p => p.id === S.editingPlantId);
    S.plants[idx] = { ...S.plants[idx], ...plant };
    toast('✓ Roślina zaktualizowana');
  } else {
    S.plants.push(plant);
    S.events.push({
      id: uid(), plantId: plant.id, type: 'plant',
      timestamp: plant.planted ? new Date(plant.planted).toISOString() : new Date().toISOString(),
      notes: 'Posadzenie'
    });
    toast('🌿 Roślina dodana!');
  }

  save();
  closeModal('modal-plant');
  renderPlants();
  updateStats();
}

// ───── WATER MODAL ─────
function openWaterModal(plantId, type = 'water') {
  S.waterPlantId = plantId;
  const p = S.plants.find(x => x.id === plantId);
  if (!p) return;

  document.getElementById('modal-water-title').textContent = type === 'fertilize' ? 'Nawożenie' : 'Podlewanie';
  document.getElementById('water-plant-badge').textContent = p.name;
  document.getElementById('water-date').value = nowLocal();
  document.getElementById('water-amount').value = '';
  document.getElementById('water-notes').value = '';
  document.getElementById('fertilizer-name').value = '';

  setGroupActive('water-type-group', type);
  document.getElementById('fertilizer-group').classList.toggle('hidden', type !== 'fertilize');

  openModal('modal-water');
}

function saveWatering() {
  const typeBtn = document.querySelector('#water-type-group .btn-toggle.active');
  const type = typeBtn ? typeBtn.dataset.value : 'water';
  const dateVal = document.getElementById('water-date').value;
  if (!dateVal) { toast('Podaj datę', true); return; }

  S.events.push({
    id: uid(), plantId: S.waterPlantId, type,
    timestamp: new Date(dateVal).toISOString(),
    amount: parseInt(document.getElementById('water-amount').value) || null,
    fertilizer: type === 'fertilize' ? document.getElementById('fertilizer-name').value.trim() || null : null,
    notes: document.getElementById('water-notes').value.trim()
  });

  save();
  closeModal('modal-water');
  renderPlants();
  renderTimeline();
  updateStats();
  toast(type === 'fertilize' ? '🌱 Nawożenie zapisane!' : '💧 Podlewanie zapisane!');
}

// ───── HARVEST MODAL ─────
function openHarvestModal(plantId) {
  S.harvestPlantId = plantId;
  const p = S.plants.find(x => x.id === plantId);
  if (!p) return;

  document.getElementById('harvest-plant-badge').textContent = p.name;
  document.getElementById('harvest-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('harvest-quantity').value = '';
  document.getElementById('harvest-weight').value = '';
  document.getElementById('harvest-notes').value = '';
  document.getElementById('harvest-photo-preview').innerHTML = `${icon('camera',32)}<span>Dodaj zdjęcie zbiorów</span>`;

  openModal('modal-harvest');
}

function saveHarvest() {
  const dateVal = document.getElementById('harvest-date').value;
  if (!dateVal) { toast('Podaj datę zbioru', true); return; }

  const preview = document.getElementById('harvest-photo-preview');
  const photo = preview.querySelector('img')?.src || null;

  S.events.push({
    id: uid(), plantId: S.harvestPlantId, type: 'harvest',
    timestamp: new Date(dateVal).toISOString(),
    quantity: parseInt(document.getElementById('harvest-quantity').value) || null,
    weight: parseFloat(document.getElementById('harvest-weight').value) || null,
    photo,
    notes: document.getElementById('harvest-notes').value.trim()
  });

  save();
  closeModal('modal-harvest');
  renderPlants();
  renderTimeline();
  updateStats();
  toast('🍅 Zbiory zapisane!');
}

// ───── PLANT DETAIL ─────
function openPlantDetail(plantId) {
  const p = S.plants.find(x => x.id === plantId);
  if (!p) return;

  const pred = predict(p);
  const history = S.events.filter(e => e.plantId === plantId)
    .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  const harvests = history.filter(e => e.type === 'harvest');
  const totalKg  = harvests.reduce((s,e) => s + (e.weight||0), 0);
  const totalQty = harvests.reduce((s,e) => s + (e.quantity||0), 0);

  const imgHtml = p.photo
    ? `<img class="detail-img" src="${p.photo}" alt="${p.name}" />`
    : `<div class="detail-placeholder">${icon(plantEmoji(p.name), 40)}</div>`;

  const typeIco  = { water:'droplets', fertilize:'flask-conical', harvest:'apple', plant:'sprout' };
  const typeLabel= { water:'Podlewanie', fertilize:'Nawożenie', harvest:'Zbiory', plant:'Posadzenie' };
  const typeCls  = { water:'water', fertilize:'fertilize', harvest:'harvest', plant:'plant' };

  document.getElementById('detail-title').textContent = p.name;
  document.getElementById('modal-detail-body').innerHTML = `
    <div class="detail-header">
      ${imgHtml}
      <div>
        <div class="detail-name">${p.name}</div>
        ${p.species ? `<div class="detail-species">${p.species}</div>` : ''}
        <div class="detail-badges">
          <span class="detail-badge">${icon(p.location==='balkon'?'sun':'layout-panel-left',11)} ${p.location==='balkon'?'Balkon':'Parapet'}</span>
          ${p.planted ? `<span class="detail-badge">${icon('calendar',11)} ${fmtDate(p.planted)}</span>` : ''}
          <span class="detail-badge">${icon('droplets',11)} co ${p.waterFreq||7}d</span>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <button class="detail-action-btn water"     data-detail-action="water"     data-pid="${p.id}">${icon('droplets',14)} Podlej</button>
      <button class="detail-action-btn fertilize" data-detail-action="fertilize" data-pid="${p.id}">${icon('flask-conical',14)} Nawóź</button>
      <button class="detail-action-btn harvest"   data-detail-action="harvest"   data-pid="${p.id}">${icon('apple',14)} Zbiory</button>
      <button class="detail-action-btn danger"    data-detail-action="delete"    data-pid="${p.id}">${icon('trash-2',14)}</button>
    </div>

    ${pred ? `
    <div class="predict-card">
      <h5>${icon('clock',13)} Predykcja podlewania</h5>
      <p>Następne: <strong>${fmtDate(pred.nextDate)}</strong> (co ~${pred.freq} dni)</p>
      <p class="src">Źródło: ${pred.source==='ai'?icon('sparkles',11)+' AI Forecast':pred.source==='algorithm'?icon('bar-chart-2',11)+' Algorytm (pewność: '+pred.conf+')':icon('settings',11)+' Domyślne'}</p>
    </div>` : ''}

    ${harvests.length > 0 ? `
    <div class="detail-section" style="margin-bottom:14px">
      <h5>Plony łącznie</h5>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="stat-card"><div class="stat-icon harvest-color">${icon('scale',20)}</div><div class="stat-value">${totalKg.toFixed(2)}<small style="font-size:12px"> kg</small></div><div class="stat-label">Waga</div></div>
        <div class="stat-card"><div class="stat-icon harvest-color">${icon('hash',20)}</div><div class="stat-value">${totalQty}</div><div class="stat-label">Sztuki</div></div>
      </div>
    </div>` : ''}

    <div class="detail-section">
      <h5>Historia (${history.length})</h5>
      ${history.slice(0,15).map(ev => {
        const tCls = typeCls[ev.type] || 'plant';
        let detail = '';
        if (ev.amount) detail += `${ev.amount} ml`;
        if (ev.fertilizer) detail += (detail?' · ':'')+ev.fertilizer;
        if (ev.weight) detail += (detail?' · ':'')+ev.weight+' kg';
        if (ev.quantity) detail += (detail?' · ':'')+ev.quantity+' szt.';
        if (ev.notes) detail += (detail?' · ':'')+ev.notes;
        return `<div class="history-item">
          <div class="history-icon ${tCls}">${icon(typeIco[ev.type]||'circle',14)}</div>
          <div class="history-text">
            <div class="history-title">${typeLabel[ev.type]||ev.type}</div>
            ${detail?`<div class="history-detail">${detail}</div>`:''}
          </div>
          <span class="history-time">${fmtDateTime(ev.timestamp)}</span>
        </div>`;
      }).join('')}
      ${history.length===0?'<div style="color:var(--text3);font-size:13px">Brak historii</div>':''}
    </div>

    ${p.notes ? `<div class="detail-section"><h5>Notatki</h5><p style="font-size:14px;color:var(--text2)">${p.notes}</p></div>` : ''}

    <button class="btn-secondary" style="width:100%" data-detail-action="edit" data-pid="${p.id}">
      ${icon('pencil',14)} Edytuj roślinę
    </button>
  `;

  openModal('modal-detail');
}

function deletePlant(plantId) {
  if (!confirm('Usunąć roślinę? Tej operacji nie można cofnąć.')) return;
  S.plants  = S.plants.filter(p => p.id !== plantId);
  S.events  = S.events.filter(e => e.plantId !== plantId);
  delete S.aiForecasts[plantId];
  save();
  closeModal('modal-detail');
  renderPlants();
  renderTimeline();
  updateStats();
  toast('Roślina usunięta');
}

// ───── TIMELINE ─────
function renderTimeline() {
  const el = document.getElementById('timeline-container');
  const f  = S.timelineFilter;
  let evs  = [...S.events].sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp));
  if (f !== 'all') evs = evs.filter(e => e.type === f);

  if (evs.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('clock',56)}</div><p>Brak zdarzeń</p><span>Podlej rośliny lub dodaj zbiory</span></div>`;
    renderIcons();
    return;
  }

  const typeIco   = { water:'droplets', fertilize:'flask-conical', harvest:'apple', plant:'sprout' };
  const typeLabel = { water:'Podlewanie', fertilize:'Nawożenie', harvest:'Zbiory', plant:'Posadzenie' };

  el.innerHTML = evs.map(ev => {
    const plant = S.plants.find(p => p.id === ev.plantId);
    const pName = plant ? plant.name : 'Nieznana roślina';
    let detail = '';
    if (ev.amount) detail += `${ev.amount} ml`;
    if (ev.fertilizer) detail += (detail?' · ':'')+ev.fertilizer;
    if (ev.weight) detail += (detail?' · ':'')+ev.weight+' kg';
    if (ev.quantity) detail += (detail?' · ':'')+ev.quantity+' szt.';
    if (ev.notes) detail += (detail?' · ':'')+ev.notes;

    return `<div class="tl-item">
      <div class="tl-dot ${ev.type}">${icon(typeIco[ev.type]||'circle',10)}</div>
      <div class="tl-card">
        <div class="tl-head">
          <span class="tl-title">${typeLabel[ev.type]||ev.type}</span>
          <span class="tl-time">${fmtDateTime(ev.timestamp)}</span>
        </div>
        <div class="tl-plant">${icon('leaf',12)} ${pName}</div>
        ${detail ? `<div class="tl-detail">${detail}</div>` : ''}
        ${ev.photo ? `<img class="tl-photo" src="${ev.photo}" alt="" />` : ''}
      </div>
    </div>`;
  }).join('');

  renderIcons();
}

// ───── CALENDAR ─────
function renderCalendar() {
  const widget = document.getElementById('calendar-widget');
  const month  = S.calMonth;
  const today  = new Date();

  const first  = new Date(month.getFullYear(), month.getMonth(), 1);
  const last   = new Date(month.getFullYear(), month.getMonth()+1, 0);
  let startDow = first.getDay(); if (startDow===0) startDow=7; startDow--;

  const mNames = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
    'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
  const dNames = ['Pn','Wt','Śr','Cz','Pt','Sb','Nd'];

  const cells = [];
  for (let i=0;i<startDow;i++) {
    const d=new Date(first); d.setDate(d.getDate()-(startDow-i));
    cells.push({date:d,other:true});
  }
  for (let i=1;i<=last.getDate();i++) cells.push({date:new Date(month.getFullYear(),month.getMonth(),i),other:false});
  const rem=42-cells.length;
  for (let i=1;i<=rem;i++) { const d=new Date(last); d.setDate(d.getDate()+i); cells.push({date:d,other:true}); }

  function dotsForDay(date) {
    const types = new Set([
      ...S.events.filter(e => sameDay(e.timestamp,date)).map(e=>e.type),
      ...S.scheduled.filter(e => e.date && sameDay(e.date,date)).map(e=>e.type)
    ]);
    return [...types].slice(0,3).map(t=>`<div class="cal-dot ${t}"></div>`).join('');
  }

  widget.innerHTML = `
    <div class="cal-head">
      <span class="cal-month">${mNames[month.getMonth()]} ${month.getFullYear()}</span>
      <div class="cal-nav">
        <button class="cal-nav-btn" id="cal-prev">${icon('chevron-left',16)}</button>
        <button class="cal-nav-btn" id="cal-next">${icon('chevron-right',16)}</button>
      </div>
    </div>
    <div class="cal-day-names">${dNames.map(d=>`<div class="cal-dn">${d}</div>`).join('')}</div>
    <div class="cal-grid">
      ${cells.map(cell => {
        const isToday    = sameDay(cell.date, today);
        const isSelected = sameDay(cell.date, S.selectedDate);
        const dots = dotsForDay(cell.date);
        return `<div class="cal-cell${cell.other?' other-month':''}${isToday&&!isSelected?' today':''}${isSelected?' selected':''}"
          data-cal-date="${cell.date.toISOString()}">
          ${cell.date.getDate()}
          ${dots ? `<div class="cal-dots">${dots}</div>` : ''}
        </div>`;
      }).join('')}
    </div>
  `;

  document.getElementById('cal-prev').addEventListener('click', () => {
    S.calMonth = new Date(month.getFullYear(), month.getMonth()-1, 1);
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    S.calMonth = new Date(month.getFullYear(), month.getMonth()+1, 1);
    renderCalendar();
  });

  widget.querySelectorAll('.cal-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      S.selectedDate = new Date(cell.dataset.calDate);
      renderCalendar();
      renderCalEvents();
    });
  });

  renderIcons();
  renderCalEvents();
}

function renderCalEvents() {
  const el   = document.getElementById('calendar-events');
  const date = S.selectedDate;

  const dayEvs = S.events.filter(e => sameDay(e.timestamp, date));
  const scheEvs = S.scheduled.filter(e => e.date && sameDay(e.date, date));
  const all = [...dayEvs, ...scheEvs].sort((a,b) =>
    new Date(a.timestamp||a.date) - new Date(b.timestamp||b.date)
  );

  const typeIco   = { water:'droplets', fertilize:'flask-conical', harvest:'apple', plant:'sprout' };
  const typeLabel = { water:'Podlewanie', fertilize:'Nawożenie', harvest:'Zbiory', plant:'Posadzenie' };
  const typeCls   = { water:'water', fertilize:'fertilize', harvest:'harvest', plant:'plant' };

  const ds = date.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'});

  el.innerHTML = `
    <div style="font-size:13px;font-weight:600;color:var(--text2);margin-bottom:8px;text-transform:capitalize">${ds}</div>
    ${all.length===0 ? '<div style="color:var(--text3);font-size:13px;padding:8px 0">Brak zdarzeń w tym dniu</div>' :
      all.map(ev => {
        const plant = S.plants.find(p=>p.id===ev.plantId);
        const pName = plant ? plant.name : '—';
        const isSched = !ev.timestamp || !ev.timestamp.includes('T');
        const cls = typeCls[ev.type]||'water';
        return `<div class="cal-ev-item">
          <div class="cal-ev-icon ${cls}">${icon(typeIco[ev.type]||'circle',18)}</div>
          <div class="cal-ev-info">
            <div class="cal-ev-title">${typeLabel[ev.type]||ev.type}</div>
            <div class="cal-ev-sub">${pName}${isSched?' · Zaplanowane':''}</div>
          </div>
          ${isSched ? `<button class="cal-ev-del" data-sched-del="${ev.id}" title="Usuń">${icon('trash-2',14)}</button>` : ''}
        </div>`;
      }).join('')
    }
  `;

  el.querySelectorAll('[data-sched-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.scheduled = S.scheduled.filter(e => e.id !== btn.dataset.schedDel);
      save();
      renderCalendar();
      toast('Zdarzenie usunięte');
    });
  });

  renderIcons();
}

// ───── SCHEDULE MODAL ─────
function openScheduleModal() {
  if (S.plants.length === 0) { toast('Najpierw dodaj rośliny', true); return; }
  const sel = document.getElementById('sched-plant');
  sel.innerHTML = S.plants.map(p => `<option value="${p.id}">${p.name} (${p.location})</option>`).join('');

  const tmr = new Date(); tmr.setDate(tmr.getDate()+1);
  document.getElementById('sched-date').value = tmr.toISOString().split('T')[0];
  document.getElementById('sched-time').value = '08:00';
  document.getElementById('sched-repeat').value = '0';

  S.schedType = 'water';
  setGroupActive('sched-type-group', 'water');

  openModal('modal-schedule');
}

function saveScheduled() {
  const plantId = document.getElementById('sched-plant').value;
  const date    = document.getElementById('sched-date').value;
  const time    = document.getElementById('sched-time').value;
  const repeat  = parseInt(document.getElementById('sched-repeat').value) || 0;
  if (!plantId || !date) { toast('Wypełnij wymagane pola', true); return; }

  const typeBtn = document.querySelector('#sched-type-group .btn-toggle.active');
  const type = typeBtn ? typeBtn.dataset.value : 'water';
  const datetime = date + 'T' + time;

  const baseEv = { plantId, type, date, datetime, time, repeat:0, notified:false };

  S.scheduled.push({ id:uid(), ...baseEv });

  if (repeat > 0) {
    let cur = new Date(date);
    for (let i=1; i<=52; i++) {
      cur = addDays(cur, repeat);
      const fd = cur.toISOString().split('T')[0];
      S.scheduled.push({ id:uid(), ...baseEv, date:fd, datetime:fd+'T'+time });
    }
  }

  save();
  closeModal('modal-schedule');
  renderCalendar();
  checkScheduled();
  toast('📅 Zdarzenie zaplanowane!');
}

// ───── AI FORECAST ─────
function applyAiForecast() {
  const txt = document.getElementById('ai-forecast-text').value.trim();
  if (!txt) { toast('Wklej lub wgraj forecast', true); return; }

  let parsed;
  try { parsed = JSON.parse(txt); }
  catch(e) { toast('Niepoprawny format JSON', true); return; }

  const rows = [];
  for (const [key, val] of Object.entries(parsed)) {
    const plant = S.plants.find(p => p.name.toLowerCase()===key.toLowerCase() || p.id===key);
    if (!plant) { rows.push({name:key,found:false}); continue; }
    S.aiForecasts[plant.id] = {
      nextDate: val.next || val.nextDate || val.date,
      freq: val.freq || val.frequency || val.days || 7,
      source: 'ai', note: val.note || ''
    };
    rows.push({name:plant.name,found:true,next:S.aiForecasts[plant.id].nextDate});
  }

  save();
  const res = document.getElementById('ai-forecast-result');
  res.classList.remove('hidden');
  res.innerHTML = `
    <div style="font-size:13px;font-weight:600;color:var(--accent);margin-bottom:8px">${icon('check-circle',13)} AI Forecast zastosowany</div>
    ${rows.map(r=>`<div class="ai-plant-row">
      <span>${r.found?'✓':'⚠'} ${r.name}</span>
      <span style="color:var(--text3)">${r.found?(r.next||'OK'):'Nie znaleziono'}</span>
    </div>`).join('')}
    <button id="btn-clear-ai" style="margin-top:10px;width:100%;display:flex;align-items:center;gap:6px;justify-content:center"
      class="btn-secondary">${icon('trash-2',14)} Wyczyść AI forecast</button>
  `;

  document.getElementById('btn-clear-ai').addEventListener('click', () => {
    S.aiForecasts = {};
    save();
    res.classList.add('hidden');
    document.getElementById('ai-forecast-text').value = '';
    renderPlants();
    toast('AI forecast wyczyszczony');
  });

  renderPlants();
  renderIcons();
  toast('🤖 AI forecast zastosowany!');
}

// ───── STATS / CHARTS ─────
function updateStats() {
  const waters = S.events.filter(e=>e.type==='water').length;
  const ferts  = S.events.filter(e=>e.type==='fertilize').length;
  const harvs  = S.events.filter(e=>e.type==='harvest');
  const kg     = harvs.reduce((s,e)=>s+(e.weight||0),0);

  document.getElementById('stat-waterings-val').textContent = waters;
  document.getElementById('stat-fertilize-val').textContent = ferts;
  document.getElementById('stat-harvest-val').textContent   = kg.toFixed(1)+' kg';
  document.getElementById('stat-plants-val').textContent    = S.plants.length;
}

function renderCharts() {
  updateStats();
  renderWaterChart();
  renderHarvestChart();
}

function renderWaterChart() {
  const canvas = document.getElementById('chart-waterings');
  if (!canvas || !window.Chart) return;

  const labels=[], wData=[], fData=[];
  for (let i=29;i>=0;i--) {
    const d=new Date(); d.setDate(d.getDate()-i);
    labels.push(d.toLocaleDateString('pl-PL',{day:'numeric',month:'short'}));
    wData.push(S.events.filter(e=>e.type==='water'&&sameDay(e.timestamp,d)).length);
    fData.push(S.events.filter(e=>e.type==='fertilize'&&sameDay(e.timestamp,d)).length);
  }

  if (S.charts.water) S.charts.water.destroy();
  S.charts.water = new Chart(canvas, {
    type:'bar',
    data:{
      labels,
      datasets:[
        {label:'Podlewanie',data:wData,backgroundColor:'rgba(56,189,248,0.5)',borderColor:'#38bdf8',borderWidth:1,borderRadius:4},
        {label:'Nawożenie', data:fData,backgroundColor:'rgba(163,230,53,0.4)',borderColor:'#a3e635',borderWidth:1,borderRadius:4}
      ]
    },
    options:{
      responsive:true,
      plugins:{legend:{labels:{color:'#7aab80',font:{family:'Inter',size:11}}}},
      scales:{
        x:{ticks:{color:'#3d5e42',font:{size:9},maxRotation:45},grid:{color:'rgba(74,222,128,0.05)'}},
        y:{ticks:{color:'#3d5e42',stepSize:1},grid:{color:'rgba(74,222,128,0.05)'},beginAtZero:true}
      }
    }
  });
}

function renderHarvestChart() {
  const canvas = document.getElementById('chart-harvests');
  if (!canvas || !window.Chart) return;

  const map={};
  S.events.filter(e=>e.type==='harvest').forEach(e=>{
    const p=S.plants.find(x=>x.id===e.plantId);
    const name=p?p.name:'Nieznana';
    map[name]=(map[name]||0)+(e.weight||0);
  });

  const labels=Object.keys(map);
  const data=Object.values(map);

  if (labels.length===0) {
    canvas.parentElement.innerHTML='<h3>Plony per roślina (kg)</h3><div style="color:var(--text3);font-size:13px;text-align:center;padding:20px">Brak danych o plonach</div>';
    return;
  }

  if (S.charts.harvest) S.charts.harvest.destroy();
  const colors=['rgba(251,146,60,.7)','rgba(74,222,128,.7)','rgba(56,189,248,.7)','rgba(167,139,250,.7)','rgba(251,191,36,.7)'];

  S.charts.harvest = new Chart(canvas,{
    type:'doughnut',
    data:{labels,datasets:[{data,backgroundColor:colors.slice(0,labels.length),borderColor:'#111911',borderWidth:2}]},
    options:{
      responsive:true,
      plugins:{
        legend:{position:'bottom',labels:{color:'#7aab80',font:{family:'Inter',size:12},padding:12}},
        tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${ctx.parsed.toFixed(2)} kg`}}
      }
    }
  });
}

// ───── NAVIGATION ─────
function switchView(name) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(`view-${name}`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${name}"]`)?.classList.add('active');
  S.view = name;

  if (name==='timeline')  renderTimeline();
  if (name==='calendar')  renderCalendar();
  if (name==='stats')     renderCharts();

  renderIcons();
}

// ───── GROUP TOGGLE HELPER ─────
function setGroupActive(groupId, value) {
  document.querySelectorAll(`#${groupId} .btn-toggle`).forEach(b => {
    b.classList.toggle('active', b.dataset.value === value);
  });
}

// ───── IMAGE HANDLING ─────
function bindPhotoInput(inputId, previewId) {
  document.getElementById(inputId).addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w=img.width, h=img.height;
        if (w>MAX) { h=h*MAX/w; w=MAX; }
        if (h>MAX) { w=w*MAX/h; h=MAX; }
        canvas.width=w; canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        const preview = document.getElementById(previewId);
        preview.innerHTML = `<img src="${dataUrl}" />`;
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ───── DEMO DATA ─────
function addDemo() {
  const now = new Date();
  const demo = [
    { name:'Monstera', species:'Monstera deliciosa', location:'parapet', waterFreq:7,
      planted: addDays(now,-60).toISOString().split('T')[0], notes:'Lubi rozproszone światło' },
    { name:'Pomidory', species:'Solanum lycopersicum', location:'balkon', waterFreq:2,
      planted: addDays(now,-30).toISOString().split('T')[0], notes:'Podlewać codziennie przy upałach' },
    { name:'Bazylia', species:'Ocimum basilicum', location:'parapet', waterFreq:3,
      planted: addDays(now,-14).toISOString().split('T')[0], notes:'Nie zalewać' }
  ];

  demo.forEach(pd => {
    const p = { id:uid(), ...pd, photo:null, createdAt:now.toISOString() };
    S.plants.push(p);
    S.events.push({ id:uid(), plantId:p.id, type:'plant',
      timestamp: new Date(pd.planted+'T09:00:00').toISOString(), notes:'Posadzenie' });
    for (let i=3;i>=0;i--) {
      const ts = addDays(now, -i*pd.waterFreq);
      S.events.push({ id:uid(), plantId:p.id,
        type: i%4===0?'fertilize':'water',
        timestamp: ts.toISOString(),
        amount: Math.floor(Math.random()*200+100),
        fertilizer: i%4===0?'NPK 10-10-10':null, notes:'' });
    }
  });

  S.events.push({ id:uid(), plantId:S.plants[1].id, type:'harvest',
    timestamp: addDays(now,-5).toISOString(),
    quantity:8, weight:0.6, notes:'Pierwsze pomidory sezonu!', photo:null });

  save();
}

// ───── INIT ─────
function init() {
  load();
  registerSW();

  if (S.plants.length === 0) addDemo();

  renderPlants();
  updateStats();
  if (Notification.permission === 'default') {
    document.getElementById('notif-dot').classList.remove('hidden');
  }

  // ── EVENT DELEGATION ──

  // Bottom nav
  document.getElementById('bottom-nav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn');
    if (btn?.dataset.view) switchView(btn.dataset.view);
  });

  // Plants grid — delegation for cards AND empty-state button
  document.getElementById('plants-grid').addEventListener('click', e => {
    if (e.target.closest('#btn-empty-add') || e.target.id==='btn-empty-add') {
      openPlantModal(); return;
    }
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      e.stopPropagation();
      const plantId = actionBtn.closest('[data-plant-id]')?.dataset.plantId;
      if (!plantId) return;
      if (actionBtn.dataset.action === 'water')     openWaterModal(plantId, 'water');
      if (actionBtn.dataset.action === 'fertilize') openWaterModal(plantId, 'fertilize');
      if (actionBtn.dataset.action === 'harvest')   openHarvestModal(plantId);
      return;
    }
    const card = e.target.closest('.plant-card');
    if (card?.dataset.plantId) openPlantDetail(card.dataset.plantId);
  });

  // Empty state button (outside grid)
  document.getElementById('btn-empty-add')?.addEventListener('click', () => openPlantModal());

  // Add plant button
  document.getElementById('btn-add-plant').addEventListener('click', () => openPlantModal());

  // Location filter tabs
  document.getElementById('location-filter').addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('#location-filter .filter-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    S.locationFilter = tab.dataset.filter;
    renderPlants();
  });

  // Timeline filters
  document.getElementById('timeline-filters').addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    document.querySelectorAll('#timeline-filters .filter-chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    S.timelineFilter = chip.dataset.type;
    renderTimeline();
  });

  // Plant modal: save
  document.getElementById('btn-save-plant').addEventListener('click', savePlant);

  // Plant modal: location toggle
  document.getElementById('location-group').addEventListener('click', e => {
    const btn = e.target.closest('.btn-toggle');
    if (!btn) return;
    setGroupActive('location-group', btn.dataset.value);
  });

  // Plant modal: photo
  document.getElementById('plant-photo-area').addEventListener('click', () => {
    document.getElementById('plant-photo-input').click();
  });
  bindPhotoInput('plant-photo-input', 'plant-photo-preview');

  // Water modal: save
  document.getElementById('btn-save-water').addEventListener('click', saveWatering);

  // Water modal: type toggle
  document.getElementById('water-type-group').addEventListener('click', e => {
    const btn = e.target.closest('.btn-toggle');
    if (!btn) return;
    setGroupActive('water-type-group', btn.dataset.value);
    document.getElementById('fertilizer-group').classList.toggle('hidden', btn.dataset.value !== 'fertilize');
  });

  // Harvest modal: save + photo
  document.getElementById('btn-save-harvest').addEventListener('click', saveHarvest);
  document.getElementById('harvest-photo-area').addEventListener('click', () => {
    document.getElementById('harvest-photo-input').click();
  });
  bindPhotoInput('harvest-photo-input', 'harvest-photo-preview');

  // Schedule modal
  document.getElementById('btn-add-event').addEventListener('click', openScheduleModal);
  document.getElementById('btn-save-sched').addEventListener('click', saveScheduled);
  document.getElementById('sched-type-group').addEventListener('click', e => {
    const btn = e.target.closest('.btn-toggle');
    if (!btn) return;
    setGroupActive('sched-type-group', btn.dataset.value);
    S.schedType = btn.dataset.value;
  });

  // Plant detail modal: action buttons (delegation on body)
  document.getElementById('modal-detail-body').addEventListener('click', e => {
    const btn = e.target.closest('[data-detail-action]');
    if (!btn) return;
    const pid = btn.dataset.pid;
    const act = btn.dataset.detailAction;
    if (act === 'water')     { closeModal('modal-detail'); openWaterModal(pid,'water'); }
    if (act === 'fertilize') { closeModal('modal-detail'); openWaterModal(pid,'fertilize'); }
    if (act === 'harvest')   { closeModal('modal-detail'); openHarvestModal(pid); }
    if (act === 'edit')      { closeModal('modal-detail'); openPlantModal(pid); }
    if (act === 'delete')    { deletePlant(pid); }
  });

  // All modal close buttons (data-modal attribute)
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-modal]');
    if (btn) closeModal(btn.dataset.modal);
  });

  // Click outside modal to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Notifications
  document.getElementById('btn-notif').addEventListener('click', requestNotifPermission);



  // AI forecast
  document.getElementById('btn-apply-ai-forecast').addEventListener('click', applyAiForecast);
  document.getElementById('ai-forecast-file').addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { document.getElementById('ai-forecast-text').value = ev.target.result; };
    reader.readAsText(file);
  });

  // Render initial icons
  renderIcons();

  // Periodic schedule check
  checkScheduled();
  setInterval(checkScheduled, 3600000);

  console.log('Plant Tracker initialized ✓');
}

document.addEventListener('DOMContentLoaded', init);
