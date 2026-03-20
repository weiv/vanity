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
    const photoHtml = v.photo
      ? `<div class="catalog-photo"><img src="catalog/${v.photo}" style="object-position: 70% ${v.photoY}%" alt="${v.name}" loading="lazy" draggable="false"></div>`
      : '';
    const sinkPosRow = v.type !== 'sink' ? ''
      : v.fixedSinkPos
        ? `<div class="sink-pos-row"><span class="sink-pos-label">Sink:</span><span class="pos-btn active" style="cursor:default">${v.fixedSinkPos} (fixed)</span></div>`
        : `<div class="sink-pos-row">
            <span class="sink-pos-label">Sink:</span>
            ${['L','C','R'].map(pos => `<button class="pos-btn ${sp===pos?'active':''}" data-id="${v.id}" data-pos="${pos}" onclick="setSinkPos('${v.id}','${pos}')">${pos}</button>`).join('')}
          </div>`;
    card.innerHTML = `${photoHtml}
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
    if (v.photo) {
      card.querySelector('.catalog-photo').addEventListener('click', e => {
        e.stopPropagation();
        openPhotoLightbox(`catalog/${v.photo}`, v.name, v.photoBox);
      });
    }
    grid.appendChild(card);
  });
}

function filterCatalog(type, btn) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCatalog();
}

function openPhotoLightbox(src, alt, box) {
  const lb = document.createElement('div');
  lb.className = 'photo-lightbox';
  lb.addEventListener('click', () => lb.remove());
  document.body.appendChild(lb);

  if (!box) {
    lb.innerHTML = `<img src="${src}" alt="${alt}">`;
    return;
  }

  const img = new Image();
  img.onload = () => {
    const [x1, y1, x2, y2] = box;
    const sw = img.naturalWidth  * (x2 - x1);
    const sh = img.naturalHeight * (y2 - y1);
    const maxW = window.innerWidth  * 0.88;
    const maxH = window.innerHeight * 0.88;
    const scale = Math.min(maxW / sw, maxH / sh, 3);
    const canvas = document.createElement('canvas');
    canvas.width  = sw * scale;
    canvas.height = sh * scale;
    canvas.style.borderRadius = '6px';
    canvas.style.boxShadow = '0 8px 40px rgba(0,0,0,.6)';
    canvas.getContext('2d').drawImage(
      img,
      img.naturalWidth * x1, img.naturalHeight * y1, sw, sh,
      0, 0, canvas.width, canvas.height
    );
    lb.appendChild(canvas);
  };
  img.src = src;
}
