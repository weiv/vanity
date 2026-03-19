// Static fixtures drawn once; only the vanity layer is redrawn on changes.
let floorPlanReady = false;

function initFloorPlan() {
  if (floorPlanReady) return;
  floorPlanReady = true;
  const svg = document.getElementById('floorPlanSvg');

  // Room outline
  const outerPoints = [p(10,2), p(23,2), p(23,16), p(14,16), p(7,16), p(4,14), p(4,5), p(10,5), p(10,2)];
  svg.appendChild(el('polygon', {
    points: outerPoints.map(([x,y]) => `${x},${y}`).join(' '),
    fill: '#f0ede8', stroke: '#555', 'stroke-width': 1.2,
  }));

  // Door gap + swing arc
  const [dx1, dy1] = p(7, 16);
  const [dx2]      = p(14, 16);
  svg.appendChild(el('line', { x1:dx1, y1:dy1, x2:dx2, y2:dy1, stroke:'#f0ede8', 'stroke-width':2.5 }));
  svg.appendChild(el('path', {
    d: `M ${dx1},${dy1} Q ${dx1-8},${dy1+12} ${dx1-2},${dy1+15}`,
    fill:'none', stroke:'#aaa', 'stroke-width':0.8, 'stroke-dasharray':'2,2',
  }));

  // Fixtures
  const fixtures = [
    { c1:[10,2], c2:[17,9], fill:'#b0c4de', label:'TUB',    lsize:5.5, lfill:'#444'   },
    { c1:[4,5],  c2:[10,9], fill:'#b8d8c8', label:'SHOWER', lsize:5,   lfill:'#2d6a4f'},
    { c1:[17,2], c2:[23,9], fill:'#e8e0d0', label:'WC',     lsize:5.5, lfill:'#555'   },
  ];
  for (const { c1, c2, fill, label, lsize, lfill } of fixtures) {
    const [x1,y1] = p(...c1), [x2,y2] = p(...c2);
    svg.appendChild(el('rect', { x:x1, y:y1, width:x2-x1, height:y2-y1, fill, stroke:'#888', 'stroke-width':0.6 }));
    svg.appendChild(svgText((x1+x2)/2, (y1+y2)/2+3, label, { size:lsize, fill:lfill, bold:true }));
  }

  // Wall highlights + labels
  const walls = [
    // c2 row = c1 row + wall_length/V_SCALE: W1=72"/12=6rows, W2=48"/12=4rows
    { c1:[23,9], c2:[23,15], stroke:'#4a90d9', label:'W1', dim:'72"',  lx:+7,  dx:+3,  langle:-90, la:+11 },
    { c1:[4,9],  c2:[4,13],  stroke:'#e56b6f', label:'W2', dim:'48"',  lx:-8,  dx:-3,  langle:90,  la:-12 },
  ];
  for (const w of walls) {
    const [x1,y1] = p(...w.c1), [x2,y2] = p(...w.c2);
    const my = (y1+y2)/2;
    svg.appendChild(el('line', { x1, y1, x2, y2, stroke:w.stroke, 'stroke-width':3 }));
    svg.appendChild(svgText(x1+w.lx, my, w.label, { size:7, fill:w.stroke, bold:true, angle:w.langle }));
    svg.appendChild(el('line', { x1:x1+w.dx, y1, x2:x1+w.dx, y2, stroke:'#aaa', 'stroke-width':0.5 }));
    svg.appendChild(svgText(x1+w.la, my, w.dim, { size:5, fill:'#888', angle:w.langle }));
  }

  // Vanity layer (redrawn on changes)
  const group = document.createElementNS(ns, 'g');
  group.id = 'vanityLayer';
  svg.appendChild(group);
}

// Returns { cy, bowlH } — the sink bowl center-y offset and height within a cabinet of height pw
function sinkBowlY(pw, sinkPos) {
  const bowlH = Math.min(pw * 0.6, 16);
  const cy = sinkPos === 'L' ? 4 + bowlH / 2
           : sinkPos === 'R' ? pw - 4 - bowlH / 2
           : pw / 2;
  return { cy, bowlH };
}

function drawSinkBowl(target, cx, cy, bowlW, bowlH) {
  target.appendChild(el('ellipse', { cx, cy, rx:bowlW/2,       ry:bowlH/2,       fill:'rgba(255,255,255,0.65)', stroke:'#555',           'stroke-width':0.7 }));
  target.appendChild(el('ellipse', { cx, cy, rx:bowlW/2*0.65,  ry:bowlH/2*0.65,  fill:'rgba(255,255,255,0.3)', stroke:'rgba(0,0,0,.2)', 'stroke-width':0.5 }));
  target.appendChild(el('circle',  { cx, cy, r:1.5, fill:'#888' }));
}

// dir: +1 = protrude away from wall toward increasing x (W2/left wall)
//      -1 = protrude toward decreasing x (W1/right wall)
function drawWallVanities(group, placements, anchorCol, anchorRow, dir) {
  const [ax, ay] = p(anchorCol, anchorRow);
  let offset = 0;
  for (const { vanity, sinkPos } of placements) {
    const pw = vanity.w, pd = vanity.d;
    const vy = ay + offset;
    const vx = dir > 0 ? ax : ax - pd;
    group.appendChild(el('rect', { x:vx, y:vy, width:pd, height:pw,
      fill:vanity.color, stroke:'rgba(0,0,0,.3)', 'stroke-width':0.6, opacity:0.85 }));
    if (pw > 12) group.appendChild(svgText(vx + pd/2, vy + pw/2 + 2, vanity.id, { size:4.5, fill:'#333' }));

    if (vanity.type === 'sink' && sinkPos) {
      const { cy: scy, bowlH } = sinkBowlY(pw, sinkPos);
      const bowlW = pd * 0.62;
      const scx = dir > 0 ? vx + pd - bowlW * 0.55 : vx + bowlW * 0.55;
      drawSinkBowl(group, scx, vy + scy, bowlW, bowlH);
      // Faucet nub on back wall edge
      const faucetX = dir > 0 ? ax : ax - 2;
      group.appendChild(el('rect', { x:faucetX, y:vy + scy - 3, width:2, height:6, rx:1, fill:'rgba(0,0,0,0.4)' }));
    }
    offset += pw;
  }
}

function drawWallMounted(group, upper, anchorCol, anchorRow, dir) {
  const [ax, ay] = p(anchorCol, anchorRow);
  let offset = 0;
  for (const { vanity } of upper) {
    const pw = vanity.w, pd = Math.max(vanity.d, 0.75); // at least 0.75" visible
    const vy = ay + offset;
    const vx = dir > 0 ? ax : ax - pd;
    group.appendChild(el('rect', { x:vx, y:vy, width:pd, height:pw,
      fill:vanity.color, stroke:'#555', 'stroke-width':0.5,
      'stroke-dasharray':'2,1.5', opacity:0.55 }));
    offset += pw;
  }
}

function redrawVanities() {
  const group = document.getElementById('vanityLayer');
  group.innerHTML = '';
  drawWallVanities(group, WALLS.W1.placements, 23, 9, -1);
  drawWallVanities(group, WALLS.W2.placements,  4, 9, +1);
  drawWallMounted(group, WALLS.W1.upper, 23, 9, -1);
  drawWallMounted(group, WALLS.W2.upper,  4, 9, +1);
}

function drawFloorPlan() {
  initFloorPlan();
  redrawVanities();
}
