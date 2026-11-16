(() => {
  'use strict';

  const STORAGE_KEY = 'coc7e_investigator_v1';
  const SCHEMA_VERSION = 1;

  const CHARACTERISTICS = [
    { key: 'FOR', name: 'Força' },
    { key: 'CON', name: 'Constituição' },
    { key: 'TAM', name: 'Tamanho' },
    { key: 'DES', name: 'Destreza' },
    { key: 'APA', name: 'Aparência' },
    { key: 'INT', name: 'Inteligência' },
    { key: 'POD', name: 'Poder' },
    { key: 'EDU', name: 'Educação' },
  ];

  // Canonical-ish CoC 7e (1920s) PT-BR skill catalog. Verify/adjust against reference PDF if needed.
  const SKILL_CATALOG = [
    { id: 'antropologia', name: 'Antropologia', base: 1 },
    { id: 'arqueologia', name: 'Arqueologia', base: 1 },
    { id: 'armas_fogo_pistola', name: 'Armas de Fogo (Pistola)', base: 20, combat: true },
    { id: 'armas_fogo_rifle', name: 'Armas de Fogo (Rifle/Espingarda)', base: 25, combat: true },
    { id: 'arremessar', name: 'Arremessar', base: 20, combat: true },
    { id: 'arte_oficio_1', name: 'Arte/Ofício', base: 5, specializable: true },
    { id: 'arte_oficio_2', name: 'Arte/Ofício', base: 5, specializable: true },
    { id: 'avaliacao', name: 'Avaliação', base: 5 },
    { id: 'cavalgar', name: 'Cavalgar', base: 5 },
    { id: 'chaveiro', name: 'Chaveiro', base: 1 },
    { id: 'charme', name: 'Charme', base: 15 },
    { id: 'ciencia_1', name: 'Ciência', base: 1, specializable: true },
    { id: 'ciencia_2', name: 'Ciência', base: 1, specializable: true },
    { id: 'ciencia_3', name: 'Ciência', base: 1, specializable: true },
    { id: 'consertos_eletricos', name: 'Consertos Elétricos', base: 10 },
    { id: 'consertos_mecanicos', name: 'Consertos Mecânicos', base: 10 },
    { id: 'contabilidade', name: 'Contabilidade', base: 5 },
    { id: 'credito', name: 'Nível de Crédito', base: 0, isCredit: true },
    { id: 'direito', name: 'Direito', base: 5 },
    { id: 'dirigir_automoveis', name: 'Dirigir Automóveis', base: 20 },
    { id: 'disfarce', name: 'Disfarce', base: 5 },
    { id: 'encontrar', name: 'Encontrar', base: 25 },
    { id: 'escalar', name: 'Escalar', base: 20 },
    { id: 'escutar', name: 'Escutar', base: 20 },
    { id: 'esquiva', name: 'Esquiva', base: 0, dynamicBase: 'DES_HALF' },
    { id: 'furtividade', name: 'Furtividade', base: 20 },
    { id: 'historia', name: 'História', base: 5 },
    { id: 'intimidacao', name: 'Intimidação', base: 15 },
    { id: 'labia', name: 'Lábia', base: 5 },
    { id: 'lingua_nativa', name: 'Língua (Nativa)', base: 0, dynamicBase: 'EDU', specializable: true, specLabel: 'Idioma' },
    { id: 'lingua_outra_1', name: 'Língua (Outra)', base: 1, specializable: true, specLabel: 'Idioma' },
    { id: 'lingua_outra_2', name: 'Língua (Outra)', base: 1, specializable: true, specLabel: 'Idioma' },
    { id: 'lutar_briga', name: 'Lutar (Briga)', base: 25, combat: true, isBrawl: true },
    { id: 'lutar_outra_1', name: 'Lutar', base: 0, specializable: true, combat: true },
    { id: 'medicina', name: 'Medicina', base: 1 },
    { id: 'mitos_cthulhu', name: 'Mythos de Cthulhu', base: 0, isMythos: true },
    { id: 'natacao', name: 'Natação', base: 20 },
    { id: 'navegacao', name: 'Navegação', base: 10 },
    { id: 'ocultismo', name: 'Ocultismo', base: 5 },
    { id: 'operar_maquinario', name: 'Operar Maquinário Pesado', base: 1 },
    { id: 'persuasao', name: 'Persuasão', base: 10 },
    { id: 'pilotar_1', name: 'Pilotar', base: 1, specializable: true },
    { id: 'prestidigitacao', name: 'Prestidigitação', base: 10 },
    { id: 'primeiros_socorros', name: 'Primeiros Socorros', base: 30 },
    { id: 'psicanalise', name: 'Psicanálise', base: 1 },
    { id: 'psicologia', name: 'Psicologia', base: 10 },
    { id: 'rastrear', name: 'Rastrear', base: 10 },
    { id: 'saltar', name: 'Saltar', base: 20 },
    { id: 'sobrevivencia_1', name: 'Sobrevivência', base: 10, specializable: true },
    { id: 'usar_bibliotecas', name: 'Usar Bibliotecas', base: 20 },
  ];

  function defaultState() {
    const characteristics = {};
    CHARACTERISTICS.forEach(c => characteristics[c.key] = 0);
    const skills = {};
    SKILL_CATALOG.forEach(s => {
      skills[s.id] = { occ: 0, pers: 0, improve: false, spec: '' };
    });
    return {
      meta: { schemaVersion: SCHEMA_VERSION, updatedAt: null },
      theme: 'light',
      info: { nome: '', jogador: '', ocupacao: '', idade: '', sexo: '', residencia: '', nascimento: '', portrait: '' },
      characteristics,
      trackers: {
        hpCurrent: '', mpCurrent: '', sanCurrent: '', luckCurrent: '',
        lesaoGrave: false, morrendo: false, insanidadeTemp: false, insanidadeIndef: false,
        movOverride: false, movManual: ''
      },
      pools: { occMax: 0, persMax: 0 },
      skills,
      customSkills: [], // {id,name,base,spec,occ,pers,improve,combat}
      weapons: [defaultWeapon(true)],
      backstory: { descricao: '', ideologia: '', pessoas: '', locais: '', pertences: '', tracos: '', ferimentos: '', fobias: '', tomos: '', encontros: '' },
      gear: [],
      finance: { dinheiro: '', bens: '', gastos: '' }
    };
  }

  function defaultWeapon(unarmed = false) {
    return unarmed
      ? { id: uid(), arma: 'Desarmado', skillId: 'lutar_briga', dano: '1D3 + DB', alcance: 'Toque', ataques: '1', municao: '-', defeito: '-' }
      : { id: uid(), arma: '', skillId: '', dano: '', alcance: '', ataques: '', municao: '', defeito: '' };
  }

  function uid() { return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
  function clampNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
  function half(v) { return Math.floor(clampNum(v) / 2); }
  function fifth(v) { return Math.floor(clampNum(v) / 5); }
  function getByPath(obj, path) { return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj); }
  function setByPath(obj, path, value) {
    const keys = path.split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) { if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {}; cur = cur[keys[i]]; }
    cur[keys[keys.length - 1]] = value;
  }

  let state = loadState();
  let saveTimer = null;

  function mergeDeep(base, extra) {
    if (extra == null || typeof extra !== 'object') return base;
    for (const k of Object.keys(extra)) {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        mergeDeep(base[k], extra[k]);
      } else {
        base[k] = extra[k];
      }
    }
    return base;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      // ensure skill entries for catalog exist
      if (parsed.skills) base.skills = { ...base.skills, ...parsed.skills };
      mergeDeep(base, parsed);
      // re-ensure catalog skills
      SKILL_CATALOG.forEach(s => { if (!base.skills[s.id]) base.skills[s.id] = { occ: 0, pers: 0, improve: false, spec: '' }; });
      if (!Array.isArray(base.weapons) || base.weapons.length === 0) base.weapons = [defaultWeapon(true)];
      if (!Array.isArray(base.customSkills)) base.customSkills = [];
      if (!Array.isArray(base.gear)) base.gear = [];
      return base;
    } catch (e) {
      console.warn('Falha ao carregar estado, usando padrão.', e);
      return defaultState();
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    setSaveStatus('Salvando…');
    saveTimer = setTimeout(() => {
      try {
        state.meta.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setSaveStatus('Salvo');
      } catch (e) {
        console.error(e);
        setSaveStatus('Erro ao salvar');
      }
    }, 250);
  }

  function setSaveStatus(msg) {
    const el = document.getElementById('saveStatus');
    if (el) el.textContent = msg;
  }

  // --- Calculations ---
  function getChar(key) { return clampNum(state.characteristics[key]); }
  function getSkillBase(def) {
    if (def.dynamicBase === 'DES_HALF') return half(getChar('DES'));
    if (def.dynamicBase === 'EDU') return clampNum(getChar('EDU'));
    return clampNum(def.base);
  }
  function skillEntry(def) {
    const e = state.skills[def.id] || { occ: 0, pers: 0, improve: false, spec: '' };
    const base = getSkillBase(def);
    const occ = clampNum(e.occ);
    const pers = clampNum(e.pers);
    const total = base + occ + pers;
    return { ...e, base, occ, pers, total, half: half(total), fifth: fifth(total), def };
  }
  function customSkillEntry(cs) {
    const base = clampNum(cs.base);
    const occ = clampNum(cs.occ);
    const pers = clampNum(cs.pers);
    const total = base + occ + pers;
    return { ...cs, base, occ, pers, total, half: half(total), fifth: fifth(total) };
  }
  function allSkillTotals() {
    const list = SKILL_CATALOG.map(def => ({ id: def.id, name: displaySkillName(def, state.skills[def.id]), ...skillEntry(def) }));
    state.customSkills.forEach(cs => list.push({ id: cs.id, name: cs.name + (cs.spec ? ` (${cs.spec})` : ''), ...customSkillEntry(cs), isCustom: true, def: cs }));
    return list;
  }
  function displaySkillName(def, entry) {
    const spec = entry && entry.spec ? ` (${entry.spec})` : '';
    if (def.specializable) return def.name + (entry && entry.spec ? ` (${entry.spec})` : '');
    return def.name + spec;
  }
  function findSkillTotalById(id) {
    if (!id) return null;
    const def = SKILL_CATALOG.find(s => s.id === id);
    if (def) return skillEntry(def);
    const cs = state.customSkills.find(s => s.id === id);
    if (cs) return customSkillEntry(cs);
    return null;
  }

  function calcMaxHP() { return Math.floor((getChar('CON') + getChar('TAM')) / 10); }
  function calcMaxMP() { return Math.floor(getChar('POD') / 5); }
  function calcSanStart() { return clampNum(getChar('POD')); }
  function calcMythosTotal() {
    const m = SKILL_CATALOG.find(s => s.isMythos);
    return m ? skillEntry(m).total : 0;
  }
  function calcSanMax() { return Math.max(0, 99 - calcMythosTotal()); }
  function calcMovAuto() {
    const des = getChar('DES'), tam = getChar('TAM'), str = getChar('FOR'), age = clampNum(state.info.idade);
    let mov = 8;
    if (str > tam && des > tam) mov = 9;
    else if (str < tam && des < tam) mov = 7;
    else mov = 8; // any equal or mixed comparison
    // Age modifiers (apply to base MOV)
    if (age >= 80) mov -= 5; else if (age >= 70) mov -= 4; else if (age >= 60) mov -= 3; else if (age >= 50) mov -= 2; else if (age >= 40) mov -= 1;
    return mov;
  }
  function calcDBBuild() {
    const sum = getChar('FOR') + getChar('TAM');
    if (sum <= 0) return { db: '0', build: 0 };
    if (sum <= 64) return { db: '-2', build: -2 };
    if (sum <= 84) return { db: '-1', build: -1 };
    if (sum <= 124) return { db: '0', build: 0 };
    if (sum <= 164) return { db: '+1D4', build: 1 };
    if (sum <= 204) return { db: '+1D6', build: 2 };
    // beyond 204 (large creatures/rare) - extend reasonably
    const extraSteps = Math.floor((sum - 205) / 80) + 1;
    return { db: `+${1 + extraSteps}D6`, build: 2 + extraSteps };
  }

  function calcPoolsAllocated() {
    let occ = 0, pers = 0;
    SKILL_CATALOG.forEach(def => { const e = state.skills[def.id]; if (e) { occ += clampNum(e.occ); pers += clampNum(e.pers); } });
    state.customSkills.forEach(e => { occ += clampNum(e.occ); pers += clampNum(e.pers); });
    return { occ, pers };
  }

  // --- Rendering ---
  const characteristicsGrid = document.getElementById('characteristicsGrid');
  const skillsBody = document.getElementById('skillsBody');
  const weaponsBody = document.getElementById('weaponsBody');
  const gearList = document.getElementById('gearList');

  function initStaticUI() {
    renderCharacteristics();
    renderSkillsTable();
    renderWeapons();
    renderGear();
    bindInputs();
    bindActions();
    applyTheme(state.theme || 'light');
    renderAll();
  }

  function renderCharacteristics() {
    characteristicsGrid.innerHTML = '';
    CHARACTERISTICS.forEach(c => {
      const box = document.createElement('div');
      box.className = 'char-box';
      box.innerHTML = `
        <div class="abbr">${c.key}</div>
        <div class="name">${c.name}</div>
        <input type="number" min="0" data-path="characteristics.${c.key}" aria-label="${c.name} regular">
        <div class="subvals"><span title="Metade (1/2)" data-half="${c.key}">-</span><span title="Quinto (1/5)" data-fifth="${c.key}">-</span></div>
      `;
      characteristicsGrid.appendChild(box);
    });
  }

  function renderSkillsTable() {
    skillsBody.innerHTML = '';
    SKILL_CATALOG.forEach(def => skillsBody.appendChild(skillRow(def, false)));
    state.customSkills.forEach(cs => skillsBody.appendChild(customSkillRow(cs)));
  }

  function skillRow(def, isCustom) {
    const tr = document.createElement('tr');
    tr.dataset.skillId = def.id;
    const specInput = def.specializable ? `<input type="text" class="skill-spec" data-skill-spec="${def.id}" placeholder="${def.specLabel || 'Especialização'}">` : '';
    tr.innerHTML = `
      <td class="col-check"><input type="checkbox" data-skill-improve="${def.id}" title="Melhoria"></td>
      <td class="col-name"><div class="skill-name">${def.name}</div>${specInput}</td>
      <td class="base-cell" data-skill-base="${def.id}">0</td>
      <td class="col-num"><input type="number" min="0" data-skill-occ="${def.id}"></td>
      <td class="col-num"><input type="number" min="0" data-skill-pers="${def.id}"></td>
      <td class="computed" data-skill-total="${def.id}">0</td>
      <td class="computed" data-skill-half="${def.id}">0</td>
      <td class="computed" data-skill-fifth="${def.id}">0</td>
      <td class="col-actions no-print"></td>
    `;
    return tr;
  }

  function customSkillRow(cs) {
    const tr = document.createElement('tr');
    tr.dataset.customSkillId = cs.id;
    tr.className = 'custom';
    tr.innerHTML = `
      <td class="col-check"><input type="checkbox" data-cskill-improve="${cs.id}" title="Melhoria"></td>
      <td class="col-name">
        <input type="text" data-cskill-name="${cs.id}" placeholder="Nome da perícia" value="">
        <input type="text" class="skill-spec" data-cskill-spec="${cs.id}" placeholder="Especialização (opcional)">
      </td>
      <td class="col-num"><input type="number" min="0" data-cskill-base="${cs.id}" title="Base %"></td>
      <td class="col-num"><input type="number" min="0" data-cskill-occ="${cs.id}"></td>
      <td class="col-num"><input type="number" min="0" data-cskill-pers="${cs.id}"></td>
      <td class="computed" data-cskill-total="${cs.id}">0</td>
      <td class="computed" data-cskill-half="${cs.id}">0</td>
      <td class="computed" data-cskill-fifth="${cs.id}">0</td>
      <td class="col-actions no-print"><button type="button" class="row-remove" data-remove-cskill="${cs.id}" title="Remover">×</button></td>
    `;
    return tr;
  }

  function renderWeapons() {
    weaponsBody.innerHTML = '';
    state.weapons.forEach(w => weaponsBody.appendChild(weaponRow(w)));
  }

  function weaponSkillOptions(selectedId) {
    const opts = ['<option value="">-- Selecionar --</option>'];
    SKILL_CATALOG.filter(s => s.combat || s.id === 'arremessar').forEach(def => {
      const e = skillEntry(def);
      const label = `${def.name} (${e.total}/${e.half}/${e.fifth})`;
      opts.push(`<option value="${def.id}" ${selectedId === def.id ? 'selected' : ''}>${escapeHtml(label)}</option>`);
    });
    state.customSkills.filter(s => s.combat).forEach(cs => {
      const e = customSkillEntry(cs);
      const name = (cs.name || 'Personalizada') + (cs.spec ? ` (${cs.spec})` : '');
      opts.push(`<option value="${cs.id}" ${selectedId === cs.id ? 'selected' : ''}>${escapeHtml(name)} (${e.total}/${e.half}/${e.fifth})</option>`);
    });
    return opts.join('');
  }

  function weaponRow(w) {
    const tr = document.createElement('tr');
    tr.dataset.weaponId = w.id;
    tr.innerHTML = `
      <td><input type="text" data-weapon-field="arma" data-id="${w.id}"></td>
      <td><select data-weapon-field="skillId" data-id="${w.id}">${weaponSkillOptions(w.skillId)}</select></td>
      <td><input type="text" data-weapon-field="dano" data-id="${w.id}"></td>
      <td><input type="text" data-weapon-field="alcance" data-id="${w.id}"></td>
      <td><input type="text" data-weapon-field="ataques" data-id="${w.id}"></td>
      <td><input type="text" data-weapon-field="municao" data-id="${w.id}"></td>
      <td><input type="text" data-weapon-field="defeito" data-id="${w.id}"></td>
      <td class="no-print"><button type="button" class="row-remove" data-remove-weapon="${w.id}" title="Remover">×</button></td>
    `;
    return tr;
  }

  function renderGear() {
    gearList.innerHTML = '';
    state.gear.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'gear-item';
      row.innerHTML = `<input type="text" data-gear-index="${idx}" value=""><button type="button" class="row-remove no-print" data-remove-gear="${idx}" title="Remover">×</button>`;
      gearList.appendChild(row);
      row.querySelector('input').value = item || '';
    });
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

  function bindInputs() {
    document.body.addEventListener('input', (e) => {
      const t = e.target;
      if (t.matches('[data-path]')) {
        const path = t.dataset.path;
        let val;
        if (t.type === 'checkbox') val = t.checked;
        else if (t.type === 'number') val = t.value === '' ? '' : Number(t.value);
        else val = t.value;
        setByPath(state, path, val);
        // auto-suggest personal pool max when INT changes and user hasn't customized? keep simple: update suggestion display only
        onStateChange();
        return;
      }
      // skills
      if (t.dataset.skillOcc) { ensureSkill(t.dataset.skillOcc).occ = numOrEmpty(t.value); onStateChange(); return; }
      if (t.dataset.skillPers) { ensureSkill(t.dataset.skillPers).pers = numOrEmpty(t.value); onStateChange(); return; }
      if (t.dataset.skillSpec) { ensureSkill(t.dataset.skillSpec).spec = t.value; onStateChange(false); return; }
      // custom skills
      if (t.dataset.cskillName) { const cs = findCustom(t.dataset.cskillName); if (cs) { cs.name = t.value; onStateChange(false, true); } return; }
      if (t.dataset.cskillSpec) { const cs = findCustom(t.dataset.cskillSpec); if (cs) { cs.spec = t.value; onStateChange(false, true); } return; }
      if (t.dataset.cskillBase) { const cs = findCustom(t.dataset.cskillBase); if (cs) { cs.base = numOrEmpty(t.value); onStateChange(); } return; }
      if (t.dataset.cskillOcc) { const cs = findCustom(t.dataset.cskillOcc); if (cs) { cs.occ = numOrEmpty(t.value); onStateChange(); } return; }
      if (t.dataset.cskillPers) { const cs = findCustom(t.dataset.cskillPers); if (cs) { cs.pers = numOrEmpty(t.value); onStateChange(); } return; }
      // weapons
      if (t.dataset.weaponField) {
        const w = state.weapons.find(x => x.id === t.dataset.id);
        if (w) { w[t.dataset.weaponField] = t.value; onStateChange(false); }
        return;
      }
      // gear
      if (t.dataset.gearIndex != null) {
        const idx = Number(t.dataset.gearIndex);
        if (state.gear[idx] !== undefined) { state.gear[idx] = t.value; onStateChange(false); }
        return;
      }
    });

    document.body.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches('[data-path]') && t.type === 'checkbox') { setByPath(state, t.dataset.path, t.checked); onStateChange(); return; }
      if (t.dataset.skillImprove) { ensureSkill(t.dataset.skillImprove).improve = t.checked; onStateChange(false); return; }
      if (t.dataset.cskillImprove) { const cs = findCustom(t.dataset.cskillImprove); if (cs) { cs.improve = t.checked; onStateChange(false); } return; }
      if (t.dataset.weaponField) {
        const w = state.weapons.find(x => x.id === t.dataset.id);
        if (w) { w[t.dataset.weaponField] = t.value; onStateChange(false, true); }
      }
    });
  }

  function ensureSkill(id) { if (!state.skills[id]) state.skills[id] = { occ: 0, pers: 0, improve: false, spec: '' }; return state.skills[id]; }
  function findCustom(id) { return state.customSkills.find(s => s.id === id); }
  function numOrEmpty(v) { return v === '' ? '' : Number(v); }

  function bindActions() {
    document.getElementById('themeToggle').addEventListener('click', () => {
      state.theme = (state.theme === 'dark') ? 'light' : 'dark';
      applyTheme(state.theme);
      onStateChange(false);
    });
    document.getElementById('exportJsonBtn').addEventListener('click', exportJson);
    document.getElementById('importJsonInput').addEventListener('change', importJson);
    document.getElementById('exportPdfBtn').addEventListener('click', () => window.print());
    document.getElementById('resetBtn').addEventListener('click', () => document.getElementById('resetDialog').showModal());
    document.getElementById('confirmResetBtn').addEventListener('click', (e) => {
      e.preventDefault();
      state = defaultState();
      localStorage.removeItem(STORAGE_KEY);
      applyTheme(state.theme);
      fullRerender();
      setSaveStatus('Ficha limpa');
      document.getElementById('resetDialog').close();
      scheduleSave();
    });
    document.getElementById('addCustomSkillBtn').addEventListener('click', () => {
      state.customSkills.push({ id: uid(), name: '', base: 0, spec: '', occ: 0, pers: 0, improve: false, combat: false });
      renderSkillsTable();
      syncFormFromState();
      onStateChange(false, true);
    });
    document.getElementById('addWeaponBtn').addEventListener('click', () => {
      state.weapons.push(defaultWeapon(false));
      renderWeapons();
      syncFormFromState();
      onStateChange(false, true);
    });
    document.getElementById('addGearBtn').addEventListener('click', () => {
      state.gear.push('');
      renderGear();
      onStateChange(false);
    });
    document.body.addEventListener('click', (e) => {
      const rmC = e.target.closest('[data-remove-cskill]');
      if (rmC) {
        const id = rmC.dataset.removeCskill;
        state.customSkills = state.customSkills.filter(s => s.id !== id);
        renderSkillsTable(); syncFormFromState(); onStateChange(false, true);
      }
      const rmW = e.target.closest('[data-remove-weapon]');
      if (rmW) {
        const id = rmW.dataset.removeWeapon;
        if (state.weapons.length <= 1) return; // keep at least one
        state.weapons = state.weapons.filter(w => w.id !== id);
        renderWeapons(); syncFormFromState(); onStateChange(false, true);
      }
      const rmG = e.target.closest('[data-remove-gear]');
      if (rmG) {
        const idx = Number(rmG.dataset.removeGear);
        state.gear.splice(idx, 1);
        renderGear(); onStateChange(false);
      }
    });
    const portraitInput = document.getElementById('portraitInput');
    portraitInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await readAndResizeImage(file, 512, 640);
        state.info.portrait = dataUrl;
        renderPortrait();
        onStateChange(false);
      } catch (err) { console.error(err); }
      portraitInput.value = '';
    });
    document.getElementById('removePortraitBtn').addEventListener('click', () => {
      state.info.portrait = '';
      renderPortrait();
      onStateChange(false);
    });
  }

  function readAndResizeImage(file, maxW, maxH) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width: w, height: h } = img;
          const ratio = Math.min(maxW / w, maxH / h, 1);
          w = Math.round(w * ratio); h = Math.round(h * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = `Tema: ${theme === 'dark' ? 'Escuro' : 'Claro'}`;
  }

  function onStateChange(recalc = true, weaponsNeedRefresh = false) {
    if (recalc) renderDerivedAndSkills();
    if (weaponsNeedRefresh) refreshWeaponSkillOptions();
    scheduleSave();
  }

  function fullRerender() {
    renderSkillsTable();
    renderWeapons();
    renderGear();
    syncFormFromState();
    renderAll();
  }

  function syncFormFromState() {
    document.querySelectorAll('[data-path]').forEach(el => {
      const val = getByPath(state, el.dataset.path);
      if (el.type === 'checkbox') el.checked = !!val;
      else el.value = val == null ? '' : val;
    });
    // skills
    SKILL_CATALOG.forEach(def => {
      const e = ensureSkill(def.id);
      const set = (sel, v, prop='value') => { const el = document.querySelector(sel); if (el) el[prop] = v; };
      set(`[data-skill-occ="${def.id}"]`, e.occ ?? 0);
      set(`[data-skill-pers="${def.id}"]`, e.pers ?? 0);
      set(`[data-skill-improve="${def.id}"]`, !!e.improve, 'checked');
      if (def.specializable) set(`[data-skill-spec="${def.id}"]`, e.spec || '');
    });
    state.customSkills.forEach(cs => {
      const q = s => document.querySelector(s);
      if (q(`[data-cskill-name="${cs.id}"]`)) q(`[data-cskill-name="${cs.id}"]`).value = cs.name || '';
      if (q(`[data-cskill-spec="${cs.id}"]`)) q(`[data-cskill-spec="${cs.id}"]`).value = cs.spec || '';
      if (q(`[data-cskill-base="${cs.id}"]`)) q(`[data-cskill-base="${cs.id}"]`).value = cs.base ?? 0;
      if (q(`[data-cskill-occ="${cs.id}"]`)) q(`[data-cskill-occ="${cs.id}"]`).value = cs.occ ?? 0;
      if (q(`[data-cskill-pers="${cs.id}"]`)) q(`[data-cskill-pers="${cs.id}"]`).value = cs.pers ?? 0;
      if (q(`[data-cskill-improve="${cs.id}"]`)) q(`[data-cskill-improve="${cs.id}"]`).checked = !!cs.improve;
    });
    // weapons
    state.weapons.forEach(w => {
      document.querySelectorAll(`[data-weapon-field][data-id="${w.id}"]`).forEach(el => {
        const field = el.dataset.weaponField;
        if (el.tagName === 'SELECT') el.value = w[field] || '';
        else el.value = w[field] ?? '';
      });
    });
    renderGear();
    renderPortrait();
  }

  function renderPortrait() {
    const frame = document.querySelector('.portrait-frame');
    const img = document.getElementById('portraitPreview');
    if (state.info.portrait) {
      img.src = state.info.portrait;
      frame.classList.add('has-image');
    } else {
      img.removeAttribute('src');
      frame.classList.remove('has-image');
    }
  }

  function renderAll() {
    syncFormFromState();
    renderDerivedAndSkills();
    refreshWeaponSkillOptions();
  }

  function renderDerivedAndSkills() {
    // characteristics half/fifth
    CHARACTERISTICS.forEach(c => {
      const val = getChar(c.key);
      const h = document.querySelector(`[data-half="${c.key}"]`);
      const f = document.querySelector(`[data-fifth="${c.key}"]`);
      if (h) h.textContent = half(val);
      if (f) f.textContent = fifth(val);
    });
    // derived
    const hpMax = calcMaxHP(), mpMax = calcMaxMP(), sanStart = calcSanStart(), sanMax = calcSanMax();
    document.getElementById('hpMax').textContent = hpMax;
    document.getElementById('mpMax').textContent = mpMax;
    document.getElementById('sanStart').textContent = sanStart;
    document.getElementById('sanMax').textContent = sanMax;
    const movAuto = calcMovAuto();
    document.getElementById('movAuto').textContent = movAuto;
    const movEff = state.trackers.movOverride && state.trackers.movManual !== '' ? clampNum(state.trackers.movManual) : movAuto;
    document.getElementById('movEffective').textContent = movEff;
    const dbb = calcDBBuild();
    document.getElementById('dbValue').textContent = dbb.db;
    document.getElementById('buildValue').textContent = dbb.build;
    document.getElementById('unarmedDamage').textContent = `1D3 ${dbb.db.startsWith('-') ? dbb.db : (dbb.db === '0' ? '+0' : dbb.db)}`;
    // skills
    SKILL_CATALOG.forEach(def => {
      const e = skillEntry(def);
      const setText = (sel, v) => { const el = document.querySelector(sel); if (el) el.textContent = v; };
      setText(`[data-skill-base="${def.id}"]`, e.base);
      setText(`[data-skill-total="${def.id}"]`, e.total);
      setText(`[data-skill-half="${def.id}"]`, e.half);
      setText(`[data-skill-fifth="${def.id}"]`, e.fifth);
    });
    state.customSkills.forEach(cs => {
      const e = customSkillEntry(cs);
      const setText = (sel, v) => { const el = document.querySelector(sel); if (el) el.textContent = v; };
      setText(`[data-cskill-total="${cs.id}"]`, e.total);
      setText(`[data-cskill-half="${cs.id}"]`, e.half);
      setText(`[data-cskill-fifth="${cs.id}"]`, e.fifth);
    });
    // pools
    const alloc = calcPoolsAllocated();
    document.getElementById('occAllocated').textContent = alloc.occ;
    document.getElementById('persAllocated').textContent = alloc.pers;
    const persSuggested = clampNum(getChar('INT')) * 2;
    document.getElementById('persSuggested').textContent = persSuggested;
    updatePoolStatus('occStatus', alloc.occ, clampNum(state.pools.occMax));
    updatePoolStatus('persStatus', alloc.pers, clampNum(state.pools.persMax));
    // credit display
    const credit = SKILL_CATALOG.find(s => s.isCredit);
    const creditVal = credit ? skillEntry(credit).total : 0;
    document.getElementById('creditRatingDisplay').textContent = `${creditVal}%`;
  }

  function updatePoolStatus(elId, alloc, max) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (!max && max !== 0) { el.textContent = ''; el.className = 'pool-status'; return; }
    const diff = max - alloc;
    if (diff < 0) { el.textContent = `Excedido em ${Math.abs(diff)} pontos`; el.className = 'pool-status over'; }
    else { el.textContent = `Restantes: ${diff} pontos`; el.className = 'pool-status ok'; }
  }

  function refreshWeaponSkillOptions() {
    document.querySelectorAll('select[data-weapon-field="skillId"]').forEach(sel => {
      const id = sel.dataset.id;
      const w = state.weapons.find(x => x.id === id);
      const current = w ? w.skillId : sel.value;
      sel.innerHTML = weaponSkillOptions(current);
      sel.value = current || '';
    });
  }

  // --- Import/Export ---
  function exportJson() {
    state.meta.updatedAt = new Date().toISOString();
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    const safeName = (state.info.nome || 'investigador').trim().replace(/[^\w\-]+/g, '_') || 'investigador';
    a.href = URL.createObjectURL(blob);
    a.download = `${safeName}_coc7e.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function importJson(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== 'object') throw new Error('JSON inválido');
        const base = defaultState();
        // merge carefully
        if (parsed.skills) base.skills = { ...base.skills, ...parsed.skills };
        mergeDeep(base, parsed);
        SKILL_CATALOG.forEach(s => { if (!base.skills[s.id]) base.skills[s.id] = { occ: 0, pers: 0, improve: false, spec: '' }; });
        if (!Array.isArray(base.weapons) || base.weapons.length === 0) base.weapons = [defaultWeapon(true)];
        if (!Array.isArray(base.customSkills)) base.customSkills = [];
        if (!Array.isArray(base.gear)) base.gear = [];
        state = base;
        applyTheme(state.theme || 'light');
        fullRerender();
        scheduleSave();
      } catch (err) {
        alert('Falha ao importar JSON: ' + err.message);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  // init
  initStaticUI();
})();
