// Width scale = STRIP_SCALE (4 px/inch) so widths align with the strip above

function renderElevation(wallId) {
  const wall   = WALLS[wallId];
  const svg    = document.getElementById('elev' + wallId);
  const totalW = wall.limit * STRIP_SCALE;
  svg.setAttribute('viewBox', `0 0 ${totalW} ${ELEV_SVG_H}`);
  svg.setAttribute('width',  totalW);
  svg.setAttribute('height', ELEV_SVG_H);
  svg.innerHTML = '';

  // Wall surface background
  svg.appendChild(el('rect', { x:0, y:0, width:totalW, height:ELEV_SVG_H, fill:'#f0ede8' }));
  // Floor line
  svg.appendChild(el('line', { x1:0, y1:ELEV_FLOOR_Y, x2:totalW, y2:ELEV_FLOOR_Y, stroke:'#666', 'stroke-width':2 }));

  // W2 faces west: standing in room, north is on your right → render right-to-left
  const flip = wallId === 'W2';
  let xOff = flip ? totalW : 0;
  for (const { vanity, sinkPos } of wall.placements) {
    const pieceW = vanity.w * STRIP_SCALE;
    if (flip) xOff -= pieceW;
    drawElevPiece(svg, vanity, sinkPos, xOff);
    if (!flip) xOff += pieceW;
  }

  // Remaining space (south end: left for W2, right for W1)
  if (flip && xOff > 0) {
    svg.appendChild(el('rect', { x:0, y:0, width:xOff, height:ELEV_SVG_H, fill:'rgba(200,200,200,0.12)' }));
    svg.appendChild(el('line', { x1:xOff, y1:0, x2:xOff, y2:ELEV_FLOOR_Y, stroke:'#ccc', 'stroke-width':1, 'stroke-dasharray':'3,3' }));
  } else if (!flip && xOff < totalW) {
    svg.appendChild(el('rect', { x:xOff, y:0, width:totalW-xOff, height:ELEV_SVG_H, fill:'rgba(200,200,200,0.12)' }));
    svg.appendChild(el('line', { x1:xOff, y1:0, x2:xOff, y2:ELEV_FLOOR_Y, stroke:'#ccc', 'stroke-width':1, 'stroke-dasharray':'3,3' }));
  }
}

function drawElevPiece(svg, vanity, sinkPos, x0) {
  const isMounted = vanity.type === 'mirror' || vanity.type === 'medicine';
  const w    = vanity.w * STRIP_SCALE;
  const h    = vanity.h * ELEV_Y;
  const topY = isMounted ? ELEV_MOUNT_Y - h : ELEV_FLOOR_Y - h;

  // Cabinet body
  svg.appendChild(el('rect', { x:x0, y:topY, width:w, height:h, fill:vanity.color, stroke:'rgba(0,0,0,0.35)', 'stroke-width':1 }));

  if (!isMounted) {
    // Toe kick (recessed strip at bottom)
    svg.appendChild(el('rect', { x:x0+3, y:ELEV_FLOOR_Y-ELEV_KICK_H, width:w-6, height:ELEV_KICK_H, fill:'rgba(0,0,0,0.2)' }));
    // Countertop
    svg.appendChild(el('rect', { x:x0-1, y:topY, width:w+2, height:ELEV_CTR_H, fill:'#dedad4', stroke:'#bbb', 'stroke-width':0.6 }));
  }

  const innerTop = topY + (isMounted ? 0 : ELEV_CTR_H);
  const innerBot = isMounted ? topY + h : ELEV_FLOOR_Y - ELEV_KICK_H;
  const innerH   = innerBot - innerTop;

  if (vanity.type === 'sink')     drawElevSink(svg, vanity, sinkPos, x0, topY, w, innerTop, innerBot, innerH);
  if (vanity.type === 'drawer')   drawElevDrawers(svg, x0, innerTop, w, innerH);
  if (vanity.type === 'base')     drawElevBase(svg, vanity, x0, innerTop, w, innerH);
  if (vanity.type === 'linen')    drawElevLinen(svg, vanity, x0, innerTop, w, innerH);
  if (vanity.type === 'medicine') drawElevMedicine(svg, x0, topY, w, h);
  if (vanity.type === 'mirror')   drawElevMirror(svg, x0, topY, w, h);

  // Labels below floor line
  svg.appendChild(svgText(x0 + w/2, ELEV_FLOOR_Y + 12, `${vanity.w}"`, { size:6,   fill:'#666' }));
  svg.appendChild(svgText(x0 + w/2, ELEV_FLOOR_Y + 20, vanity.id,      { size:4.5, fill:'#999' }));
}

// ── sink ─────────────────────────────────────────────────────────────────────
function drawElevSink(svg, vanity, sinkPos, x0, topY, w, innerTop, innerBot, innerH) {
  // Basin visible above tilt-out, sitting at counter level
  const basinW = Math.min(w * 0.62, 14 * STRIP_SCALE);
  const basinH = 5 * ELEV_Y;
  const basinX = sinkPos === 'L' ? x0 + 4
               : sinkPos === 'R' ? x0 + w - basinW - 4
               : x0 + (w - basinW) / 2;
  const basinY = topY + ELEV_CTR_H * 0.4;
  // Basin
  svg.appendChild(el('rect',   { x:basinX, y:basinY, width:basinW, height:basinH, rx:basinH/2, fill:'rgba(255,255,255,0.8)', stroke:'#888', 'stroke-width':0.8 }));
  // Drain
  svg.appendChild(el('circle', { cx:basinX+basinW/2, cy:basinY+basinH*0.6, r:2, fill:'#aaa' }));
  // Faucet nub above basin
  svg.appendChild(el('rect',   { x:basinX+basinW/2-4, y:topY-3, width:8, height:4, rx:1.5, fill:'#aaa' }));

  // Tilt-out strip
  const tiltH = 2.5 * ELEV_Y;
  svg.appendChild(el('rect', { x:x0+2, y:innerTop+2, width:w-4, height:tiltH-2, fill:'rgba(0,0,0,0.07)', stroke:'rgba(0,0,0,0.2)', 'stroke-width':0.5 }));

  // Door / drawer panels below tilt-out
  const doorTop = innerTop + tiltH + 2;
  const doorH   = innerBot - doorTop;
  const isDL    = vanity.id.endsWith('DL');
  const isDR    = vanity.id.endsWith('DR');
  if (isDL || isDR) {
    // Asymmetric: one side has a door, other side has drawers
    const doorSide   = isDL ? 'L' : 'R';
    const drawerSide = isDL ? 'R' : 'L';
    const halfW      = w / 2;
    const doorX      = doorSide   === 'L' ? x0 : x0 + halfW;
    const drawerX    = drawerSide === 'L' ? x0 : x0 + halfW;
    // Door panel
    svg.appendChild(el('rect', { x:doorX+2, y:doorTop+2, width:halfW-4, height:doorH-4, rx:1, fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,0.3)', 'stroke-width':0.7 }));
    svg.appendChild(elevPull(doorX+halfW/2, doorTop+doorH*0.4, doorX+halfW/2, doorTop+doorH*0.6));
    // Drawers (2)
    const dH2 = doorH / 2;
    for (let i = 0; i < 2; i++) {
      const dy = doorTop + i * dH2;
      svg.appendChild(el('rect', { x:drawerX+2, y:dy+2, width:halfW-4, height:dH2-4, rx:1, fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,0.25)', 'stroke-width':0.7 }));
      svg.appendChild(el('line', { x1:drawerX+halfW/2-8, y1:dy+dH2/2, x2:drawerX+halfW/2+8, y2:dy+dH2/2, stroke:'rgba(0,0,0,0.45)', 'stroke-width':2, 'stroke-linecap':'round' }));
    }
    // Center divider
    svg.appendChild(el('line', { x1:x0+w/2, y1:doorTop, x2:x0+w/2, y2:innerBot, stroke:'rgba(0,0,0,0.2)', 'stroke-width':1.5 }));
  } else {
    drawElevTwoDoors(svg, x0, doorTop, w, doorH, vanity.id === 'FSVA24');
  }
}

// ── drawers ──────────────────────────────────────────────────────────────────
function drawElevDrawers(svg, x0, innerTop, w, innerH) {
  const dH = innerH / 3;
  for (let i = 0; i < 3; i++) {
    const dy = innerTop + i * dH;
    svg.appendChild(el('rect', { x:x0+3, y:dy+2, width:w-6, height:dH-4, rx:1, fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,0.25)', 'stroke-width':0.7 }));
    const pullLen = Math.min(w * 0.4, 24);
    const pullY   = dy + dH / 2;
    svg.appendChild(el('line', { x1:x0+w/2-pullLen/2, y1:pullY, x2:x0+w/2+pullLen/2, y2:pullY, stroke:'rgba(0,0,0,0.45)', 'stroke-width':2, 'stroke-linecap':'round' }));
  }
}

// ── base cabinet ─────────────────────────────────────────────────────────────
function drawElevBase(svg, vanity, x0, innerTop, w, innerH) {
  if (vanity.id === 'SVA24P') {
    // 2 doors, no drawer
    drawElevTwoDoors(svg, x0, innerTop, w, innerH, false);
  } else {
    // 1 small drawer at top + 1 door below (SVA09B–SVA21B)
    const drawerH = 9 * ELEV_Y; // ~9" drawer
    const dY      = innerTop;
    svg.appendChild(el('rect', { x:x0+3, y:dY+2, width:w-6, height:drawerH-4, rx:1, fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,0.25)', 'stroke-width':0.7 }));
    const pullLen = Math.min(w * 0.4, 24);
    svg.appendChild(el('line', { x1:x0+w/2-pullLen/2, y1:dY+drawerH/2, x2:x0+w/2+pullLen/2, y2:dY+drawerH/2, stroke:'rgba(0,0,0,0.45)', 'stroke-width':2, 'stroke-linecap':'round' }));
    // Door below
    const doorTop = innerTop + drawerH;
    const doorH   = innerH - drawerH;
    svg.appendChild(el('rect', { x:x0+3, y:doorTop+2, width:w-6, height:doorH-4, rx:1, fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,0.3)', 'stroke-width':0.7 }));
    svg.appendChild(elevPull(x0+w/2, doorTop+doorH*0.4, x0+w/2, doorTop+doorH*0.6));
  }
}

// ── linen ────────────────────────────────────────────────────────────────────
function drawElevLinen(svg, vanity, x0, innerTop, w, innerH) {
  if (vanity.id === 'SVA188124P') {
    drawElevTwoDoors(svg, x0, innerTop, w, innerH, false);
  } else {
    // DV1245: 2 small drawers top, 1 door below
    const drawerAreaH = innerH * 0.38;
    const dH = drawerAreaH / 2;
    for (let i = 0; i < 2; i++) {
      const dy = innerTop + i * dH;
      svg.appendChild(el('rect', { x:x0+3, y:dy+2, width:w-6, height:dH-4, rx:1, fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,0.25)', 'stroke-width':0.7 }));
      svg.appendChild(elevPull(x0+w/2-8, dy+dH/2, x0+w/2+8, dy+dH/2));
    }
    const doorTop = innerTop + drawerAreaH;
    const doorH   = innerH - drawerAreaH;
    svg.appendChild(el('rect', { x:x0+3, y:doorTop+2, width:w-6, height:doorH-4, rx:1, fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,0.3)', 'stroke-width':0.7 }));
    svg.appendChild(elevPull(x0+w/2, doorTop+doorH*0.35, x0+w/2, doorTop+doorH*0.65));
  }
}

// ── medicine cabinet ─────────────────────────────────────────────────────────
function drawElevMedicine(svg, x0, topY, w, h) {
  svg.appendChild(el('rect', { x:x0+2, y:topY+2, width:w-4, height:h-4, rx:1, fill:'rgba(210,230,245,0.6)', stroke:'#9ab', 'stroke-width':0.8 }));
  // Hinges
  for (const hy of [topY + h*0.25, topY + h*0.75])
    svg.appendChild(el('rect', { x:x0+3, y:hy-3, width:3, height:6, rx:1, fill:'#aaa' }));
  // Pull
  svg.appendChild(elevPull(x0+w-8, topY+h*0.4, x0+w-8, topY+h*0.6));
}

// ── mirror ───────────────────────────────────────────────────────────────────
function drawElevMirror(svg, x0, topY, w, h) {
  const fw = 3;
  svg.appendChild(el('rect', { x:x0,    y:topY,    width:w,      height:h,      rx:1, fill:'#b8a080', stroke:'#8B7355', 'stroke-width':1.2 }));
  svg.appendChild(el('rect', { x:x0+fw, y:topY+fw, width:w-fw*2, height:h-fw*2,       fill:'rgba(210,235,250,0.75)', stroke:'#c8d4dc', 'stroke-width':0.5 }));
  // Glint
  svg.appendChild(el('line', { x1:x0+fw+3, y1:topY+fw+3, x2:x0+fw+3+(w-fw*2)*0.35, y2:topY+fw+3, stroke:'rgba(255,255,255,0.7)', 'stroke-width':1.5 }));
}

// ── shared helpers ────────────────────────────────────────────────────────────
function drawElevTwoDoors(svg, x0, top, totalW, h, curved) {
  const mid = x0 + totalW / 2;
  const r   = curved ? 4 : 1;
  svg.appendChild(el('rect', { x:x0+3,   y:top+2, width:totalW/2-5, height:h-4, rx:r, fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,0.3)', 'stroke-width':0.7 }));
  svg.appendChild(el('rect', { x:mid+2,  y:top+2, width:totalW/2-5, height:h-4, rx:r, fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,0.3)', 'stroke-width':0.7 }));
  svg.appendChild(el('line', { x1:mid, y1:top, x2:mid, y2:top+h, stroke:'rgba(0,0,0,0.2)', 'stroke-width':2 }));
  // Pulls near center stile
  const pullY = top + h * 0.5;
  svg.appendChild(elevPull(mid-10, pullY-5, mid-10, pullY+5));
  svg.appendChild(elevPull(mid+8,  pullY-5, mid+8,  pullY+5));
}

function elevPull(x1, y1, x2, y2) {
  return el('line', { x1, y1, x2, y2, stroke:'rgba(0,0,0,0.45)', 'stroke-width':2, 'stroke-linecap':'round' });
}
