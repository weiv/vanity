const VANITIES = [
  // Sink cabinets — center (user picks L/C/R)
  // photoBox: [x1, y1, x2, y2] as fractions of image — crops to the front-view drawing
  { id:'FA3021',     name:'Sink 30" (2 doors)',        type:'sink', w:30, h:33, d:21, color:'#FFB6C1', photo:'IMG_4065.jpeg', photoY:15, photoBox:[0.44,0.00,0.86,0.32] },
  { id:'FA3621',     name:'Sink 36" (2 doors)',        type:'sink', w:36, h:33, d:21, color:'#FF9AAA', photo:'IMG_4065.jpeg', photoY:15, photoBox:[0.44,0.00,0.86,0.32] },
  { id:'SVA2421',    name:'Sink 24" (2 doors)',        type:'sink', w:24, h:33, d:21, color:'#FFCCD5', photo:'IMG_4067.jpeg', photoY:72, photoBox:[0.44,0.46,0.86,0.93] },
  { id:'FSVA24',     name:'Sink 24" Curved',           type:'sink', w:24, h:33, d:21, color:'#FFE0E8', photo:'IMG_4067.jpeg', photoY:22, photoBox:[0.44,0.01,0.86,0.48] },
  // Sink cabinets — fixed L/R position (no picker; layout baked in)
  { id:'FA3021DL',   name:'Sink 30" Door-L Draw-R',   type:'sink', w:30, h:33, d:21, color:'#FFB6C1', fixedSinkPos:'L', photo:'IMG_4065.jpeg', photoY:50, photoBox:[0.44,0.28,0.86,0.65] },
  { id:'FA3021DR',   name:'Sink 30" Draw-L Door-R',   type:'sink', w:30, h:33, d:21, color:'#FFB6C1', fixedSinkPos:'R', photo:'IMG_4065.jpeg', photoY:82, photoBox:[0.44,0.59,0.86,0.95] },
  { id:'FA3621DL',   name:'Sink 36" Door-L Draw-R',   type:'sink', w:36, h:33, d:21, color:'#FF9AAA', fixedSinkPos:'L', photo:'IMG_4066.jpeg', photoY:25, photoBox:[0.44,0.00,0.86,0.48] },
  { id:'FA3621DR',   name:'Sink 36" Draw-L Door-R',   type:'sink', w:36, h:33, d:21, color:'#FF9AAA', fixedSinkPos:'R', photo:'IMG_4066.jpeg', photoY:75, photoBox:[0.44,0.46,0.86,0.99] },
  // Drawer bases
  { id:'SVA09D',     name:'Drawer Base 9"',            type:'drawer', w:9,  h:33, d:21, color:'#C8A8E8', photo:'IMG_4069.jpeg', photoY:25, photoBox:[0.44,0.00,0.86,0.46] },
  { id:'SVA12D',     name:'Drawer Base 12"',           type:'drawer', w:12, h:33, d:21, color:'#C8A8E8', photo:'IMG_4069.jpeg', photoY:25, photoBox:[0.44,0.00,0.86,0.46] },
  { id:'SVA15D',     name:'Drawer Base 15"',           type:'drawer', w:15, h:33, d:21, color:'#C8A8E8', photo:'IMG_4069.jpeg', photoY:25, photoBox:[0.44,0.00,0.86,0.46] },
  { id:'SVA18D',     name:'Drawer Base 18"',           type:'drawer', w:18, h:33, d:21, color:'#C8A8E8', photo:'IMG_4069.jpeg', photoY:25, photoBox:[0.44,0.00,0.86,0.46] },
  { id:'SVA21D',     name:'Drawer Base 21"',           type:'drawer', w:21, h:33, d:21, color:'#C8A8E8', photo:'IMG_4069.jpeg', photoY:25, photoBox:[0.44,0.00,0.86,0.46] },
  { id:'SVA24D',     name:'Drawer Base 24"',           type:'drawer', w:24, h:33, d:21, color:'#C8A8E8', photo:'IMG_4069.jpeg', photoY:25, photoBox:[0.44,0.00,0.86,0.46] },
  // Base cabinets (door + drawer, closed back)
  { id:'SVA09B',     name:'Base Cabinet 9"',           type:'base', w:9,  h:33, d:21, color:'#A8C8E8', photo:'IMG_4068.jpeg', photoY:72, photoBox:[0.44,0.42,0.86,0.88] },
  { id:'SVA12B',     name:'Base Cabinet 12"',          type:'base', w:12, h:33, d:21, color:'#A8C8E8', photo:'IMG_4068.jpeg', photoY:72, photoBox:[0.44,0.42,0.86,0.88] },
  { id:'SVA15B',     name:'Base Cabinet 15"',          type:'base', w:15, h:33, d:21, color:'#A8C8E8', photo:'IMG_4068.jpeg', photoY:72, photoBox:[0.44,0.42,0.86,0.88] },
  { id:'SVA18B',     name:'Base Cabinet 18"',          type:'base', w:18, h:33, d:21, color:'#A8C8E8', photo:'IMG_4068.jpeg', photoY:72, photoBox:[0.44,0.42,0.86,0.88] },
  { id:'SVA21B',     name:'Base Cabinet 21"',          type:'base', w:21, h:33, d:21, color:'#A8C8E8', photo:'IMG_4068.jpeg', photoY:72, photoBox:[0.44,0.42,0.86,0.88] },
  { id:'SVA24P',     name:'Base Cabinet 24" (2 doors)',type:'base', w:24, h:33, d:21, color:'#A8C8E8', photo:'IMG_4068.jpeg', photoY:20, photoBox:[0.44,0.00,0.86,0.44] },
  // Linen / tall
  { id:'SVA188124P', name:'Linen Cabinet 18"',         type:'linen',    w:18, h:81,   d:24,   color:'#90EE90', photo:'IMG_4069.jpeg', photoY:72, photoBox:[0.44,0.44,0.86,1.00] },
  { id:'DV1245',     name:'Counter Linen 12"',         type:'linen',    w:12, h:45.5, d:12,   color:'#98FB98', photo:'IMG_4070.jpeg', photoY:18, photoBox:[0.44,0.00,0.86,0.38] },
  // Wall-mounted
  { id:'WV12336',    name:'Medicine Cab 12"',          type:'medicine', w:12, h:33,   d:6,    color:'#87CEEB', photo:'IMG_4070.jpeg', photoY:52, photoBox:[0.00,0.29,0.52,0.68] },
  { id:'SVAM2427',   name:'Mirror 24"',                type:'mirror',   w:24, h:27,   d:0.75, color:'#F0E68C', photo:'IMG_4070.jpeg', photoY:80, photoBox:[0.00,0.57,0.62,1.00] },
  { id:'SVAM3027',   name:'Mirror 30"',                type:'mirror',   w:30, h:27,   d:0.75, color:'#F0E68C', photo:'IMG_4070.jpeg', photoY:80, photoBox:[0.00,0.57,0.62,1.00] },
  // Hanging fillers (wall-mounted open panels, 12" wide) — not in catalog pages
  { id:'SVAF1218',   name:'Hanging Filler 12"×18"',   type:'filler',   w:12, h:18,   d:4,    color:'#C8AE95' },
  { id:'SVAF1227',   name:'Hanging Filler 12"×27"',   type:'filler',   w:12, h:27,   d:4,    color:'#C8AE95' },
];

const WALLS = {
  W1: { label:'W1 (East)', limit:72, placements:[], upper:[], color:'#4a90d9' },
  W2: { label:'W2 (West)', limit:48, placements:[], upper:[], color:'#e56b6f' },
};

function isMounted(vanity) { return vanity.type === 'mirror' || vanity.type === 'medicine' || vanity.type === 'filler'; }

// Sink bowl position selected in catalog (survives filter changes)
const sinkPositions = {}; // vanityId -> 'L'|'C'|'R', default 'C'
function getSinkPos(id) { return sinkPositions[id] || 'C'; }
function setSinkPos(id, pos) { sinkPositions[id] = pos; renderCatalog(); }
