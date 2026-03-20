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
    const photoHtml = v.photo ? `<canvas class="catalog-photo-canvas"></canvas>` : '';
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
      const canvas = card.querySelector('.catalog-photo-canvas');
      canvas.addEventListener('click', e => { e.stopPropagation(); openPhotoLightbox(`catalog/${v.photo}`, v.name, v.photoBox); });
      const img = new Image();
      img.onload = () => {
        const W = canvas.offsetWidth || 220;
        const H = 64;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const dx = (W - dw) / 2;
        const dy = (H - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
        if (v.photoBox) {
          const [x1, y1, x2, y2] = v.photoBox;
          ctx.strokeStyle = '#e74c3c';
          ctx.lineWidth = 2;
          ctx.strokeRect(dx + x1 * dw, dy + y1 * dh, (x2 - x1) * dw, (y2 - y1) * dh);
        }
      };
      img.src = `catalog/${v.photo}`;
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

  const img = new Image();
  img.onload = () => {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    // Crop to full width, vertical band of the product
    const sy = box ? ih * box[1] : 0;
    const sh = box ? ih * (box[3] - box[1]) : ih;
    const maxW = window.innerWidth  * 0.9;
    const maxH = window.innerHeight * 0.7;
    const scale = Math.min(maxW / iw, maxH / sh);
    const canvas = document.createElement('canvas');
    canvas.width  = iw * scale;
    canvas.height = sh * scale;
    canvas.style.borderRadius = '6px';
    canvas.style.boxShadow = '0 8px 40px rgba(0,0,0,.6)';
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, sy, iw, sh, 0, 0, canvas.width, canvas.height);
    lb.appendChild(canvas);
  };
  img.src = src;
}
