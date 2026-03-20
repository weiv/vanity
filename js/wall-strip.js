function makePiece(placement, wallId, idx, isUpper) {
  const v = placement.vanity;
  const stripH = isUpper ? UPPER_STRIP_H : STRIP_H;
  const pxWidth = v.w * STRIP_SCALE;
  const piece = document.createElement('div');
  piece.className = 'wall-piece' + (isUpper ? ' mounted' : '');
  piece.style.cssText = `width:${pxWidth}px; background:${v.color};`;

  let sinkSvg = '';
  if (!isUpper && v.type === 'sink') {
    const sp = placement.sinkPos || 'C';
    const bowlW = Math.max(pxWidth * 0.58, 8);
    const bowlH = stripH * 0.52;
    const bowlY = (stripH - bowlH) / 2;
    const bowlX = sp === 'L' ? 4 : sp === 'R' ? pxWidth - bowlW - 4 : (pxWidth - bowlW) / 2;
    const cx = bowlX + bowlW / 2, cy = bowlY + bowlH / 2;
    sinkSvg = `<svg viewBox="0 0 ${pxWidth} ${stripH}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="${cx}" cy="${cy}" rx="${bowlW/2}" ry="${bowlH/2}"
        fill="rgba(255,255,255,0.55)" stroke="rgba(0,0,0,0.45)" stroke-width="1.2"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${bowlW/2*0.72}" ry="${bowlH/2*0.72}"
        fill="rgba(255,255,255,0.3)" stroke="rgba(0,0,0,0.2)" stroke-width="0.7"/>
      <circle cx="${cx}" cy="${cy}" r="2.2" fill="#888"/>
      <rect x="${cx-3}" y="${bowlY-5}" width="6" height="5" rx="1.5" fill="rgba(0,0,0,0.35)"/>
      <text x="${pxWidth/2}" y="${stripH-4}" text-anchor="middle"
        font-size="8" font-weight="700" fill="rgba(0,0,0,0.45)" font-family="Arial">${sp}</text>
    </svg>`;
  }

  const mountBadge = isUpper ? '<span class="wall-piece-mount-badge">↑ WALL</span>' : '';
  const posLabel = v.type === 'sink' ? ` · ${placement.sinkPos || 'C'}` : '';
  piece.title = `${v.name}\n${v.w}" wide × ${v.d}" deep × ${v.h}" tall${posLabel}\nDrag to reorder · Click to remove`;
  piece.innerHTML = `<span class="wall-piece-code">${v.id}</span><span class="wall-piece-width">${v.w}"</span>${mountBadge}${sinkSvg}`;

  piece.draggable = true;

  piece.addEventListener('dragstart', e => {
    e.stopPropagation();
    stripDrag = { wallId, idx, isUpper };
    dragVanityId = null;
    piece.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // required by Firefox
  });

  piece.addEventListener('dragend', () => {
    stripDrag = null;
    piece.classList.remove('dragging');
    document.querySelectorAll('.insert-before,.insert-after')
      .forEach(el => el.classList.remove('insert-before','insert-after'));
  });

  piece.addEventListener('dragover', e => {
    if (!stripDrag || stripDrag.isUpper !== isUpper) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const { left, width } = piece.getBoundingClientRect();
    document.querySelectorAll('.insert-before,.insert-after')
      .forEach(el => el.classList.remove('insert-before','insert-after'));
    piece.classList.add(e.clientX < left + width / 2 ? 'insert-before' : 'insert-after');
  });

  piece.addEventListener('dragleave', () => {
    piece.classList.remove('insert-before','insert-after');
  });

  piece.addEventListener('drop', e => {
    if (!stripDrag || stripDrag.isUpper !== isUpper) return;
    e.preventDefault();
    e.stopPropagation();
    const { left, width } = piece.getBoundingClientRect();
    const insertBefore = e.clientX < left + width / 2;
    let toIdx = insertBefore ? idx : idx + 1;
    // When reordering within the same strip, account for the item being removed first
    if (stripDrag.wallId === wallId && stripDrag.isUpper === isUpper && toIdx > stripDrag.idx) toIdx--;
    piece.classList.remove('insert-before','insert-after');
    reorderStrip(stripDrag.wallId, stripDrag.idx, wallId, toIdx, isUpper);
  });

  piece.onclick = () => removeFromWall(wallId, idx, isUpper);
  return piece;
}

function renderStrip(containerEl, placements, wallId, wallLimit, isUpper) {
  containerEl.innerHTML = '';
  const totalUsed = placements.reduce((s, pl) => s + pl.vanity.w, 0);
  const remaining = wallLimit - totalUsed;

  placements.forEach((placement, idx) => {
    containerEl.appendChild(makePiece(placement, wallId, idx, isUpper));
  });

  if (remaining > 0) {
    const remDiv = document.createElement('div');
    remDiv.className = 'wall-remaining';
    remDiv.style.width = `${remaining * STRIP_SCALE}px`;
    remDiv.textContent = remaining > 4 ? `${remaining.toFixed(1)}"` : '';
    containerEl.appendChild(remDiv);
  }

  const overLimit = totalUsed > wallLimit;
  containerEl.classList.toggle('over-limit', overLimit);
  return { totalUsed, remaining, overLimit };
}

function renderWall(wallId) {
  const wall    = WALLS[wallId];
  const upperStripEl = document.getElementById('wallUpper' + wallId);
  const stripEl      = document.getElementById('wall' + wallId);
  const statsEl      = document.getElementById(wallId.toLowerCase() + 'Stats');
  const sumValEl     = document.getElementById('sum' + wallId + 'val');
  const sumBoxEl     = document.getElementById('sum' + wallId);

  // Render upper (wall-mounted) strip
  const upperResult = renderStrip(upperStripEl, wall.upper, wallId, wall.limit, true);

  // Render floor strip
  const floorResult = renderStrip(stripEl, wall.placements, wallId, wall.limit, false);

  const floorUsed = floorResult.totalUsed;
  const floorRemaining = floorResult.remaining;
  const overLimit = floorResult.overLimit;
  const upperUsed = upperResult.totalUsed;

  const floorLine = overLimit
    ? `Floor: ${floorUsed.toFixed(1)}" used · <span class="over">OVER by ${(floorUsed - wall.limit).toFixed(1)}"!</span>`
    : `Floor: ${floorUsed.toFixed(1)}" used · <strong>${floorRemaining.toFixed(1)}" remaining</strong>`;
  const upperLine = upperUsed > 0
    ? ` &nbsp;·&nbsp; Upper: ${upperUsed.toFixed(1)}" placed`
    : '';

  statsEl.innerHTML = floorLine + upperLine;

  sumValEl.textContent = floorUsed.toFixed(1);
  sumBoxEl.className = 'summary-chip ' + (overLimit ? 'warn' : floorUsed > 0 ? 'ok' : '');
}
