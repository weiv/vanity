let currentFilter = 'all';
const imgCache = {}; // photo filename → HTMLImageElement, shared across filter changes

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
      const drawThumb = img => {
        const W = canvas.offsetWidth || 220;
        const H = 64;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (v.photoBox) {
          const [x1, y1, x2, y2] = v.photoBox;
          const sx = x1 * img.naturalWidth, sy = y1 * img.naturalHeight;
          const sw = (x2 - x1) * img.naturalWidth, sh = (y2 - y1) * img.naturalHeight;
          const scale = Math.min(W / sw, H / sh);
          const dw = sw * scale, dh = sh * scale;
          ctx.drawImage(img, sx, sy, sw, sh, (W - dw) / 2, (H - dh) / 2, dw, dh);
        } else {
          const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
          const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
          ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        }
      };
      if (imgCache[v.photo]?.complete) {
        drawThumb(imgCache[v.photo]);
      } else {
        if (!imgCache[v.photo]) {
          imgCache[v.photo] = new Image();
          imgCache[v.photo].src = `catalog/${v.photo}`;
        }
        imgCache[v.photo].addEventListener('load', () => drawThumb(imgCache[v.photo]), { once: true });
      }
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
  document.querySelector('.photo-lightbox')?.remove();
  const lb = document.createElement('div');
  lb.className = 'photo-lightbox';
  lb.addEventListener('click', () => lb.remove());
  document.body.appendChild(lb);

  const img = new Image();
  img.onload = () => {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const sx = box ? iw * box[0] : 0;
    const sy = box ? ih * box[1] : 0;
    const sw = box ? iw * (box[2] - box[0]) : iw;
    const sh = box ? ih * (box[3] - box[1]) : ih;
    const maxW = window.innerWidth  * 0.9;
    const maxH = window.innerHeight * 0.82;
    const scale = Math.min(maxW / sw, maxH / sh);
    const canvas = document.createElement('canvas');
    canvas.width  = sw * scale;
    canvas.height = sh * scale;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    lb.appendChild(canvas);
  };
  img.src = src;
}
