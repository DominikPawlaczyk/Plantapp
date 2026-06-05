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

const DEFAULT_SPECIES = [
  {
    id: 'sp_truskawka',
    name: 'Truskawka wieloletnia',
    description: 'Opis: Bylina owocująca dająca słodkie, czerwone jagody.\nHistoria: Współczesna truskawka powstała w XVIII wieku we Francji.\nPochodzenie: Krzyżówka odmian z Ameryki Północnej i Południowej.\nNasłonecznienie: Pełne słońce.\nNawodnienie: Umiarkowane, ale regularne (nie znosi suszy).\nCechy szczególne: Wypuszcza rozłogi, owocuje przez kilka sezonów.\nFunkcje: Jadalna, dekoracyjna do donic i skrzynek.'
  },
  {
    id: 'sp_tom_red',
    name: 'Pomidor wiszący Tumbling Tom Red',
    description: 'Opis: Karłowa odmiana o kaskadowym pokroju i czerwonych owocach.\nHistoria: Stworzona specjalnie z myślą o uprawach miejskich i balkonowych.\nPochodzenie: Europa (współczesna odmiana hodowlana).\nNasłonecznienie: Pełne słońce.\nNawodnienie: Częste (ziemia powinna być stale lekko wilgotna).\nCechy szczególne: Zwisające pędy, nie wymaga palikowania ani cięcia.\nFunkcje: Kulinarna (przekąska), ozdobna.'
  },
  {
    id: 'sp_black_cherry',
    name: 'Pomidor Black Cherry',
    description: 'Opis: Wysoka roślina rodząca ciemne, brunatno-bordowe pomidorki koktajlowe.\nHistoria: Szybko zdobyła popularność dzięki unikalnemu, dymno-słodkiemu smakowi.\nPochodzenie: USA (Floryda).\nNasłonecznienie: Pełne słońce, osłonięte od wiatru.\nNawodnienie: Regularne, obfite.\nCechy szczególne: Szybki i silny wzrost, wymaga wysokich podpór.\nFunkcje: Kulinarna, idealna do letnich sałatek.'
  },
  {
    id: 'sp_yellow_pear',
    name: 'Pomidor Żółta gruszka (Yellow Pear)',
    description: 'Opis: Wysoka odmiana rodząca małe, żółte owoce w kształcie gruszek.\nHistoria: Odmiana historyczna, znana w Europie już w XVIII wieku.\nPochodzenie: Europa.\nNasłonecznienie: Dużo słońca.\nNawodnienie: Umiarkowane do częstego.\nCechy szczególne: Bardzo słodki, łagodny smak i unikalny kształt owoców.\nFunkcje: Kulinarna, dekoracyjna na talerzu.'
  },
  {
    id: 'sp_tom_yellow',
    name: 'Pomidor wiszący Tumbling Tom Yellow',
    description: 'Opis: Żółty odpowiednik wersji Red, o kaskadowym, krzaczastym pokroju.\nHistoria: Wyhodowana do upraw pojemnikowych na małych przestrzeniach.\nPochodzenie: Europa.\nNasłonecznienie: Pełne słońce.\nNawodnienie: Częste, latem wymaga codziennego podlewania.\nCechy szczególne: Owoce o złocistym kolorze, pędy naturalnie opadające.\nFunkcje: Jadalna, idealna do wiszących donic na balkon.'
  },
  {
    id: 'sp_maliniak',
    name: 'Pomidor Maliniak',
    description: 'Opis: Niska, sztywno-łodygowa odmiana o dużych, malinowych owocach.\nHistoria: Bardzo popularna, polska odmiana amatorska.\nPochodzenie: Polska.\nNasłonecznienie: Słoneczne i ciepłe stanowisko.\nNawodnienie: Regularne, unikać moczenia liści.\nCechy szczególne: Krzaczasty pokrój, nie wymaga palikowania ani usuwania pędów.\nFunkcje: Kulinarna (kanapki, przetwory, sosy).'
  },
  {
    id: 'sp_jalapeno',
    name: 'Papryka Jalapeño',
    description: 'Opis: Pikantna papryka o mięsistych, zielonych (dojrzewających na czerwono) strąkach.\nHistoria: Uprawiana od tysiącleci przez rdzennych mieszkańców Ameryki.\nPochodzenie: Meksyk (stan Veracruz).\nNasłonecznienie: Pełne, intensywne słońce.\nNawodnienie: Umiarkowane, lubi przeschnąć między podlewaniami.\nCechy szczególne: Średnia ostrość (2,5-8 tys. w skali Scoville\'a).\nFunkcje: Kulinarna, przyprawowa (salsy, marynaty).'
  },
  {
    id: 'sp_chilli',
    name: 'Papryka Chilli',
    description: 'Opis: Bardzo ostra papryka o smukłych, intensywnie czerwonych owocach.\nHistoria: Rozprzestrzeniona na całym świecie przez hiszpańskich odkrywców.\nPochodzenie: Ameryka Środkowa i Południowa.\nNasłonecznienie: Bardzo słoneczne i ciepłe.\nNawodnienie: Umiarkowane.\nCechy szczególne: Wysoka zawartość kapsaicyny (silna ostrość).\nFunkcje: Przyprawowa, lecznicza (działanie rozgrzewające).'
  },
  {
    id: 'sp_bazylia_ziel',
    name: 'Bazylia Zielona',
    description: 'Opis: Jednoroczne zioło o niezwykle aromatycznych, jasnozielonych liściach.\nHistoria: Uznawana za świętą roślinę w starożytnych Indiach.\nPochodzenie: Tropikalne regiony Azji / Indie.\nNasłonecznienie: Jasne, ale osłonięte przed palącym, popołudniowym słońcem.\nNawodnienie: Częste, podłoże musi być stale lekko wilgotne.\nCechy szczególne: Bardzo wrażliwa na chłód, odstrasza owady.\nFunkcje: Kulinarna (pesto, dania włoskie).'
  },
  {
    id: 'sp_mieta_czek',
    name: 'Mięta Czekoladowa',
    description: 'Opis: Odmiana mięty o ciemniejszych pędach i unikalnym, kakaowym zapachu.\nHistoria: Powstała z selekcji odmian mięty pieprzowej.\nPochodzenie: Europa (odmiana hodowlana).\nNasłonecznienie: Półcień do pełnego słońca.\nNawodnienie: Regularne, preferuje wilgotną glebę.\nCechy szczególne: Zapach i smak przypominający miętową czekoladę.\nFunkcje: Kulinarna (desery, zimne napoje), aromaterapeutyczna.'
  },
  {
    id: 'sp_mieta_pom',
    name: 'Mięta Pomarańczowa',
    description: 'Opis: Aromatyczne zioło o silnym, cytrusowo-orzeźwiającym zapachu.\nHistoria: Ceniona w medycynie ludowej od setek lat.\nPochodzenie: Europa / Azja Zachodnia.\nNasłonecznienie: Półcień do słońca.\nNawodnienie: Regularne i obfite.\nCechy szczególne: Mocny aromat bergamotki i pomarańczy; roślina ekspansywna.\nFunkcje: Kulinarna (herbaty, sałatki, drinki), relaksująca.'
  },
  {
    id: 'sp_melisa',
    name: 'Melisa',
    description: 'Opis: Wieloletnie zioło o karbowanych liściach i cytrynowym aromacie.\nHistoria: Stosowana już w starożytnej Grecji jako środek uspokajający.\nPochodzenie: Basen Morza Śródziemnego.\nNasłonecznienie: Półcień do pełnego słońca.\nNawodnienie: Umiarkowane (podlewać po lekkim przeschnięciu).\nCechy szczególne: Silnie przyciąga pszczoły (roślina miododajna).\nFunkcje: Lecznicza (łagodzi stres), kulinarna (napary).'
  },
  {
    id: 'sp_rozmaryn',
    name: 'Rozmaryn',
    description: 'Opis: Zimozielony krzewinka o igiełkowatych liściach i leśnym, żywicznym zapachu.\nHistoria: Symbol pamięci i wierności w starożytnym Rzymie.\nPochodzenie: Region Morza Śródziemnego.\nNasłonecznienie: Pełne, mocne słońce.\nNawodnienie: Rzadkie, roślina bardzo dobrze znosi suszę.\nCechy szczególne: Łodygi z czasem drewnieją, bogaty w olejki eteryczne.\nFunkcje: Przyprawowa (do mięs, pieczeni), ozdobna.'
  },
  {
    id: 'sp_oregano',
    name: 'Oregano (Lebiodka pospolita)',
    description: 'Opis: Drobne, krzewiaste zioło o intensywnym, lekko pikantnym smaku.\nHistoria: Niezbędny element kuchni i medycyny antycznej Grecji.\nPochodzenie: Europa, Azja Zachodnia.\nNasłonecznienie: Pełne słońce.\nNawodnienie: Umiarkowane (ziemia powinna przesychać między podlewaniami).\nCechy szczególne: Wysoce odporne na suszę i łatwe w uprawie.\nFunkcje: Kulinarna (pizza, sosy pomidorowe), antybakteryjna.'
  },
  {
    id: 'sp_szczypiorek',
    name: 'Szczypiorek wieloletni',
    description: 'Opis: Roślina cebulowa o rurkowatych, zielonych liściach i fioletowych kwiatach.\nHistoria: Uprawiany i ceniony w Chinach już 3000 lat p.n.e.\nPochodzenie: Europa, Azja, Ameryka Północna.\nNasłonecznienie: Słońce do lekkiego półcienia.\nNawodnienie: Umiarkowane, regularne.\nCechy szczególne: Szybko odrasta po ścięciu, jadalne, miododajne kwiaty.\nFunkcje: Kulinarna (dodatek do twarogów, jaj, sałatek).'
  },
  {
    id: 'sp_tuja',
    name: 'Tuja Szmaragdowa (Żywotnik zachodni)',
    description: 'Opis: Elegancki iglak o stożkowym pokroju i soczyście zielonych łuskach.\nHistoria: Odmiana wyselekcjonowana w 1950 roku w Danii.\nPochodzenie: Ameryka Północna.\nNasłonecznienie: Słońce do półcienia.\nNawodnienie: Regularne (ma płytki system korzeniowy, wrażliwa na suszę).\nCechy szczególne: Zachowuje szmaragdową zieleń zimą, nie brązowieje.\nFunkcje: Ozdobna, idealna na gęste żywopłoty na balkonach/tarasach.'
  },
  {
    id: 'sp_philo_brasil',
    name: 'Philodendron Brasil',
    description: 'Opis: Efektowne pnącze o sercowatych liściach z neonowo-żółtymi paskami.\nHistoria: Odkryty jako naturalna mutacja Philodendrona pnącego (hederaceum).\nPochodzenie: Ameryka Południowa (Brazylia).\nNasłonecznienie: Jasne, rozproszone światło.\nNawodnienie: Umiarkowane (podlewać, gdy wierzchnia warstwa ziemi przeschnie).\nCechy szczególne: Bardzo szybki wzrost, wybacza błędy początkujących.\nFunkcje: Ozdobna (do makram i kwietników), oczyszczająca powietrze.'
  },
  {
    id: 'sp_philo_scandens',
    name: 'Philodendron scandens (pnący)',
    description: 'Opis: Klasyczne pnącze o jednolitych, ciemnozielonych, sercowatych liściach.\nHistoria: Jedna z najstarszych i najchętniej uprawianych roślin domowych.\nPochodzenie: Ameryka Środkowa i Karaiby.\nNasłonecznienie: Toleruje słabe oświetlenie i głęboki półcień.\nNawodnienie: Umiarkowane.\nCechy szczególne: Wyjątkowo odporny na zaniedbania i brak światła.\nFunkcje: Ozdobna, silnie filtruje toksyny z powietrza.'
  },
  {
    id: 'sp_sansewiera',
    name: 'Sansewiera Laurentii (Wężownica)',
    description: 'Opis: Sukulent o mieczowatych, sztywnych liściach z żółtym marginesem.\nHistoria: Popularna w europejskich domach i biurach od początku XX wieku.\nPochodzenie: Afryka Zachodnia.\nNasłonecznienie: Rośnie wszędzie: od pełnego słońca po głęboki cień.\nNawodnienie: Bardzo rzadkie (dopiero gdy ziemia w donicy całkowicie wyschnie).\nCechy szczególne: Produkuje tlen w nocy (idealna do sypialni).\nFunkcje: Ozdobna, uznana przez NASA za oczyszczającą powietrze.'
  },
  {
    id: 'sp_zamioculcas',
    name: 'Zamioculcas Zamikulkas',
    description: 'Opis: Sukulent o grubych, błyszczących liściach ułożonych na mięsistych łodygach.\nHistoria: Wprowadzony na szeroki rynek florystyczny stosunkowo niedawno (w 1996 roku).\nPochodzenie: Afryka Wschodnia (Tanzania, Zanzibar).\nNasłonecznienie: Cień do lekko rozproszonego światła.\nNawodnienie: Bardzo rzadkie (magazynuje wodę w podziemnych bulwach).\nCechy szczególne: Nazywany "żelazną rośliną" – niemal niezniszczalny.\nFunkcje: Ozdobna, idealna dla zapracowanych i początkujących.'
  },
  {
    id: 'sp_euphorbia_lactea',
    name: 'Euphorbia lactea (Wilczomlecz mleczny)',
    description: 'Opis: Oryginalny sukulent o rzeźbiarskich, pofalowanych pędach z jasnym, marmurkowym wzorem.\nHistoria: Niezwykle popularny w zmutowanej formie grzebieniastej (\'Cristata\'), która przypomina rafę koralową.\nPochodzenie: Tropikalne regiony Azji (głównie Indie i Sri Lanka).\nNasłonecznienie: Jasne, rozproszone światło do pełnego słońca.\nNawodnienie: Bardzo rzadkie, podłoże musi całkowicie wyschnąć przed kolejnym podlaniem.\nCechy szczególne: Wydziela biały, toksyczny sok mleczny, który może silnie podrażnić skórę i oczy.\nFunkcje: Wysoce dekoracyjna, architektoniczna ozdoba nowoczesnych wnętrz.'
  }
];

// ───── STATE ─────
const S = {
  plants: [], events: [], scheduled: [], aiForecasts: {}, species: [], expenses: [], priceRules: [],
  defaultSpeciesVersion: 0,
  view: 'home', locationFilter: 'all', timelineFilter: 'all',
  calMonth: new Date(), selectedDate: new Date(),
  editingPlantId: null, waterPlantId: null, harvestPlantId: null, customPlantId: null, editingSpeciesId: null,
  heightPlantId: null, cuttingPlantId: null,
  schedType: 'water',
  sortOrder: 'urgency', timelinePlant: 'all', calPlant: 'all',
  charts: {}
};

// ───── STORAGE ─────
function save() {
  try {
    localStorage.setItem(CFG.STORE, JSON.stringify({
      plants: S.plants, events: S.events,
      scheduled: S.scheduled, aiForecasts: S.aiForecasts, species: S.species,
      expenses: S.expenses, priceRules: S.priceRules,
      defaultSpeciesVersion: S.defaultSpeciesVersion
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
    S.species    = d.species    || [];
    S.expenses   = d.expenses   || [];
    S.priceRules = d.priceRules || [];
    
    // Migracja z defaultSpeciesAdded -> defaultSpeciesVersion
    if (d.defaultSpeciesAdded && !d.defaultSpeciesVersion) d.defaultSpeciesVersion = 1;
    S.defaultSpeciesVersion = d.defaultSpeciesVersion || 0;

    if (S.defaultSpeciesVersion < 2) {
      DEFAULT_SPECIES.forEach(ds => {
        if (!S.species.find(s => s.name === ds.name)) S.species.push(ds);
      });
      S.defaultSpeciesVersion = 2;
      save(); // Save immediately to persist defaults
    }
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

function getSpeciesName(val) {
  const s = S.species.find(x => x.id === val);
  return s ? s.name : val;
}

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function combineDateAndTime(dateVal, timeVal) {
  if (!timeVal) timeVal = '12:00';
  return new Date(dateVal + 'T' + timeVal).toISOString();
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
  if (!history.state || !history.state.modal) {
    history.pushState({ view: S.view, modal: true }, '');
  }
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  setTimeout(() => {
    const anyOpen = Array.from(document.querySelectorAll('.modal-overlay')).some(m => !m.classList.contains('hidden'));
    if (!anyOpen && history.state && history.state.modal) {
      history.back();
    }
  }, 10);
}

window.addEventListener('popstate', e => {
  const st = e.state;
  if (!st) return;
  if (!st.modal) {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  }
  if (st.view && st.view !== S.view) {
    switchView(st.view, true);
  }
});

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

  if (S.sortOrder === 'name') {
    plants.sort((a,b) => a.name.localeCompare(b.name));
  } else {
    plants.sort((a,b) => {
      const pa = predict(a), pb = predict(b);
      const ua = pa ? daysUntil(pa.nextDate) : 999;
      const ub = pb ? daysUntil(pb.nextDate) : 999;
      return ua - ub;
    });
  }

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
    const locLabels = { balkon:'Balkon', parapet:'Parapet', polka:'Półka', okno:'Okno' };
    const locIcos   = { balkon:'sun', parapet:'layout-panel-left', polka:'layers', okno:'app-window' };
    const locLabel = locLabels[p.location] || p.location;
    const locIco = locIcos[p.location] || 'layout-panel-left';

    return `<div class="plant-card" data-plant-id="${p.id}">
      ${imgHtml}
      ${urgTxt ? `<div class="predict-badge">${urgTxt}</div>` : ''}
      <div class="plant-body">
        <div class="plant-name">${p.name}</div>
        ${p.species ? `<div class="plant-species">${getSpeciesName(p.species)}</div>` : ''}
        <div class="plant-meta">
          <span class="loc-badge">${icon(locIco,10)} ${locLabel}</span>
          ${ago!==null ? `<span class="next-water ${urgCls}">${icon('droplet',12)} ${ago===0?'Dziś':ago+'d temu'}</span>` : ''}
        </div>
      </div>
      <div class="plant-actions">
        <button class="plant-btn water"    data-action="water"     title="Podlej">${icon('droplets',16)}</button>
        <button class="plant-btn fertilize" data-action="fertilize" title="Nawóź">${icon('flask-conical',16)}</button>
        <button class="plant-btn harvest"  data-action="harvest"   title="Zbiory">${icon('apple',16)}</button>
        <button class="plant-btn custom"   data-action="custom"    title="Inne">${icon('file-text',16)}</button>
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
  nameEl.value = ''; notesEl.value = ''; freqEl.value = 7;
  plantedEl.value = new Date().toISOString().split('T')[0];
  preview.innerHTML = `${icon('image',32)}<span>Dodaj zdjęcie</span>`;
  setGroupActive('location-group', 'balkon');

  // Populate species select
  speciesEl.innerHTML = '<option value="">-- Wybierz z bazy (lub brak) --</option>' + 
    S.species.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  speciesEl.value = '';

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
  document.getElementById('harvest-time').value = nowTime();
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
    timestamp: combineDateAndTime(dateVal, document.getElementById('harvest-time').value),
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

// ───── CUSTOM MODAL ─────
function openCustomModal(plantId) {
  S.customPlantId = plantId;
  const p = S.plants.find(x => x.id === plantId);
  if (!p) return;

  document.getElementById('custom-plant-badge').textContent = p.name;
  document.getElementById('custom-date').value = nowLocal().split('T')[0];
  document.getElementById('custom-time').value = nowTime();
  document.getElementById('custom-title').value = '';
  document.getElementById('custom-notes').value = '';

  openModal('modal-custom');
}

function saveCustom() {
  const dateVal = document.getElementById('custom-date').value;
  const title = document.getElementById('custom-title').value.trim();
  if (!dateVal || !title) { toast('Podaj datę i tytuł', true); return; }

  S.events.push({
    id: uid(), plantId: S.customPlantId, type: 'custom',
    timestamp: combineDateAndTime(dateVal, document.getElementById('custom-time').value),
    customTitle: title,
    notes: document.getElementById('custom-notes').value.trim()
  });

  save();
  closeModal('modal-custom');
  renderTimeline();
  renderCalendar();
  toast('Zdarzenie zapisane!');
}

// ───── HEIGHT MODAL ─────
function openHeightModal(plantId) {
  S.heightPlantId = plantId;
  const p = S.plants.find(x => x.id === plantId);
  if (!p) return;

  document.getElementById('height-plant-badge').textContent = p.name;
  document.getElementById('height-date').value = nowLocal().split('T')[0];
  document.getElementById('height-time').value = nowTime();
  document.getElementById('height-value').value = '';
  document.getElementById('height-notes').value = '';

  openModal('modal-height');
}

function saveHeight() {
  const dateVal = document.getElementById('height-date').value;
  const heightVal = parseFloat(document.getElementById('height-value').value);
  if (!dateVal || isNaN(heightVal)) { toast('Podaj datę i poprawną wysokość', true); return; }

  S.events.push({
    id: uid(), plantId: S.heightPlantId, type: 'height',
    timestamp: combineDateAndTime(dateVal, document.getElementById('height-time').value),
    height: heightVal,
    notes: document.getElementById('height-notes').value.trim()
  });

  save();
  closeModal('modal-height');
  renderTimeline();
  if (S.view === 'finances') renderFinances();
  toast('Wysokość zapisana!');
}

// ───── CUTTING MODAL ─────
function openCuttingModal(plantId) {
  S.cuttingPlantId = plantId;
  const p = S.plants.find(x => x.id === plantId);
  if (!p) return;

  document.getElementById('cutting-plant-badge').textContent = p.name;
  document.getElementById('cutting-date').value = nowLocal().split('T')[0];
  document.getElementById('cutting-time').value = nowTime();
  document.getElementById('cutting-quantity').value = '1';
  document.getElementById('cutting-notes').value = '';

  openModal('modal-cutting');
}

function saveCutting() {
  const dateVal = document.getElementById('cutting-date').value;
  const qty = parseInt(document.getElementById('cutting-quantity').value);
  if (!dateVal || isNaN(qty) || qty <= 0) { toast('Podaj datę i ilość', true); return; }

  S.events.push({
    id: uid(), plantId: S.cuttingPlantId, type: 'cutting',
    timestamp: combineDateAndTime(dateVal, document.getElementById('cutting-time').value),
    quantity: qty,
    notes: document.getElementById('cutting-notes').value.trim()
  });

  save();
  closeModal('modal-cutting');
  renderTimeline();
  if (S.view === 'finances') renderFinances();
  toast('Sadzonki zapisane!');
}

// ───── EXPENSE MODAL ─────
function openExpenseModal() {
  document.getElementById('expense-date').value = nowLocal().split('T')[0];
  document.getElementById('expense-title').value = '';
  document.getElementById('expense-amount').value = '';
  
  const plantSel = document.getElementById('expense-plant');
  plantSel.innerHTML = '<option value="">-- Brak / Ogólne --</option>' + 
    S.plants.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  
  openModal('modal-expense');
}

function saveExpense() {
  const dateVal = document.getElementById('expense-date').value;
  const title = document.getElementById('expense-title').value.trim();
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const plantId = document.getElementById('expense-plant').value;

  if (!dateVal || !title || isNaN(amount) || amount <= 0) { toast('Wypełnij poprawnie wszystkie pola', true); return; }

  S.expenses.push({
    id: uid(),
    date: dateVal,
    title,
    amount,
    plantId: plantId || null,
    createdAt: new Date().toISOString()
  });

  save();
  closeModal('modal-expense');
  if (S.view === 'finances') renderFinances();
  toast('Wydatek zapisany!');
}

// ───── BULK MODAL ─────
function openBulkModal() {
  if (S.plants.length === 0) { toast('Najpierw dodaj rośliny', true); return; }
  document.getElementById('bulk-date').value = nowLocal().split('T')[0];
  document.getElementById('bulk-time').value = nowTime();
  document.getElementById('bulk-notes').value = '';
  document.getElementById('bulk-fertilizer-name').value = '';
  document.getElementById('bulk-custom-title').value = '';
  
  setGroupActive('bulk-type-group', 'water');
  document.getElementById('bulk-fertilizer-group').classList.add('hidden');
  document.getElementById('bulk-custom-group').classList.add('hidden');

  const list = document.getElementById('bulk-plant-list');
  list.innerHTML = S.plants.map(p => `
    <div class="bulk-plant-item" data-pid="${p.id}" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.07);margin-bottom:6px;background:rgba(255,255,255,0.03);user-select:none;">
      <input type="checkbox" id="bulk-cb-${p.id}" value="${p.id}" class="bulk-cb" style="width:16px;height:16px;flex-shrink:0;pointer-events:none;" />
      <div style="flex:1;pointer-events:none;">
        <div class="bulk-plant-name" style="font-weight:500;font-size:14px;">${p.name}</div>
        <div class="bulk-plant-meta" style="font-size:12px;color:var(--text3)">${p.location}</div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.bulk-plant-item').forEach(item => {
    item.addEventListener('click', () => {
      const cb = item.querySelector('.bulk-cb');
      cb.checked = !cb.checked;
      item.style.borderColor = cb.checked ? 'var(--accent)' : 'rgba(255,255,255,0.07)';
      item.style.background = cb.checked ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.03)';
    });
  });

  openModal('modal-bulk');
}

function saveBulkAction() {
  const cbs = document.querySelectorAll('.bulk-cb:checked');
  if (cbs.length === 0) { toast('Wybierz przynajmniej jedną roślinę', true); return; }

  const typeBtn = document.querySelector('#bulk-type-group .btn-toggle.active');
  const type = typeBtn ? typeBtn.dataset.value : 'water';
  const dateVal = document.getElementById('bulk-date').value;
  if (!dateVal) { toast('Podaj datę', true); return; }

  const notes = document.getElementById('bulk-notes').value.trim();
  const fert = document.getElementById('bulk-fertilizer-name').value.trim();
  const title = document.getElementById('bulk-custom-title').value.trim();

  if (type === 'custom' && !title) { toast('Podaj tytuł dla zdarzenia Inne', true); return; }

  const timestamp = combineDateAndTime(dateVal, document.getElementById('bulk-time').value);

  cbs.forEach(cb => {
    const pid = cb.value;
    const ev = { id: uid(), plantId: pid, type, timestamp, notes };
    if (type === 'fertilize') ev.fertilizer = fert || null;
    if (type === 'custom') ev.customTitle = title;
    S.events.push(ev);
  });

  save();
  closeModal('modal-bulk');
  renderPlants();
  renderTimeline();
  updateStats();
  toast(`✓ Wykonano dla ${cbs.length} roślin!`);
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

  const typeIco  = { water:'droplets', fertilize:'flask-conical', harvest:'apple', plant:'sprout', custom:'file-text', height:'ruler', cutting:'scissors' };
  const typeLabel= { water:'Podlewanie', fertilize:'Nawożenie', harvest:'Zbiory', plant:'Posadzenie', custom:'Inne', height:'Wysokość', cutting:'Sadzonka' };
  const typeCls  = { water:'water', fertilize:'fertilize', harvest:'harvest', plant:'plant', custom:'custom', height:'plant', cutting:'harvest' };

  const locLabels = { balkon:'Balkon', parapet:'Parapet', polka:'Półka', okno:'Okno' };
  const locIcos   = { balkon:'sun', parapet:'layout-panel-left', polka:'layers', okno:'app-window' };
  const locLabel = locLabels[p.location] || p.location;
  const locIco = locIcos[p.location] || 'layout-panel-left';

  const sObj = S.species.find(x => x.id === p.species);

  document.getElementById('detail-title').textContent = p.name;
  document.getElementById('modal-detail-body').innerHTML = `
    <div class="detail-header">
      ${imgHtml}
      <div>
        <div class="detail-name">${p.name}</div>
        ${p.species ? `<div class="detail-species">${getSpeciesName(p.species)}</div>` : ''}
        <div class="detail-badges">
          <span class="detail-badge">${icon(locIco,11)} ${locLabel}</span>
          ${p.planted ? `<span class="detail-badge">${icon('calendar',11)} ${fmtDate(p.planted)}</span>` : ''}
          <span class="detail-badge">${icon('droplets',11)} co ${p.waterFreq||7}d</span>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <button class="detail-action-btn water"     data-detail-action="water"     data-pid="${p.id}">${icon('droplets',14)} Podlej</button>
      <button class="detail-action-btn fertilize" data-detail-action="fertilize" data-pid="${p.id}">${icon('flask-conical',14)} Nawóź</button>
      <button class="detail-action-btn harvest"   data-detail-action="harvest"   data-pid="${p.id}">${icon('apple',14)} Zbiory</button>
      <button class="detail-action-btn custom"    data-detail-action="cutting"   data-pid="${p.id}">${icon('scissors',14)} Sadzonki</button>
      <button class="detail-action-btn custom"    data-detail-action="height"    data-pid="${p.id}">${icon('ruler',14)} Wysokość</button>
      <button class="detail-action-btn custom"    data-detail-action="custom"    data-pid="${p.id}">${icon('file-text',14)} Inne</button>
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

    ${sObj ? `
    <div class="detail-section" style="margin-bottom:14px; background: rgba(167, 139, 250, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(167, 139, 250, 0.1);">
      <h5 style="color: var(--plant); display:flex; align-items:center; gap:6px; margin-bottom:6px;">${icon('book-open',14)} Wiedza o gatunku</h5>
      <p style="font-size:13px; color:var(--text2); margin:0; line-height:1.5; white-space:pre-wrap;">${sObj.description}</p>
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
        if (ev.height) detail += (detail?' · ':'')+ev.height+' cm';
        if (ev.notes) detail += (detail?' · ':'')+ev.notes;
        return `<div class="history-item">
          <div class="history-icon ${tCls}">${icon(typeIco[ev.type]||'circle',14)}</div>
          <div class="history-text">
            <div class="history-title">${ev.customTitle || typeLabel[ev.type]||ev.type}</div>
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
  if (S.timelinePlant !== 'all') evs = evs.filter(e => e.plantId === S.timelinePlant);

  const pSelect = document.getElementById('timeline-plant-filter');
  if (pSelect) {
    pSelect.innerHTML = '<option value="all">Wszystkie rośliny</option>' + 
      S.plants.map(p => `<option value="${p.id}" ${p.id===S.timelinePlant?'selected':''}>${p.name}</option>`).join('');
  }

  if (evs.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('clock',56)}</div><p>Brak zdarzeń</p><span>Podlej rośliny lub dodaj zbiory</span></div>`;
    renderIcons();
    return;
  }

  const typeIco   = { water:'droplets', fertilize:'flask-conical', harvest:'apple', plant:'sprout', custom:'file-text' };
  const typeLabel = { water:'Podlewanie', fertilize:'Nawożenie', harvest:'Zbiory', plant:'Posadzenie', custom:'Inne' };

  el.innerHTML = evs.map(ev => {
    const plant = S.plants.find(p => p.id === ev.plantId);
    const pName = plant ? plant.name : 'Nieznana roślina';
    let detail = '';
    if (ev.amount) detail += `${ev.amount} ml`;
    if (ev.fertilizer) detail += (detail?' · ':'')+ev.fertilizer;
    if (ev.weight) detail += (detail?' · ':'')+ev.weight+' kg';
    if (ev.quantity) detail += (detail?' · ':'')+ev.quantity+' szt.';
    if (ev.height) detail += (detail?' · ':'')+ev.height+' cm';
    if (ev.notes) detail += (detail?' · ':'')+ev.notes;

    return `<div class="tl-item" data-plant-id="${plant ? plant.id : ''}" data-ev-id="${ev.id}">
      <div class="tl-dot ${ev.type}">${icon(typeIco[ev.type]||'circle',10)}</div>
      <div class="tl-card">
        <div class="tl-head">
          <span class="tl-title">${ev.customTitle || typeLabel[ev.type]||ev.type}</span>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="tl-time">${fmtDateTime(ev.timestamp)}</span>
            <button class="tl-delete-btn" data-ev-id="${ev.id}" title="Usuń zdarzenie" style="background:none;border:none;cursor:pointer;color:var(--text3);display:flex;align-items:center;padding:2px;border-radius:4px;transition:color 0.2s;">${icon('trash-2',13)}</button>
          </div>
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

  function getEventsForDay(date) {
    let dayEvs = S.events.filter(e => sameDay(e.timestamp, date));
    let scheEvs = S.scheduled.filter(e => e.date && sameDay(e.date, date));
    if (S.calPlant !== 'all') {
      dayEvs = dayEvs.filter(e => e.plantId === S.calPlant);
      scheEvs = scheEvs.filter(e => e.plantId === S.calPlant);
    }
    return [...dayEvs, ...scheEvs];
  }

  function dotsForDay(date) {
    const types = new Set(getEventsForDay(date).map(e=>e.type));
    return [...types].slice(0,3).map(t=>`<div class="cal-dot ${t}"></div>`).join('');
  }

  const calSelect = document.getElementById('cal-plant-filter');
  if (calSelect) {
    calSelect.innerHTML = '<option value="all">Wszystkie</option>' + 
      S.plants.map(p => `<option value="${p.id}" ${p.id===S.calPlant?'selected':''}>${p.name}</option>`).join('');
  }

  widget.innerHTML = `
    <div class="cal-head">
      <div class="cal-month-year">
        <span class="cal-month-name">${mNames[month.getMonth()]}</span>
        <span class="cal-year">${month.getFullYear()}</span>
      </div>
      <div class="cal-nav">
        <button class="cal-today-btn" id="cal-today">Dziś</button>
        <button class="cal-nav-btn" id="cal-prev">${icon('chevron-left',16)}</button>
        <button class="cal-nav-btn" id="cal-next">${icon('chevron-right',16)}</button>
      </div>
    </div>
    <div class="cal-day-names">${dNames.map(d=>`<div class="cal-dn">${d}</div>`).join('')}</div>
    <div class="cal-grid">
      ${cells.map(cell => {
        const isToday    = sameDay(cell.date, today);
        const isSelected = sameDay(cell.date, S.selectedDate);
        const evs = getEventsForDay(cell.date);
        const dots = dotsForDay(cell.date);
        return `<div class="cal-cell${cell.other?' other-month':''}${isToday&&!isSelected?' today':''}${isSelected?' selected':''}${evs.length>0?' has-events':''}"
          data-cal-date="${cell.date.toISOString()}" data-count="${evs.length}">
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
  document.getElementById('cal-today').addEventListener('click', () => {
    S.calMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    S.selectedDate = today;
    renderCalendar();
    renderCalEvents();
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

  let dayEvs = S.events.filter(e => sameDay(e.timestamp, date));
  let scheEvs = S.scheduled.filter(e => e.date && sameDay(e.date, date));
  if (S.calPlant !== 'all') {
    dayEvs = dayEvs.filter(e => e.plantId === S.calPlant);
    scheEvs = scheEvs.filter(e => e.plantId === S.calPlant);
  }
  const all = [...dayEvs, ...scheEvs].sort((a,b) =>
    new Date(a.timestamp||a.date) - new Date(b.timestamp||b.date)
  );

  const typeIco   = { water:'droplets', fertilize:'flask-conical', harvest:'apple', plant:'sprout', custom:'file-text', height:'ruler', cutting:'scissors' };
  const typeLabel = { water:'Podlewanie', fertilize:'Nawożenie', harvest:'Zbiory', plant:'Posadzenie', custom:'Inne', height:'Wysokość', cutting:'Sadzonka' };
  const typeCls   = { water:'water', fertilize:'fertilize', harvest:'harvest', plant:'plant', custom:'custom', height:'plant', cutting:'harvest' };

  const ds = date.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'});
  const mNamesGenitive = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  const dayName = date.toLocaleDateString('pl-PL',{weekday:'long'});
  const dayNum = date.getDate();
  const monthName = mNamesGenitive[date.getMonth()];

  el.innerHTML = `
    <div class="cal-events-header">
      <div class="cal-events-date">
        <div class="cal-events-day-num">${dayNum}</div>
        <div class="cal-events-day-info">
          <div class="cal-events-weekday">${dayName}</div>
          <div class="cal-events-month">${monthName} ${date.getFullYear()}</div>
        </div>
      </div>
      <div class="cal-events-count">${all.length} zdarzeń</div>
    </div>
    ${all.length===0 ? `
      <div class="cal-empty-state">
        <div class="cal-empty-icon">${icon('calendar-x', 24)}</div>
        <div class="cal-empty-text">Brak zdarzeń</div>
        <div class="cal-empty-hint">Odpocznij lub zaplanuj coś nowego</div>
      </div>
    ` :
      all.map(ev => {
        const plant = S.plants.find(p=>p.id===ev.plantId);
        const pName = plant ? plant.name : '—';
        const isSched = !ev.timestamp || !ev.timestamp.includes('T');
        const cls = typeCls[ev.type]||'water';
        
        let timeStr = '';
        if (ev.time) timeStr = ev.time;
        else if (ev.timestamp && ev.timestamp.includes('T')) {
          timeStr = new Date(ev.timestamp).toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
        }

        return `<div class="cal-ev-item ev-${cls}" data-plant-id="${plant ? plant.id : ''}" style="cursor: ${plant ? 'pointer' : 'default'}">
          <div class="cal-ev-icon ${cls}">${icon(typeIco[ev.type]||'circle',18)}</div>
          <div class="cal-ev-info">
            <div class="cal-ev-title">${ev.customTitle || typeLabel[ev.type]||ev.type}</div>
            <div class="cal-ev-sub">
              ${timeStr ? `<span class="cal-ev-time">${timeStr}</span>` : ''}
              ${isSched ? `<span class="cal-ev-sched-badge">Zaplanowane</span>` : ''}
              <span>${pName}</span>
            </div>
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

// ───── SPECIES KNOWLEDGE BASE ─────
function renderSpeciesList() {
  const container = document.getElementById('species-list-container');
  if (!container) return;
  if (S.species.length === 0) {
    container.innerHTML = '<div style="color:var(--text3); font-size:13px;">Brak dodanych gatunków.</div>';
    return;
  }
  container.innerHTML = S.species.map(s => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; position: relative;">
      <div style="font-weight: 500; font-size: 14px; color: var(--text1); margin-bottom: 4px; padding-right: 50px;">${s.name}</div>
      <div style="font-size: 13px; color: var(--text2); line-height: 1.4; white-space: pre-wrap;">${s.description}</div>
      <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
        <button class="btn-edit-species" data-sid="${s.id}" style="background: none; border: none; color: var(--accent); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px;" title="Edytuj">${icon('edit-2', 14)}</button>
        <button class="btn-delete-species" data-sid="${s.id}" style="background: none; border: none; color: var(--danger); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px;" title="Usuń">${icon('trash-2', 14)}</button>
      </div>
    </div>
  `).join('');
  renderIcons();
}

function addSpecies() {
  const nameInput = document.getElementById('species-name-input');
  const descInput = document.getElementById('species-desc-input');
  const name = nameInput.value.trim();
  const desc = descInput.value.trim();
  const btn = document.getElementById('btn-add-species');
  if (!name) { toast('Podaj nazwę gatunku', true); return; }
  if (!desc) { toast('Podaj opis gatunku', true); return; }

  if (S.editingSpeciesId) {
    const sp = S.species.find(s => s.id === S.editingSpeciesId);
    if (sp) { sp.name = name; sp.description = desc; }
    toast('✓ Zmiany zapisane');
    S.editingSpeciesId = null;
    btn.innerHTML = icon('plus') + ' Dodaj gatunek';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
  } else {
    S.species.push({ id: uid(), name, description: desc });
    toast('✓ Gatunek dodany do Bazy Wiedzy');
  }
  
  save();
  nameInput.value = '';
  descInput.value = '';
  renderSpeciesList();
}

// ───── BACKUP / EXPORT / IMPORT ─────
function exportData() {
  const data = localStorage.getItem(CFG.STORE) || '{}';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `plant_tracker_backup_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Dane wyeksportowane');
}

function handleImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const txt = ev.target.result;
      JSON.parse(txt); // Validate JSON
      localStorage.setItem(CFG.STORE, txt);
      load();
      renderPlants();
      renderTimeline();
      renderCalendar();
      updateStats();
      toast('✓ Dane zaimportowane pomyślnie!');
    } catch(err) {
      toast('Błąd formatu pliku', true);
    }
    e.target.value = ''; // Reset input
  };
  reader.readAsText(file);
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
  renderEventChart();
  renderGrowthChart();
  renderPlantsTable();
}

function renderEventChart() {
  const canvas = document.getElementById('chart-events');
  if (!canvas || !window.Chart) return;
  const filters = Array.from(document.querySelectorAll('#events-chart-filters input:checked')).map(el => el.value);
  const evs = S.events.filter(e => filters.includes(e.type));
  const counts = {};
  filters.forEach(f => counts[f] = 0);
  evs.forEach(e => counts[e.type]++);

  const labelsMap = { water:'Podlewanie', fertilize:'Nawożenie', harvest:'Zbiory', plant:'Sadzenie', custom:'Inne' };
  const colorsMap = { water:'#38bdf8', fertilize:'#a3e635', harvest:'#fb923c', plant:'#a78bfa', custom:'#f472b6' };

  const labels = filters.map(f => labelsMap[f]);
  const data = filters.map(f => counts[f]);
  const bgColors = filters.map(f => colorsMap[f]);

  if (S.charts.events) S.charts.events.destroy();
  if (evs.length === 0) {
    S.charts.events = new Chart(canvas, {
      type: 'doughnut',
      data: { labels: ['Brak'], datasets: [{ data: [1], backgroundColor: ['#3f3f46'], borderWidth:0 }] },
      options: { cutout: '80%', plugins: { tooltip: { enabled: false } } }
    });
    return;
  }
  S.charts.events = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: bgColors, borderWidth: 0, hoverOffset: 4 }] },
    options: {
      responsive: true,
      cutout: '80%',
      layout: { padding: 10 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleFont: { family: 'Inter', size: 13 },
          bodyFont: { family: 'Inter', size: 13 },
          padding: 10,
          cornerRadius: 8,
          displayColors: true
        }
      }
    }
  });
}

function renderWaterChart() {
  const canvas = document.getElementById('chart-waterings');
  if (!canvas || !window.Chart) return;
  
  const ctx = canvas.getContext('2d');
  const gradW = ctx.createLinearGradient(0, 0, 0, 300);
  gradW.addColorStop(0, 'rgba(56,189,248,0.5)');
  gradW.addColorStop(1, 'rgba(56,189,248,0.0)');
  
  const gradF = ctx.createLinearGradient(0, 0, 0, 300);
  gradF.addColorStop(0, 'rgba(163,230,53,0.4)');
  gradF.addColorStop(1, 'rgba(163,230,53,0.0)');

  const labels=[], wData=[], fData=[];
  for (let i=29;i>=0;i--) {
    const d=new Date(); d.setDate(d.getDate()-i);
    labels.push(d.toLocaleDateString('pl-PL',{day:'numeric',month:'short'}));
    wData.push(S.events.filter(e=>e.type==='water'&&sameDay(e.timestamp,d)).length);
    fData.push(S.events.filter(e=>e.type==='fertilize'&&sameDay(e.timestamp,d)).length);
  }

  if (S.charts.water) S.charts.water.destroy();
  S.charts.water = new Chart(canvas, {
    type:'line',
    data:{
      labels,
      datasets:[
        { label:'Podlewanie', data:wData, backgroundColor:gradW, borderColor:'#38bdf8', borderWidth:2, fill:true, tension:0.4, pointRadius:0, pointHitRadius:10 },
        { label:'Nawożenie', data:fData, backgroundColor:gradF, borderColor:'#a3e635', borderWidth:2, fill:true, tension:0.4, pointRadius:0, pointHitRadius:10 }
      ]
    },
    options:{
      responsive:true,
      interaction: { mode: 'index', intersect: false },
      plugins:{
        legend:{ position: 'top', labels:{color:'#A1A1AA',font:{family:'Inter',size:12}, usePointStyle: true, boxWidth: 8} },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8 }
      },
      scales:{
        x:{ ticks:{color:'#71717A',font:{size:10},maxRotation:45}, grid:{display:false} },
        y:{ ticks:{color:'#71717A',stepSize:1}, grid:{color:'rgba(255,255,255,0.05)', drawBorder:false}, beginAtZero:true }
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
    canvas.parentElement.innerHTML='<div style="color:var(--text3);font-size:13px;text-align:center;padding:20px">Brak danych o plonach</div>';
    return;
  }

  if (S.charts.harvest) S.charts.harvest.destroy();
  const colors=['#fb923c','#4ade80','#38bdf8','#a78bfa','#fbbf24'];

  S.charts.harvest = new Chart(canvas,{
    type:'bar',
    data:{labels,datasets:[{data,backgroundColor:colors.slice(0,labels.length), borderRadius: 4, barThickness: 16}]},
    options:{
      indexAxis: 'y',
      responsive:true,
      plugins:{
        legend:{display:false},
        tooltip:{ backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, callbacks:{label:ctx=>` ${ctx.parsed.x.toFixed(2)} kg`} }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#71717A' } },
        y: { grid: { display: false }, ticks: { color: '#A1A1AA', font: { family: 'Inter', size: 12 } } }
      }
    }
  });
}

function renderGrowthChart() {
  const canvas = document.getElementById('chart-growth');
  if (!canvas || !window.Chart) return;

  const labels=[], data=[];
  for (let i=5;i>=0;i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    labels.push(d.toLocaleDateString('pl-PL',{month:'short', year:'numeric'}));
    
    const count = S.plants.filter(p => {
      if (!p.createdAt && !p.planted) return false;
      const pd = new Date(p.planted || p.createdAt);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
    }).length;
    data.push(count);
  }

  if (S.charts.growth) S.charts.growth.destroy();
  S.charts.growth = new Chart(canvas, {
    type:'bar',
    data:{
      labels,
      datasets:[{ label:'Nowe rośliny', data, backgroundColor:'#a78bfa', borderRadius: 4, barThickness: 24 }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{ display:false },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8 }
      },
      scales:{
        x:{ ticks:{color:'#71717A',font:{size:10}}, grid:{display:false} },
        y:{ ticks:{color:'#71717A',stepSize:1}, grid:{color:'rgba(255,255,255,0.05)', drawBorder:false}, beginAtZero:true }
      }
    }
  });
}

function renderPlantsTable() {
  const tbody = document.querySelector('#plants-table tbody');
  if (!tbody) return;
  
  if (S.plants.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text3)">Brak roślin w kolekcji</td></tr>';
    return;
  }
  
  const locLabels = { balkon:'Balkon', parapet:'Parapet', polka:'Półka', okno:'Okno' };

  tbody.innerHTML = S.plants.map(p => {
    const wEvs = S.events.filter(e => e.plantId === p.id && e.type === 'water').sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
    const days = daysAgo(wEvs[0]?.timestamp);
    
    let statusHtml = '<span class="table-status ok">Zadbana</span>';
    if (days !== null && days >= p.waterFreq) {
      statusHtml = '<span class="table-status danger">Wymaga uwagi</span>';
    } else if (days !== null && days >= p.waterFreq - 1) {
      statusHtml = '<span class="table-status warn">Wkrótce</span>';
    } else if (days === null) {
      statusHtml = '<span class="table-status warn">Brak danych</span>';
    }
    
    return `
      <tr>
        <td style="font-weight:500; color:var(--text1)">${p.name}</td>
        <td>${locLabels[p.location] || p.location}</td>
        <td>${statusHtml}</td>
      </tr>
    `;
  }).join('');
}

// ───── NAVIGATION ─────
function switchView(name, fromPop = false) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(`view-${name}`)?.classList.add('active');
  document.querySelector(`.nav-btn[data-view="${name}"]`)?.classList.add('active');
  S.view = name;

  if (name==='timeline')  renderTimeline();
  if (name==='calendar')  renderCalendar();
  if (name==='stats')     renderCharts();
  if (name==='finances')  renderFinances();
  if (name==='settings')  renderPriceRulesList();

  renderIcons();

  if (!fromPop) {
    history.pushState({ view: name, modal: false }, '');
  }
}

// ───── GROUP TOGGLE HELPER ─────
function setGroupActive(groupId, value) {
  document.querySelectorAll(`#${groupId} .btn-toggle`).forEach(b => {
    b.classList.toggle('active', b.dataset.value === value);
  });
}

// ───── IMAGE HANDLING ─────
// ───── IMAGE CROP ─────
const cropState = {
  imgSrc: null,
  imgW: 0, imgH: 0,
  containerW: 0, containerH: 0,
  zoom: 1, minZoom: 1,
  offsetX: 0, offsetY: 0,
  dragging: false, dragStartX: 0, dragStartY: 0,
  startOffX: 0, startOffY: 0,
  targetPreviewId: null,
  pinchDist: 0
};

function openCropModal(imgDataUrl, previewId) {
  cropState.imgSrc = imgDataUrl;
  cropState.targetPreviewId = previewId;

  const cropImg = document.getElementById('crop-image');
  cropImg.src = imgDataUrl;

  cropImg.onload = () => {
    cropState.imgW = cropImg.naturalWidth;
    cropState.imgH = cropImg.naturalHeight;

    const container = document.getElementById('crop-container');
    cropState.containerW = container.offsetWidth;
    cropState.containerH = container.offsetHeight;

    // Fit image so it covers the container (cover logic)
    const ratioW = cropState.containerW / cropState.imgW;
    const ratioH = cropState.containerH / cropState.imgH;
    cropState.minZoom = Math.max(ratioW, ratioH);
    cropState.zoom = cropState.minZoom;

    // Center
    cropState.offsetX = (cropState.containerW - cropState.imgW * cropState.zoom) / 2;
    cropState.offsetY = (cropState.containerH - cropState.imgH * cropState.zoom) / 2;

    // Update zoom slider
    const slider = document.getElementById('crop-zoom');
    slider.min = Math.round(cropState.minZoom * 100);
    slider.max = Math.round(cropState.minZoom * 500);
    slider.value = Math.round(cropState.zoom * 100);

    updateCropImage();
  };

  openModal('modal-crop');
  renderIcons();
}

function updateCropImage() {
  const img = document.getElementById('crop-image');
  img.style.transform = `translate(${cropState.offsetX}px, ${cropState.offsetY}px) scale(${cropState.zoom})`;
}

function clampCropOffset() {
  const sw = cropState.imgW * cropState.zoom;
  const sh = cropState.imgH * cropState.zoom;
  const cw = cropState.containerW;
  const ch = cropState.containerH;

  // Don't allow gaps: image must fully cover the viewport
  if (sw >= cw) {
    cropState.offsetX = Math.min(0, Math.max(cw - sw, cropState.offsetX));
  } else {
    cropState.offsetX = (cw - sw) / 2;
  }
  if (sh >= ch) {
    cropState.offsetY = Math.min(0, Math.max(ch - sh, cropState.offsetY));
  } else {
    cropState.offsetY = (ch - sh) / 2;
  }
}

function setCropZoom(newZoom, pivotX, pivotY) {
  const oldZoom = cropState.zoom;
  cropState.zoom = Math.max(cropState.minZoom, Math.min(cropState.minZoom * 5, newZoom));

  // Zoom towards pivot
  if (pivotX !== undefined && pivotY !== undefined) {
    cropState.offsetX = pivotX - (pivotX - cropState.offsetX) * (cropState.zoom / oldZoom);
    cropState.offsetY = pivotY - (pivotY - cropState.offsetY) * (cropState.zoom / oldZoom);
  }

  clampCropOffset();
  updateCropImage();

  document.getElementById('crop-zoom').value = Math.round(cropState.zoom * 100);
}

function confirmCrop() {
  const canvas = document.createElement('canvas');
  const size = 800; // output size
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Calculate which part of the original image is visible in the viewport
  const sx = -cropState.offsetX / cropState.zoom;
  const sy = -cropState.offsetY / cropState.zoom;
  const sWidth = cropState.containerW / cropState.zoom;
  const sHeight = cropState.containerH / cropState.zoom;

  const img = document.getElementById('crop-image');
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  const preview = document.getElementById(cropState.targetPreviewId);
  preview.innerHTML = `<img src="${dataUrl}" />`;

  closeModal('modal-crop');
}

function initCropListeners() {
  const container = document.getElementById('crop-container');

  // Mouse drag
  container.addEventListener('mousedown', e => {
    e.preventDefault();
    cropState.dragging = true;
    cropState.dragStartX = e.clientX;
    cropState.dragStartY = e.clientY;
    cropState.startOffX = cropState.offsetX;
    cropState.startOffY = cropState.offsetY;
  });

  window.addEventListener('mousemove', e => {
    if (!cropState.dragging) return;
    cropState.offsetX = cropState.startOffX + (e.clientX - cropState.dragStartX);
    cropState.offsetY = cropState.startOffY + (e.clientY - cropState.dragStartY);
    clampCropOffset();
    updateCropImage();
  });

  window.addEventListener('mouseup', () => {
    cropState.dragging = false;
  });

  // Touch drag + pinch zoom
  container.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      cropState.dragging = true;
      cropState.dragStartX = e.touches[0].clientX;
      cropState.dragStartY = e.touches[0].clientY;
      cropState.startOffX = cropState.offsetX;
      cropState.startOffY = cropState.offsetY;
    } else if (e.touches.length === 2) {
      cropState.dragging = false;
      cropState.pinchDist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      cropState._pinchStartZoom = cropState.zoom;
    }
  }, { passive: true });

  container.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && cropState.dragging) {
      cropState.offsetX = cropState.startOffX + (e.touches[0].clientX - cropState.dragStartX);
      cropState.offsetY = cropState.startOffY + (e.touches[0].clientY - cropState.dragStartY);
      clampCropOffset();
      updateCropImage();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      const scale = dist / cropState.pinchDist;
      const rect = container.getBoundingClientRect();
      const pivotX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
      const pivotY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
      setCropZoom(cropState._pinchStartZoom * scale, pivotX, pivotY);
    }
  }, { passive: false });

  container.addEventListener('touchend', () => {
    cropState.dragging = false;
  });

  // Mouse wheel zoom
  container.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const pivotX = e.clientX - rect.left;
    const pivotY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setCropZoom(cropState.zoom * delta, pivotX, pivotY);
  }, { passive: false });

  // Zoom slider
  document.getElementById('crop-zoom').addEventListener('input', e => {
    const cw = cropState.containerW / 2;
    const ch = cropState.containerH / 2;
    setCropZoom(parseInt(e.target.value) / 100, cw, ch);
  });

  // Zoom buttons
  document.getElementById('crop-zoom-in').addEventListener('click', () => {
    const cw = cropState.containerW / 2;
    const ch = cropState.containerH / 2;
    setCropZoom(cropState.zoom * 1.25, cw, ch);
  });
  document.getElementById('crop-zoom-out').addEventListener('click', () => {
    const cw = cropState.containerW / 2;
    const ch = cropState.containerH / 2;
    setCropZoom(cropState.zoom * 0.8, cw, ch);
  });

  // Confirm crop
  document.getElementById('btn-crop-confirm').addEventListener('click', confirmCrop);
}

function bindPhotoInput(inputId, previewId) {
  document.getElementById(inputId).addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      openCropModal(ev.target.result, previewId);
    };
    reader.readAsDataURL(file);
    // Reset so re-picking the same file triggers change again
    e.target.value = '';
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

// ───── FINANCES & PRICING ─────
function calculatePlantValue(plant) {
  let val = { base: 0, yields: 0, total: 0 };
  if (!plant.species) return val;

  const rules = S.priceRules.filter(r => r.speciesId === plant.species);
  if (rules.length === 0) return val;

  // Wzrost (Interpolacja liniowa)
  const hRules = rules.filter(r => r.type === 'height').sort((a,b) => a.threshold - b.threshold);
  const hEvents = S.events.filter(e => e.plantId === plant.id && e.type === 'height').sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  const currentHeight = hEvents.length > 0 ? hEvents[0].height : 0;

  if (hRules.length > 0) {
    if (currentHeight <= hRules[0].threshold) {
      val.base = (currentHeight / hRules[0].threshold) * hRules[0].price;
    } else if (currentHeight >= hRules[hRules.length-1].threshold) {
      val.base = hRules[hRules.length-1].price;
    } else {
      for (let i = 0; i < hRules.length - 1; i++) {
        if (currentHeight >= hRules[i].threshold && currentHeight <= hRules[i+1].threshold) {
          const r1 = hRules[i], r2 = hRules[i+1];
          const factor = (currentHeight - r1.threshold) / (r2.threshold - r1.threshold);
          val.base = r1.price + factor * (r2.price - r1.price);
          break;
        }
      }
    }
  }

  // Plony (Sztuki i Kg)
  const qtyRules = rules.filter(r => r.type === 'quantity');
  const wgtRules = rules.filter(r => r.type === 'weight');
  const harvests = S.events.filter(e => e.plantId === plant.id && e.type === 'harvest');
  const totalQty = harvests.reduce((s,e) => s + (e.quantity||0), 0);
  const totalWgt = harvests.reduce((s,e) => s + (e.weight||0), 0);

  if (qtyRules.length > 0) val.yields += totalQty * (qtyRules[0].price / (qtyRules[0].threshold || 1));
  if (wgtRules.length > 0) val.yields += totalWgt * (wgtRules[0].price / (wgtRules[0].threshold || 1));

  // Sadzonki
  const cutRules = rules.filter(r => r.type === 'cutting');
  const cuttings = S.events.filter(e => e.plantId === plant.id && e.type === 'cutting');
  const totalCut = cuttings.reduce((s,e) => s + (e.quantity||0), 0);

  if (cutRules.length > 0) val.yields += totalCut * (cutRules[0].price / (cutRules[0].threshold || 1));

  val.total = val.base + val.yields;
  return val;
}

function calculatePlantValueAtDate(plant, timestamp) {
  let val = { base: 0, yields: 0, total: 0 };
  if (!plant.species) return val;

  const rules = S.priceRules.filter(r => r.speciesId === plant.species);
  if (rules.length === 0) return val;

  const hRules = rules.filter(r => r.type === 'height').sort((a,b) => a.threshold - b.threshold);
  const hEvents = S.events.filter(e => e.plantId === plant.id && e.type === 'height' && new Date(e.timestamp).getTime() <= timestamp).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
  const currentHeight = hEvents.length > 0 ? hEvents[0].height : 0;

  if (hRules.length > 0) {
    if (currentHeight <= hRules[0].threshold) {
      val.base = (currentHeight / hRules[0].threshold) * hRules[0].price;
    } else if (currentHeight >= hRules[hRules.length-1].threshold) {
      val.base = hRules[hRules.length-1].price;
    } else {
      for (let i = 0; i < hRules.length - 1; i++) {
        if (currentHeight >= hRules[i].threshold && currentHeight <= hRules[i+1].threshold) {
          const r1 = hRules[i], r2 = hRules[i+1];
          const factor = (currentHeight - r1.threshold) / (r2.threshold - r1.threshold);
          val.base = r1.price + factor * (r2.price - r1.price);
          break;
        }
      }
    }
  }

  const qtyRules = rules.filter(r => r.type === 'quantity');
  const wgtRules = rules.filter(r => r.type === 'weight');
  const harvests = S.events.filter(e => e.plantId === plant.id && e.type === 'harvest' && new Date(e.timestamp).getTime() <= timestamp);
  const totalQty = harvests.reduce((s,e) => s + (e.quantity||0), 0);
  const totalWgt = harvests.reduce((s,e) => s + (e.weight||0), 0);

  if (qtyRules.length > 0) val.yields += totalQty * (qtyRules[0].price / (qtyRules[0].threshold || 1));
  if (wgtRules.length > 0) val.yields += totalWgt * (wgtRules[0].price / (wgtRules[0].threshold || 1));

  const cutRules = rules.filter(r => r.type === 'cutting');
  const cuttings = S.events.filter(e => e.plantId === plant.id && e.type === 'cutting' && new Date(e.timestamp).getTime() <= timestamp);
  const totalCut = cuttings.reduce((s,e) => s + (e.quantity||0), 0);

  if (cutRules.length > 0) val.yields += totalCut * (cutRules[0].price / (cutRules[0].threshold || 1));

  val.total = val.base + val.yields;
  return val;
}

function renderFinances() {
  const tVal = document.getElementById('fin-total-value');
  const tExp = document.getElementById('fin-total-expenses');
  const tBal = document.getElementById('fin-net-balance');
  const vTable = document.querySelector('#valuation-table tbody');
  const eTable = document.querySelector('#expenses-table tbody');
  const searchInput = document.getElementById('valuation-search');
  if (!tVal || !vTable) return;

  const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';

  // Wycena
  let totalValue = 0;
  const valuationRows = S.plants.map(p => {
    const v = calculatePlantValue(p);
    totalValue += v.total;
    if (v.total === 0) return '';
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery)) return '';
    return `<tr>
      <td style="font-weight:500;">${p.name}</td>
      <td>${v.base.toFixed(2)} zł</td>
      <td>${v.yields.toFixed(2)} zł</td>
      <td style="color:var(--harvest);font-weight:600;">${v.total.toFixed(2)} zł</td>
    </tr>`;
  }).filter(Boolean).join('');
  vTable.innerHTML = valuationRows || '<tr><td colspan="4" style="text-align:center;color:var(--text3)">Brak danych o wartości</td></tr>';

  // Wydatki
  let totalExpenses = 0;
  S.expenses.sort((a,b) => new Date(b.date) - new Date(a.date));
  eTable.innerHTML = S.expenses.map(e => {
    totalExpenses += e.amount;
    const p = e.plantId ? S.plants.find(x => x.id === e.plantId) : null;
    return `<tr>
      <td>${fmtDate(e.date)}</td>
      <td style="font-weight:500;">${e.title}</td>
      <td style="color:var(--danger);">- ${e.amount.toFixed(2)} zł</td>
      <td>${p ? p.name : '—'}</td>
      <td style="text-align:right;">
        <button class="btn-delete-expense" data-eid="${e.id}" style="background:none;border:none;color:var(--danger);cursor:pointer;">${icon('trash-2',14)}</button>
      </td>
    </tr>`;
  }).join('');
  if (S.expenses.length === 0) eTable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text3)">Brak wydatków</td></tr>';

  // Stats
  tVal.textContent = totalValue.toFixed(2) + ' zł';
  tExp.textContent = totalExpenses.toFixed(2) + ' zł';
  
  const balance = totalValue - totalExpenses;
  tBal.textContent = balance.toFixed(2) + ' zł';
  tBal.style.color = balance >= 0 ? 'var(--harvest)' : 'var(--danger)';
  
  document.querySelectorAll('.btn-delete-expense').forEach(b => {
    b.addEventListener('click', (e) => {
      const eid = e.currentTarget.dataset.eid;
      if (confirm('Usunąć wydatek?')) {
        S.expenses = S.expenses.filter(x => x.id !== eid);
        save();
        renderFinances();
        toast('Wydatek usunięty');
      }
    });
  });

  renderIcons();

  if (!window.Chart) return;
  
  // Wykres 1: Wartość vs Koszt (Zysk vs Koszt w czasie)
  const chartFC = document.getElementById('chart-fin-profit-cost');
  if (chartFC) {
    const labels = [];
    const profitData = [];
    const costData = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }));
      
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
      
      let mCost = 0;
      S.expenses.forEach(ex => {
        const t = new Date(ex.date).getTime();
        if (t <= mEnd) mCost += ex.amount;
      });
      costData.push(mCost);
      
      let mProfit = 0;
      S.plants.forEach(p => {
        const v = calculatePlantValueAtDate(p, mEnd);
        mProfit += v.total;
      });
      profitData.push(mProfit);
    }
    
    if (S.charts.finProfitCost) S.charts.finProfitCost.destroy();
    S.charts.finProfitCost = new Chart(chartFC, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Skumulowana Wartość', data: profitData, borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 2, fill: true, tension: 0.4 },
          { label: 'Skumulowane Wydatki', data: costData, borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 2, fill: true, tension: 0.4 }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#A1A1AA', font: { family: 'Inter', size: 12 } } },
          tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8 }
        },
        scales: {
          x: { ticks: { color: '#71717A' }, grid: { display: false } },
          y: { ticks: { color: '#71717A' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
        }
      }
    });
  }

  // Wykres 2: Wzrost w czasie
  const chartFH = document.getElementById('chart-fin-height');
  if (chartFH) {
    const heightEvs = S.events.filter(e => e.type === 'height').sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (heightEvs.length > 0) {
      const plantCounts = {};
      heightEvs.forEach(e => { plantCounts[e.plantId] = (plantCounts[e.plantId] || 0) + 1; });
      const topPlants = Object.keys(plantCounts).sort((a,b) => plantCounts[b] - plantCounts[a]).slice(0, 3);
      
      const allTimestamps = [...new Set(heightEvs.filter(e => topPlants.includes(e.plantId)).map(e => new Date(e.timestamp).toLocaleDateString('pl-PL', { day:'numeric', month:'short'})))];
      
      const colors = ['#38bdf8', '#a78bfa', '#fbbf24'];
      const datasets = topPlants.map((pid, idx) => {
        const p = S.plants.find(x => x.id === pid);
        const pEvs = heightEvs.filter(e => e.plantId === pid);
        const data = allTimestamps.map(tsLabel => {
          const ev = pEvs.slice().reverse().find(e => new Date(e.timestamp).toLocaleDateString('pl-PL', { day:'numeric', month:'short'}) === tsLabel);
          return ev ? ev.height : null;
        });
        
        let lastVal = null;
        const filledData = data.map(v => {
          if (v !== null) lastVal = v;
          return lastVal;
        });

        return {
          label: p ? p.name : 'Nieznana',
          data: filledData,
          borderColor: colors[idx],
          backgroundColor: colors[idx],
          borderWidth: 2,
          tension: 0.3,
          spanGaps: true
        };
      });

      if (S.charts.finHeight) S.charts.finHeight.destroy();
      S.charts.finHeight = new Chart(chartFH, {
        type: 'line',
        data: { labels: allTimestamps, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: '#A1A1AA', font: { family: 'Inter', size: 12 } } },
            tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, callbacks: { label: ctx => ` ${ctx.parsed.y} cm` } }
          },
          scales: {
            x: { ticks: { color: '#71717A' }, grid: { display: false } },
            y: { ticks: { color: '#71717A' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
          }
        }
      });
    } else {
      if (S.charts.finHeight) S.charts.finHeight.destroy();
      S.charts.finHeight = new Chart(chartFH, {
        type: 'line',
        data: { labels: ['Brak pomiarów'], datasets: [] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: false } } }
      });
    }
  }
}


function renderPriceRulesList() {
  const sel = document.getElementById('price-rule-species');
  if (sel) {
    sel.innerHTML = '<option value="">-- Wybierz gatunek --</option>' + 
      S.species.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }

  const container = document.getElementById('price-rules-list-container');
  if (!container) return;
  if (S.priceRules.length === 0) {
    container.innerHTML = '<div style="color:var(--text3); font-size:13px;">Brak zdefiniowanych cen.</div>';
    return;
  }
  
  const typeMap = { height: 'Wzrost (cm)', weight: 'Plon (kg)', quantity: 'Plon (szt.)', cutting: 'Sadzonka (szt.)' };

  container.innerHTML = S.priceRules.map(r => {
    const s = S.species.find(x => x.id === r.speciesId);
    return `<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 500; font-size: 14px; color: var(--text1);">${s ? s.name : '?'}</div>
        <div style="font-size: 13px; color: var(--text2);">${typeMap[r.type]}: ${r.threshold} = <span style="color:var(--harvest);font-weight:600;">${r.price} zł</span></div>
      </div>
      <button class="btn-delete-pricerule" data-rid="${r.id}" style="background: none; border: none; color: var(--danger); cursor: pointer;" title="Usuń">${icon('trash-2', 14)}</button>
    </div>`;
  }).join('');
  renderIcons();
}

function addPriceRule() {
  const speciesId = document.getElementById('price-rule-species').value;
  const type = document.getElementById('price-rule-type').value;
  const threshold = parseFloat(document.getElementById('price-rule-threshold').value);
  const price = parseFloat(document.getElementById('price-rule-price').value);

  if (!speciesId || isNaN(threshold) || isNaN(price)) { toast('Wypełnij wszystkie pola', true); return; }

  S.priceRules.push({ id: uid(), speciesId, type, threshold, price });
  save();
  renderPriceRulesList();
  toast('Reguła cenowa dodana');
  document.getElementById('price-rule-threshold').value = '';
  document.getElementById('price-rule-price').value = '';
}

// ───── INIT ─────
function init() {
  load();
  registerSW();
  history.replaceState({ view: 'home', modal: false }, '');

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
      if (actionBtn.dataset.action === 'custom')    openCustomModal(plantId);
      return;
    }
    const card = e.target.closest('.plant-card');
    if (card?.dataset.plantId) openPlantDetail(card.dataset.plantId);
  });

  // Timeline clicks -> delete event or open plant detail
  document.getElementById('timeline-container').addEventListener('click', e => {
    const delBtn = e.target.closest('.tl-delete-btn');
    if (delBtn) {
      e.stopPropagation();
      const evId = delBtn.dataset.evId;
      if (confirm('Usunąć to zdarzenie?')) {
        S.events = S.events.filter(ev => ev.id !== evId);
        save();
        renderTimeline();
        renderPlants();
        updateStats();
        toast('Zdarzenie usunięte');
      }
      return;
    }
    const tlItem = e.target.closest('.tl-item');
    if (tlItem && tlItem.dataset.plantId) {
      openPlantDetail(tlItem.dataset.plantId);
    }
  });

  // Empty state button (outside grid)
  document.getElementById('btn-empty-add')?.addEventListener('click', (e) => { e.preventDefault(); openPlantModal(); });

  // Add plant button
  document.getElementById('btn-add-plant').addEventListener('click', (e) => { e.preventDefault(); openPlantModal(); });

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

  // Settings tabs
  document.getElementById('settings-tabs')?.addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('#settings-tabs .filter-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(`settings-tab-${tab.dataset.tab}`)?.classList.remove('hidden');
  });

  document.getElementById('sort-plants')?.addEventListener('change', e => {
    S.sortOrder = e.target.value;
    renderPlants();
  });
  document.getElementById('timeline-plant-filter')?.addEventListener('change', e => {
    S.timelinePlant = e.target.value;
    renderTimeline();
  });
  document.getElementById('cal-plant-filter')?.addEventListener('change', e => {
    S.calPlant = e.target.value;
    renderCalendar();
    renderCalEvents();
  });
  document.getElementById('events-chart-filters')?.addEventListener('change', renderEventChart);

  document.getElementById('events-chart-filters')?.addEventListener('change', renderEventChart);

  // Notifications (now in settings)
  document.getElementById('btn-notif')?.addEventListener('click', (e) => { e.preventDefault(); requestNotifPermission(); });

  // Plant modal: save
  document.getElementById('btn-save-plant').addEventListener('click', (e) => { e.preventDefault(); savePlant(); });

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
  document.getElementById('btn-save-water').addEventListener('click', (e) => { e.preventDefault(); saveWatering(); });

  // Water modal: type toggle
  document.getElementById('water-type-group').addEventListener('click', e => {
    const btn = e.target.closest('.btn-toggle');
    if (!btn) return;
    setGroupActive('water-type-group', btn.dataset.value);
    document.getElementById('fertilizer-group').classList.toggle('hidden', btn.dataset.value !== 'fertilize');
  });

  // Harvest modal: save
  document.getElementById('btn-save-harvest').addEventListener('click', (e) => { e.preventDefault(); saveHarvest(); });
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
    if (act === 'custom')    { closeModal('modal-detail'); openCustomModal(pid); }
    if (act === 'edit')      { closeModal('modal-detail'); openPlantModal(pid); }
    if (act === 'cutting')   { closeModal('modal-detail'); openCuttingModal(pid); }
    if (act === 'height')    { closeModal('modal-detail'); openHeightModal(pid); }
    if (act === 'delete')    { deletePlant(pid); }
  });

  // All modal close buttons (data-modal attribute)
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-modal]');
    if (btn) closeModal(btn.dataset.modal);
  });

  // Click outside  // Modals close button
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      closeModal(e.target.closest('.modal-close').dataset.modal);
    });
  });

  // Click outside modal to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // Notifications
  document.getElementById('btn-notif').addEventListener('click', requestNotifPermission);

  // Bulk Logic
  document.getElementById('btn-bulk-action')?.addEventListener('click', openBulkModal);
  document.getElementById('btn-save-bulk').addEventListener('click', saveBulkAction);
  
  document.getElementById('btn-bulk-select-all')?.addEventListener('click', (e) => {
    e.preventDefault();
    const cbs = document.querySelectorAll('.bulk-cb');
    const allChecked = Array.from(cbs).every(cb => cb.checked);
    cbs.forEach(cb => {
      cb.checked = !allChecked;
      const item = cb.closest('.bulk-plant-item');
      if (item) {
        item.style.borderColor = cb.checked ? 'var(--accent)' : 'rgba(255,255,255,0.07)';
        item.style.background = cb.checked ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.03)';
      }
    });
  });

  document.getElementById('bulk-type-group').addEventListener('click', e => {
    const btn = e.target.closest('.btn-toggle');
    if (!btn) return;
    setGroupActive('bulk-type-group', btn.dataset.value);
    document.getElementById('bulk-fertilizer-group').classList.toggle('hidden', btn.dataset.value !== 'fertilize');
    document.getElementById('bulk-custom-group').classList.toggle('hidden', btn.dataset.value !== 'custom');
  });

  // Height & Cutting & Expense
  document.getElementById('btn-save-height')?.addEventListener('click', (e) => { e.preventDefault(); saveHeight(); });
  document.getElementById('btn-save-cutting')?.addEventListener('click', (e) => { e.preventDefault(); saveCutting(); });
  document.getElementById('btn-add-expense')?.addEventListener('click', (e) => { e.preventDefault(); openExpenseModal(); });
  document.getElementById('btn-save-expense')?.addEventListener('click', (e) => { e.preventDefault(); saveExpense(); });
  document.getElementById('valuation-search')?.addEventListener('input', renderFinances);

  // Price Rules
  document.getElementById('btn-add-price-rule')?.addEventListener('click', (e) => { e.preventDefault(); addPriceRule(); });
  document.getElementById('price-rules-list-container')?.addEventListener('click', e => {
    const btn = e.target.closest('.btn-delete-pricerule');
    if (btn) {
      S.priceRules = S.priceRules.filter(r => r.id !== btn.dataset.rid);
      save();
      renderPriceRulesList();
      toast('Reguła usunięta');
    }
  });

  // Custom event modal: save
  document.getElementById('btn-save-custom').addEventListener('click', (e) => { e.preventDefault(); saveCustom(); });

  // Species Knowledge Base
  document.getElementById('btn-add-species')?.addEventListener('click', addSpecies);
  document.getElementById('species-list-container')?.addEventListener('click', e => {
    const btn = e.target.closest('.btn-delete-species');
    if (btn) {
      if (confirm('Usunąć ten gatunek z Bazy Wiedzy?')) {
        S.species = S.species.filter(s => s.id !== btn.dataset.sid);
        save();
        renderSpeciesList();
        renderPlants();
        toast('Gatunek usunięty');
      }
    }
  });
  renderSpeciesList();

  // Backup
  document.getElementById('btn-export-data').addEventListener('click', exportData);
  document.getElementById('import-data-file').addEventListener('change', handleImport);

  // AI forecast
  document.getElementById('btn-apply-ai-forecast').addEventListener('click', applyAiForecast);
  document.getElementById('ai-forecast-file').addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { document.getElementById('ai-forecast-text').value = ev.target.result; };
    reader.readAsText(file);
  });

  // Image crop modal listeners
  initCropListeners();

  // Render initial icons
  renderIcons();

  // Periodic schedule check
  checkScheduled();
  setInterval(checkScheduled, 3600000);

  console.log('Plant Tracker initialized ✓');
}

document.addEventListener('DOMContentLoaded', init);
