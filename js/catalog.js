let currentFilter = 'all';

function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  grid.innerHTML = '';
  const items = currentFilter === 'all' ? VANITIES : VANITIES.filter(v => v.type === currentFilter);
  items.forEach(v => {
    const card = document.createElement('div');
    card.className = 'catalog-item';
    card.draggable = true;
    card.dataset.vanityId = v.id;
    const sp = getSinkPos(v.id);
    const sinkPosRow = v.type !== 'sink' ? ''
      : v.fixedSinkPos
        ? `<div class="sink-pos-row"><span class="sink-pos-label">Sink:</span><span class="pos-btn active" style="cursor:default">${v.fixedSinkPos} (fixed)</span></div>`
        : `<div class="sink-pos-row">
            <span class="sink-pos-label">Sink:</span>
            ${['L','C','R'].map(pos => `<button class="pos-btn ${sp===pos?'active':''}" data-id="${v.id}" data-pos="${pos}" onclick="setSinkPos('${v.id}','${pos}')">${pos}</button>`).join('')}
          </div>`;
    card.innerHTML = `
      <div class="catalog-item-header">
        <div class="catalog-swatch" style="background:${v.color}"></div>
        <div><div class="catalog-name">${v.name}</div><div class="catalog-code">${v.id}</div></div>
      </div>
      <div class="catalog-dims">W: <span>${v.w}"</span> · D: <span>${v.d}"</span> · H: <span>${v.h}"</span></div>
      ${sinkPosRow}
      <div class="catalog-actions">
        <button class="add-btn add-btn-w1" onclick="addToWall('W1','${v.id}')">+ W1</button>
        <button class="add-btn add-btn-w2" onclick="addToWall('W2','${v.id}')">+ W2</button>
      </div>`;
    card.addEventListener('dragstart', onDragStart);
    card.addEventListener('dragend', onDragEnd);
    grid.appendChild(card);
  });
}

function filterCatalog(type, btn) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCatalog();
}
