// ─── 3D RENDER (Three.js r128) ────────────────────────────────────────────────
// All units = inches. Room polygon in (x, z) plane; y = up.

let scene, camera, renderer, controls, vanityGroup, rendererReady = false, resizeObs = null;

// ── Wall config (mirrors floorplan.js anchors) ────────────────────────────────
const WALL_CONFIG = {
  W1: { wallX: 130, anchorZ: 96,  dir: -1, stackDir: +1 }, // East wall: protrudes -x, stacks +z
  W2: { wallX:   0, anchorZ:  96, dir: +1, stackDir: +1 }, // West wall: protrudes +x, stacks +z
};

// ── Face detail constants ─────────────────────────────────────────────────────
const KICK_H   = 3.5;   // toe-kick strip height
const FACE_CTR = 1.5;   // top-rail height (above door/drawer area)
const TILT_H   = 2.5;   // tilt-out strip height under countertop
const PANEL_T  = 0.4;   // face-panel protrusion thickness

// ── Helpers ───────────────────────────────────────────────────────────────────
function lightenColor(hex, amt) {
  const clamp = v => Math.max(0, Math.min(0xff, v));
  const r = clamp(((hex >> 16) & 0xff) + amt);
  const g = clamp(((hex >>  8) & 0xff) + amt);
  const b = clamp((hex & 0xff)          + amt);
  return (r << 16) | (g << 8) | b;
}

function makeMesh(geo, color, opacity) {
  const mat = new THREE.MeshPhongMaterial({
    color,
    shininess: 30,
    specular: 0x111111,
    transparent: opacity < 1,
    opacity: opacity !== undefined ? opacity : 1,
  });
  return new THREE.Mesh(geo, mat);
}

function makeBox(w, h, d, color, opacity) {
  return makeMesh(new THREE.BoxGeometry(w, h, d), color, opacity);
}

// Thin box placed on the front face. fX = room-facing surface X coordinate.
// The box protrudes dir*T/2 into the room (no z-fighting with body).
function makeFaceBox(fX, dir, T, boxH, boxW, color, cy, cz, shininess) {
  const mat = new THREE.MeshPhongMaterial({
    color,
    shininess: shininess !== undefined ? shininess : 30,
    specular: 0x111111,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(T, boxH, boxW), mat);
  mesh.position.set(fX + dir * T / 2, cy, cz);
  return mesh;
}

function addPull(group, fX, dir, pullW, cy, cz) {
  const mat = new THREE.MeshPhongMaterial({ color: 0x9a9080, shininess: 80, specular: 0x666666 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(PANEL_T, 0.5, pullW), mat);
  mesh.position.set(fX + dir * PANEL_T / 2, cy, cz);
  group.add(mesh);
}

function addDoorPanel(group, fX, dir, panelH, panelW, color, cy, cz) {
  group.add(makeFaceBox(fX, dir, PANEL_T * 0.75, panelH * 0.85, panelW * 0.85,
    lightenColor(color, 30), cy, cz));
}

function addToeKick(group, fX, dir, w, cz, yBase) {
  group.add(makeFaceBox(fX, dir, PANEL_T, KICK_H, w, 0x222222, yBase + KICK_H / 2, cz));
}

function addSinkBasin(group, wallX, dir, d, h, w, centerZ, sinkPos) {
  const basinW = Math.min(w * 0.55, 18);
  const basinD = Math.min(d * 0.5, 11);
  const basinH = 3.5;   // vessel-sink height — clearly visible from room angle
  let bZ = centerZ;
  if (sinkPos === 'L') bZ = centerZ - w * 0.25;
  else if (sinkPos === 'R') bZ = centerZ + w * 0.25;
  // Center the basin in the countertop depth (wall-side half)
  const bX = wallX + dir * (d * 0.45 + 0.5);
  const ctTopY = h + 1.5;   // countertop top surface
  const mat = new THREE.MeshPhongMaterial({ color: 0xf0f8ff, shininess: 80, specular: 0x334455 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(basinD, basinH, basinW), mat);
  mesh.position.set(bX, ctTopY + basinH / 2, bZ);
  group.add(mesh);
  // Drain dot
  const drainMat = new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 60, specular: 0x444444 });
  const drain = new THREE.Mesh(new THREE.BoxGeometry(basinD * 0.15, basinH * 0.05 + 0.1, basinW * 0.15), drainMat);
  drain.position.set(bX, ctTopY + basinH + 0.1, bZ);
  group.add(drain);
}

// ── Per-type face builders ────────────────────────────────────────────────────
// yBase: 0 for floor vanities, 38 for wall-mounted upper vanities

function addSinkDouble(group, fX, dir, h, w, color, centerZ, yBase) {
  addToeKick(group, fX, dir, w, centerZ, yBase);
  const workH = h - KICK_H - FACE_CTR;
  // Tilt-out strip at top of working area
  const tiltCY = yBase + KICK_H + workH - TILT_H / 2;
  group.add(makeFaceBox(fX, dir, PANEL_T, TILT_H, w * 0.96, lightenColor(color, 20), tiltCY, centerZ));
  // Two doors below tilt-out
  const doorH = workH - TILT_H;
  const doorCY = yBase + KICK_H + doorH / 2;
  addDoorPanel(group, fX, dir, doorH, w / 2 * 0.92, color, doorCY, centerZ - w / 4);
  addDoorPanel(group, fX, dir, doorH, w / 2 * 0.92, color, doorCY, centerZ + w / 4);
  // Pulls flanking center stile
  const pullCY = yBase + KICK_H + doorH * 0.4;
  addPull(group, fX, dir, 3.5, pullCY, centerZ - 1.5);
  addPull(group, fX, dir, 3.5, pullCY, centerZ + 1.5);
}

function addSinkDL(group, fX, dir, h, w, color, centerZ, yBase) {
  // Door-Left, Drawers-Right
  addToeKick(group, fX, dir, w, centerZ, yBase);
  const workH = h - KICK_H - FACE_CTR;
  const tiltCY = yBase + KICK_H + workH - TILT_H / 2;
  group.add(makeFaceBox(fX, dir, PANEL_T, TILT_H, w * 0.96, lightenColor(color, 20), tiltCY, centerZ));
  const doorH = workH - TILT_H;
  const doorCY = yBase + KICK_H + doorH / 2;
  // Left half: 1 door
  addDoorPanel(group, fX, dir, doorH, w / 2 * 0.92, color, doorCY, centerZ - w / 4);
  // Right half: 2 stacked drawers
  const drH = doorH / 2;
  addDoorPanel(group, fX, dir, drH * 0.88, w / 2 * 0.88, color, doorCY + drH / 4, centerZ + w / 4);
  addDoorPanel(group, fX, dir, drH * 0.88, w / 2 * 0.88, color, doorCY - drH / 4, centerZ + w / 4);
  addPull(group, fX, dir, 3.5, doorCY, centerZ - 1.5);
  addPull(group, fX, dir, 3,   doorCY + drH / 4, centerZ + w / 4);
  addPull(group, fX, dir, 3,   doorCY - drH / 4, centerZ + w / 4);
}

function addSinkDR(group, fX, dir, h, w, color, centerZ, yBase) {
  // Drawers-Left, Door-Right
  addToeKick(group, fX, dir, w, centerZ, yBase);
  const workH = h - KICK_H - FACE_CTR;
  const tiltCY = yBase + KICK_H + workH - TILT_H / 2;
  group.add(makeFaceBox(fX, dir, PANEL_T, TILT_H, w * 0.96, lightenColor(color, 20), tiltCY, centerZ));
  const doorH = workH - TILT_H;
  const doorCY = yBase + KICK_H + doorH / 2;
  // Left half: 2 stacked drawers
  const drH = doorH / 2;
  addDoorPanel(group, fX, dir, drH * 0.88, w / 2 * 0.88, color, doorCY + drH / 4, centerZ - w / 4);
  addDoorPanel(group, fX, dir, drH * 0.88, w / 2 * 0.88, color, doorCY - drH / 4, centerZ - w / 4);
  // Right half: 1 door
  addDoorPanel(group, fX, dir, doorH, w / 2 * 0.92, color, doorCY, centerZ + w / 4);
  addPull(group, fX, dir, 3,   doorCY + drH / 4, centerZ - w / 4);
  addPull(group, fX, dir, 3,   doorCY - drH / 4, centerZ - w / 4);
  addPull(group, fX, dir, 3.5, doorCY, centerZ + 1.5);
}

function addDrawerFace(group, fX, dir, h, w, color, centerZ, yBase) {
  addToeKick(group, fX, dir, w, centerZ, yBase);
  const workH = h - KICK_H - FACE_CTR;
  const drH = workH / 3;
  for (let i = 0; i < 3; i++) {
    const cy = yBase + KICK_H + drH * (i + 0.5);
    addDoorPanel(group, fX, dir, drH * 0.88, w * 0.92, color, cy, centerZ);
    addPull(group, fX, dir, Math.min(w * 0.4, 6), cy, centerZ);
  }
}

function addBaseSingle(group, fX, dir, h, w, color, centerZ, yBase) {
  // 9" drawer at top, 1 door below
  addToeKick(group, fX, dir, w, centerZ, yBase);
  const workH = h - KICK_H - FACE_CTR;
  const drawerH = 9;
  const doorH = workH - drawerH;
  const drawerCY = yBase + KICK_H + doorH + drawerH / 2;
  const doorCY   = yBase + KICK_H + doorH / 2;
  addDoorPanel(group, fX, dir, drawerH * 0.85, w * 0.92, color, drawerCY, centerZ);
  addDoorPanel(group, fX, dir, doorH   * 0.88, w * 0.88, color, doorCY,   centerZ);
  addPull(group, fX, dir, Math.min(w * 0.4, 5), drawerCY,              centerZ);
  addPull(group, fX, dir, Math.min(w * 0.4, 5), doorCY + doorH * 0.2,  centerZ);
}

function addBaseDouble(group, fX, dir, h, w, color, centerZ, yBase) {
  // 2 side-by-side doors full working height (SVA24P)
  addToeKick(group, fX, dir, w, centerZ, yBase);
  const workH = h - KICK_H - FACE_CTR;
  const doorCY = yBase + KICK_H + workH / 2;
  addDoorPanel(group, fX, dir, workH * 0.92, w / 2 * 0.90, color, doorCY, centerZ - w / 4);
  addDoorPanel(group, fX, dir, workH * 0.92, w / 2 * 0.90, color, doorCY, centerZ + w / 4);
  const pullCY = yBase + KICK_H + workH * 0.4;
  addPull(group, fX, dir, 3.5, pullCY, centerZ - 1.5);
  addPull(group, fX, dir, 3.5, pullCY, centerZ + 1.5);
}

function addLinenDouble(group, fX, dir, h, w, color, centerZ, yBase) {
  // Tall linen (SVA188124P, h=81): 2 side-by-side full-height doors
  addToeKick(group, fX, dir, w, centerZ, yBase);
  const workH = h - KICK_H - FACE_CTR;
  const doorCY = yBase + KICK_H + workH / 2;
  addDoorPanel(group, fX, dir, workH * 0.93, w / 2 * 0.90, color, doorCY, centerZ - w / 4);
  addDoorPanel(group, fX, dir, workH * 0.93, w / 2 * 0.90, color, doorCY, centerZ + w / 4);
  const pullCY = yBase + KICK_H + workH * 0.35;
  addPull(group, fX, dir, 3.5, pullCY, centerZ - 1.5);
  addPull(group, fX, dir, 3.5, pullCY, centerZ + 1.5);
}

function addLinenDrawerDoor(group, fX, dir, h, w, color, centerZ, yBase) {
  // Counter linen (DV1245, h=45.5): 2 stacked drawers top, 1 door below
  addToeKick(group, fX, dir, w, centerZ, yBase);
  const workH = h - KICK_H - FACE_CTR;
  const drawersH = workH * 0.38;
  const doorH = workH - drawersH;
  const drH = drawersH / 2;
  const topDrCY = yBase + KICK_H + doorH + drH * 1.5;
  const botDrCY = yBase + KICK_H + doorH + drH * 0.5;
  const doorCY  = yBase + KICK_H + doorH / 2;
  addDoorPanel(group, fX, dir, drH  * 0.88, w * 0.90, color, topDrCY, centerZ);
  addDoorPanel(group, fX, dir, drH  * 0.88, w * 0.90, color, botDrCY, centerZ);
  addDoorPanel(group, fX, dir, doorH * 0.92, w * 0.88, color, doorCY,  centerZ);
  const pullW = Math.min(w * 0.4, 5);
  addPull(group, fX, dir, pullW, topDrCY,             centerZ);
  addPull(group, fX, dir, pullW, botDrCY,             centerZ);
  addPull(group, fX, dir, pullW, doorCY + doorH * 0.25, centerZ);
}

function addMedicineFace(group, fX, dir, h, w, color, centerZ, yBase) {
  const panelCY = yBase + h / 2;
  addDoorPanel(group, fX, dir, h * 0.92, w * 0.90, color, panelCY, centerZ);
  // Hinge strip on left edge
  const hingeCZ = centerZ - w / 2 + 0.4;
  group.add(makeFaceBox(fX, dir, PANEL_T * 0.6, h * 0.5, 0.8, 0x888888, panelCY, hingeCZ));
  // Bar pull on right side
  addPull(group, fX, dir, 3, panelCY, centerZ + w * 0.3);
}

function addFillerFace(group, fX, dir, h, w, color, centerZ, yBase) {
  // Outer face frame
  group.add(makeFaceBox(fX, dir, PANEL_T, h * 0.96, w * 0.96, lightenColor(color, 15), yBase + h / 2, centerZ));
  // 2 horizontal shelf bars dividing into 3 open bays
  const bay = h / 3;
  for (let i = 1; i <= 2; i++) {
    const shelfCY = yBase + bay * i;
    group.add(makeFaceBox(fX, dir, PANEL_T * 1.5, 0.75, w * 0.90, lightenColor(color, -10), shelfCY, centerZ));
  }
}

function addMirrorFace(group, fX, dir, h, w, color, centerZ, yBase) {
  // Glass panel inset into the frame
  const glassMat = new THREE.MeshPhongMaterial({
    color: 0xc8dce8,
    shininess: 120,
    specular: 0x448899,
    transparent: true,
    opacity: 0.7,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(PANEL_T, h * 0.88, w * 0.88), glassMat);
  mesh.position.set(fX + dir * PANEL_T / 2, yBase + h / 2, centerZ);
  group.add(mesh);
}

function addFaceDetails(group, vanity, sinkPos, wallX, dir, d, h, w, centerZ, yBase) {
  const fX    = wallX + dir * d;
  const color = parseInt(vanity.color.replace('#', ''), 16);
  const type  = vanity.type;
  const id    = vanity.id;

  if (type === 'sink') {
    if      (id.includes('DL')) addSinkDL    (group, fX, dir, h, w, color, centerZ, yBase);
    else if (id.includes('DR')) addSinkDR    (group, fX, dir, h, w, color, centerZ, yBase);
    else                        addSinkDouble(group, fX, dir, h, w, color, centerZ, yBase);
    addSinkBasin(group, wallX, dir, d, h, w, centerZ, sinkPos);
  } else if (type === 'drawer') {
    addDrawerFace (group, fX, dir, h, w, color, centerZ, yBase);
  } else if (type === 'base') {
    if (id.endsWith('P')) addBaseDouble(group, fX, dir, h, w, color, centerZ, yBase);
    else                  addBaseSingle(group, fX, dir, h, w, color, centerZ, yBase);
  } else if (type === 'linen') {
    if (h > 60) addLinenDouble     (group, fX, dir, h, w, color, centerZ, yBase);
    else        addLinenDrawerDoor (group, fX, dir, h, w, color, centerZ, yBase);
  } else if (type === 'medicine') {
    addMedicineFace(group, fX, dir, h, w, color, centerZ, yBase);
  } else if (type === 'mirror') {
    addMirrorFace  (group, fX, dir, h, w, color, centerZ, yBase);
  } else if (type === 'filler') {
    addFillerFace  (group, fX, dir, h, w, color, centerZ, yBase);
  }
}


// ── Vanity geometry (redrawn on every change) ─────────────────────────────────
function drawWallVanities3d(wallId) {
  const wall = WALLS[wallId];
  const { wallX, anchorZ, dir, stackDir } = WALL_CONFIG[wallId];

  // Floor vanities
  let offset = 0;
  for (const { vanity, sinkPos } of wall.placements) {
    const w = vanity.w, h = vanity.h, d = vanity.d;
    offset += w;
    const centerZ = anchorZ + stackDir * (offset - w / 2);
    const centerX = wallX + dir * d / 2;
    const color = parseInt(vanity.color.replace('#', ''), 16);

    const mesh = makeBox(d, h, w, color, 0.9);
    mesh.position.set(centerX, h / 2, centerZ);
    vanityGroup.add(mesh);

    // Countertop: 1.5" slab, 1" overhang on room side
    const ctDepth = d + 1;
    const ctMesh = makeBox(ctDepth, 1.5, w, 0xdedad4, 1);
    ctMesh.position.set(wallX + dir * (d / 2 + 0.5), h + 0.75, centerZ);
    vanityGroup.add(ctMesh);

    addFaceDetails(vanityGroup, vanity, sinkPos, wallX, dir, d, h, w, centerZ, 0);
  }

  // Upper / wall-mounted
  let upperOffset = 0;
  for (const { vanity, sinkPos } of wall.upper) {
    const w = vanity.w, h = vanity.h, d = Math.max(vanity.d, 1);
    upperOffset += w;
    const centerZ = anchorZ + stackDir * (upperOffset - w / 2);
    const centerX = wallX + dir * d / 2;
    const centerY = 38 + h / 2;
    const color = parseInt(vanity.color.replace('#', ''), 16);

    const mesh = makeBox(d, h, w, color, 0.75);
    mesh.position.set(centerX, centerY, centerZ);
    vanityGroup.add(mesh);

    addFaceDetails(vanityGroup, vanity, sinkPos, wallX, dir, d, h, w, centerZ, 38);
  }
}

function redraw3d() {
  if (!rendererReady) return;
  // Dispose old meshes
  while (vanityGroup.children.length > 0) {
    const child = vanityGroup.children[0];
    child.geometry.dispose();
    child.material.dispose();
    vanityGroup.remove(child);
  }
  drawWallVanities3d('W1');
  drawWallVanities3d('W2');
}

// ── Resize handler ────────────────────────────────────────────────────────────
function onResize3d() {
  const canvas = renderer.domElement;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (w === 0 || h === 0) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

// ── Animation loop ────────────────────────────────────────────────────────────
function animate3d() {
  requestAnimationFrame(animate3d);
  controls.update();
  renderer.render(scene, camera);
}

// ── Room shell ────────────────────────────────────────────────────────────────
// Coordinate mapping from floorplan.js grid:
//   col c → x = (c − 4) × (130/19)   [col 4 = x 0, col 23 = x 130]
//   row r → z = 96 + (r − 10) × 12   [row 10 = z 96 (anchorZ), 1 row = 12"]
// Key x boundaries (approx): tub/shower divider x≈41, WC divider x≈103
// Key z boundaries: shower/tub step z=36, fixture/vanity boundary z=96
const X_DIV  = Math.round(6  * 130 / 19); // ≈ 41  — shower|tub+WC divider
const X_WC   = Math.round(15 * 130 / 19); // ≈ 103 — tub|WC divider
const Z_STEP = 36;  // z where shower front wall meets the tub
const Z_FIX  = 96;  // z where fixture zone ends / vanity zone begins
const ROOM_H = 96;  // 8-foot ceiling
const ROOM_LEN = 220;

function buildRoom() {
  const wallMat  = new THREE.MeshPhongMaterial({ color: 0xf0ebe0, shininess: 4, side: THREE.DoubleSide });
  const floorMat = new THREE.MeshPhongMaterial({ color: 0xb0a090, shininess: 10 });

  // Shared geometries for repeated wall dimensions
  const geoSideWall    = new THREE.PlaneGeometry(ROOM_LEN, ROOM_H);   // W2, W1
  const geoPartitionNS = new THREE.PlaneGeometry(Z_FIX, ROOM_H);      // shower divider, WC partition
  const geoEndEW       = new THREE.PlaneGeometry(X_DIV, ROOM_H);      // shower step + shower end wall

  function wall(geo, x, y, z, ry) {
    const m = new THREE.Mesh(geo, wallMat);
    m.rotation.y = ry || 0;
    m.position.set(x, y, z);
    scene.add(m);
  }

  const cy = ROOM_H / 2;

  // Vanity side walls (full room length)
  wall(geoSideWall,   0, cy, ROOM_LEN / 2,  Math.PI / 2);  // W2 west wall
  wall(geoSideWall, 130, cy, ROOM_LEN / 2, -Math.PI / 2);  // W1 east wall

  // Back wall (z=0): spans tub + WC only
  wall(new THREE.PlaneGeometry(130 - X_DIV, ROOM_H), (X_DIV + 130) / 2, cy, 0);

  // Shower front step (z=Z_STEP, x=0→X_DIV)
  wall(geoEndEW, X_DIV / 2, cy, Z_STEP);

  // Shower/tub+WC vertical divider (x=X_DIV, z=0→Z_FIX)
  wall(geoPartitionNS, X_DIV, cy, Z_FIX / 2, Math.PI / 2);

  // WC partition (x=X_WC, z=0→Z_FIX): separates tub from WC
  wall(geoPartitionNS, X_WC, cy, Z_FIX / 2, Math.PI / 2);

  // East-west walls at z=Z_FIX closing off shower and WC toward the vanity zone
  wall(geoEndEW,                                         X_DIV / 2,        cy, Z_FIX);  // shower end wall
  wall(new THREE.PlaneGeometry(130 - X_WC, ROOM_H), (X_WC + 130) / 2, cy, Z_FIX);  // WC end wall

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(130, ROOM_LEN), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(65, 0, ROOM_LEN / 2);
  scene.add(floor);
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init3d() {
  const canvas = document.getElementById('render3dCanvas');
  if (!canvas) return;

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  const w = canvas.clientWidth || 300, h = canvas.clientHeight || 280;
  renderer.setSize(w, h, false);

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f2f5);

  // Camera — room interior, facing both walls so face details are visible
  camera = new THREE.PerspectiveCamera(65, w / h, 1, 2000);
  camera.position.set(65, 100, 370);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(65, 35, 96);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 40;
  controls.maxDistance = 600;
  controls.maxPolarAngle = Math.PI / 2;
  controls.update();

  // Lights
  scene.add(new THREE.AmbientLight(0xfff5e8, 0.7));

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(100, 120, -20);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xddeeff, 0.3);
  fillLight.position.set(-80, 60, 200);
  scene.add(fillLight);

  // Room shell (hints)
  buildRoom();

  // Vanity group
  vanityGroup = new THREE.Group();
  scene.add(vanityGroup);

  rendererReady = true;

  if (resizeObs) resizeObs.disconnect();
  resizeObs = new ResizeObserver(onResize3d);
  resizeObs.observe(canvas);

  redraw3d();
  animate3d();
}
