function renderWall(wallId) {
  const wall    = WALLS[wallId];
  const stripEl = document.getElementById('wall' + wallId);
  const statsEl = document.getElementById(wallId.toLowerCase() + 'Stats');
  const sumValEl = document.getElementById('sum' + wallId + 'val');
  const sumBoxEl = document.getElementById('sum' + wallId);

  stripEl.innerHTML = '';
  const totalUsed = wall.placements.reduce((s, pl) => s + pl.vanity.w, 0);
  const remaining = wall.limit - totalUsed;

  wall.placements.forEach((placement, idx) => {
    const v = placement.vanity;
    const pxWidth = v.w * STRIP_SCALE;
    const piece = document.createElement('div');
    piece.className = 'wall-piece';
    piece.style.cssText = `width:${pxWidth}px; background:${v.color};`;

    let sinkSvg = '';
    if (v.type === 'sink') {
      const sp = placement.sinkPos || 'C';
      const bowlW = Math.max(pxWidth * 0.58, 8);
      const bowlH = STRIP_H * 0.52;
      const bowlY = (STRIP_H - bowlH) / 2;
      const bowlX = sp === 'L' ? 4 : sp === 'R' ? pxWidth - bowlW - 4 : (pxWidth - bowlW) / 2;
      const cx = bowlX + bowlW / 2, cy = bowlY + bowlH / 2;
      sinkSvg = `<svg viewBox="0 0 ${pxWidth} ${STRIP_H}" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="${cx}" cy="${cy}" rx="${bowlW/2}" ry="${bowlH/2}"
          fill="rgba(255,255,255,0.55)" stroke="rgba(0,0,0,0.45)" stroke-width="1.2"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${bowlW/2*0.72}" ry="${bowlH/2*0.72}"
          fill="rgba(255,255,255,0.3)" stroke="rgba(0,0,0,0.2)" stroke-width="0.7"/>
        <circle cx="${cx}" cy="${cy}" r="2.2" fill="#888"/>
        <rect x="${cx-3}" y="${bowlY-5}" width="6" height="5" rx="1.5" fill="rgba(0,0,0,0.35)"/>
        <text x="${pxWidth/2}" y="${STRIP_H-4}" text-anchor="middle"
          font-size="8" font-weight="700" fill="rgba(0,0,0,0.45)" font-family="Arial">${sp}</text>
      </svg>`;
    }

    const posLabel = v.type === 'sink' ? ` · ${placement.sinkPos || 'C'}` : '';
    piece.title = `${v.name}\n${v.w}" wide × ${v.d}" deep × ${v.h}" tall${posLabel}\nClick to remove`;
    piece.innerHTML = `<span class="wall-piece-code">${v.id}</span><span class="wall-piece-width">${v.w}"</span>${sinkSvg}`;
    piece.onclick = () => removeFromWall(wallId, idx);
    stripEl.appendChild(piece);
  });

  if (remaining > 0) {
    const remDiv = document.createElement('div');
    remDiv.className = 'wall-remaining';
    remDiv.style.width = `${remaining * STRIP_SCALE}px`;
    remDiv.textContent = remaining > 4 ? `${remaining.toFixed(1)}"` : '';
    stripEl.appendChild(remDiv);
  }

  const overLimit = totalUsed > wall.limit;
  stripEl.classList.toggle('over-limit', overLimit);
  statsEl.innerHTML = overLimit
    ? `${totalUsed.toFixed(1)}" used · ${wall.limit}" available · <span class="over">OVER by ${(totalUsed - wall.limit).toFixed(1)}"!</span>`
    : `${totalUsed.toFixed(1)}" used · ${wall.limit}" available · <strong>${remaining.toFixed(1)}" remaining</strong>`;

  sumValEl.textContent = totalUsed.toFixed(1);
  sumBoxEl.className = 'summary-box ' + (overLimit ? 'warn' : totalUsed > 0 ? 'ok' : '');
}
