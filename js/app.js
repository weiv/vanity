// ─── PERSISTENCE ─────────────────────────────────────────────────────────────
function saveState() {
  const data = {};
  for (const [wallId, wall] of Object.entries(WALLS))
    data[wallId] = {
      floor: wall.placements.map(pl => ({ id: pl.vanity.id, sinkPos: pl.sinkPos })),
      upper: wall.upper.map(pl => ({ id: pl.vanity.id, sinkPos: pl.sinkPos })),
    };
  localStorage.setItem('vanityPlanner', JSON.stringify(data));
}

function loadState() {
  try {
    const raw = localStorage.getItem('vanityPlanner');
    if (!raw) return;
    for (const [wallId, saved] of Object.entries(JSON.parse(raw))) {
      if (!WALLS[wallId]) continue;
      // Backwards-compat: old format was an array (floor only)
      const floorItems = Array.isArray(saved) ? saved : (saved.floor || []);
      const upperItems = Array.isArray(saved) ? [] : (saved.upper || []);
      WALLS[wallId].placements = floorItems.flatMap(({ id, sinkPos }) => {
        const vanity = VANITIES.find(v => v.id === id);
        return vanity ? [{ vanity, sinkPos }] : [];
      });
      WALLS[wallId].upper = upperItems.flatMap(({ id, sinkPos }) => {
        const vanity = VANITIES.find(v => v.id === id);
        return vanity ? [{ vanity, sinkPos }] : [];
      });
    }
  } catch (e) { /* ignore corrupt data */ }
}

// ─── ADD / REMOVE ─────────────────────────────────────────────────────────────
function addToWall(wallId, vanityId) {
  const vanity = VANITIES.find(v => v.id === vanityId);
  if (!vanity) return;
  const placement = { vanity, sinkPos: vanity.type === 'sink' ? (vanity.fixedSinkPos || getSinkPos(vanityId)) : null };
  if (isMounted(vanity)) {
    WALLS[wallId].upper.push(placement);
  } else {
    WALLS[wallId].placements.push(placement);
  }
  saveState(); renderWall(wallId); renderElevation(wallId); redrawVanities(); redraw3d();
}

function removeFromWall(wallId, idx, fromUpper) {
  if (fromUpper) {
    WALLS[wallId].upper.splice(idx, 1);
  } else {
    WALLS[wallId].placements.splice(idx, 1);
  }
  saveState(); renderWall(wallId); renderElevation(wallId); redrawVanities(); redraw3d();
}

// ─── DRAG AND DROP ────────────────────────────────────────────────────────────
let dragVanityId = null;
let stripDrag = null; // { wallId, idx, isUpper } — set when dragging a strip piece

function onDragStart(e) { dragVanityId = e.currentTarget.dataset.vanityId; e.currentTarget.classList.add('dragging'); e.dataTransfer.effectAllowed = 'copy'; }
function onDragEnd(e)   { e.currentTarget.classList.remove('dragging'); dragVanityId = null; }
function onDragOver(e)  { e.preventDefault(); e.dataTransfer.dropEffect = stripDrag ? 'move' : 'copy'; if (!stripDrag) e.currentTarget.classList.add('drag-over'); }
function onDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function onDrop(e, wallId) { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); if (!stripDrag && dragVanityId) addToWall(wallId, dragVanityId); }

function reorderStrip(fromWallId, fromIdx, toWallId, toIdx, isUpper) {
  const fromArr = isUpper ? WALLS[fromWallId].upper : WALLS[fromWallId].placements;
  const [item] = fromArr.splice(fromIdx, 1);
  const toArr = isUpper ? WALLS[toWallId].upper : WALLS[toWallId].placements;
  toArr.splice(toIdx, 0, item);
  saveState();
  new Set([fromWallId, toWallId]).forEach(wId => { renderWall(wId); renderElevation(wId); });
  redrawVanities(); redraw3d();
}

// ─── PREVIEW TABS ─────────────────────────────────────────────────────────────
function switchPreviewTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('previewPane3d').classList.toggle('hidden', tab !== '3d');
  document.getElementById('previewPaneFp').classList.toggle('hidden', tab !== 'fp');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
loadState();
renderCatalog();
renderWall('W1');
renderWall('W2');
renderElevation('W1');
renderElevation('W2');
drawFloorPlan();
init3d();
