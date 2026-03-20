const VANITIES = [
  // Sink cabinets — center (user picks L/C/R)
  { id:'FA3021',     name:'Sink 30" (2 doors)',        type:'sink', w:30, h:33, d:21, color:'#FFB6C1' },
  { id:'FA3621',     name:'Sink 36" (2 doors)',        type:'sink', w:36, h:33, d:21, color:'#FF9AAA' },
  { id:'SVA2421',    name:'Sink 24" (2 doors)',        type:'sink', w:24, h:33, d:21, color:'#FFCCD5' },
  { id:'FSVA24',     name:'Sink 24" Curved',           type:'sink', w:24, h:33, d:21, color:'#FFE0E8' },
  // Sink cabinets — fixed L/R position (no picker; layout baked in)
  { id:'FA3021DL',   name:'Sink 30" Door-L Draw-R',   type:'sink', w:30, h:33, d:21, color:'#FFB6C1', fixedSinkPos:'L' },
  { id:'FA3021DR',   name:'Sink 30" Draw-L Door-R',   type:'sink', w:30, h:33, d:21, color:'#FFB6C1', fixedSinkPos:'R' },
  { id:'FA3621DL',   name:'Sink 36" Door-L Draw-R',   type:'sink', w:36, h:33, d:21, color:'#FF9AAA', fixedSinkPos:'L' },
  { id:'FA3621DR',   name:'Sink 36" Draw-L Door-R',   type:'sink', w:36, h:33, d:21, color:'#FF9AAA', fixedSinkPos:'R' },
  // Drawer bases
  { id:'SVA09D',     name:'Drawer Base 9"',            type:'drawer', w:9,  h:33, d:21, color:'#C8A8E8' },
  { id:'SVA12D',     name:'Drawer Base 12"',           type:'drawer', w:12, h:33, d:21, color:'#C8A8E8' },
  { id:'SVA15D',     name:'Drawer Base 15"',           type:'drawer', w:15, h:33, d:21, color:'#C8A8E8' },
  { id:'SVA18D',     name:'Drawer Base 18"',           type:'drawer', w:18, h:33, d:21, color:'#C8A8E8' },
  { id:'SVA21D',     name:'Drawer Base 21"',           type:'drawer', w:21, h:33, d:21, color:'#C8A8E8' },
  { id:'SVA24D',     name:'Drawer Base 24"',           type:'drawer', w:24, h:33, d:21, color:'#C8A8E8' },
  // Base cabinets (door + drawer, closed back)
  { id:'SVA09B',     name:'Base Cabinet 9"',           type:'base', w:9,  h:33, d:21, color:'#A8C8E8' },
  { id:'SVA12B',     name:'Base Cabinet 12"',          type:'base', w:12, h:33, d:21, color:'#A8C8E8' },
  { id:'SVA15B',     name:'Base Cabinet 15"',          type:'base', w:15, h:33, d:21, color:'#A8C8E8' },
  { id:'SVA18B',     name:'Base Cabinet 18"',          type:'base', w:18, h:33, d:21, color:'#A8C8E8' },
  { id:'SVA21B',     name:'Base Cabinet 21"',          type:'base', w:21, h:33, d:21, color:'#A8C8E8' },
  { id:'SVA24P',     name:'Base Cabinet 24" (2 doors)',type:'base', w:24, h:33, d:21, color:'#A8C8E8' },
  // Linen / tall
  { id:'SVA188124P', name:'Linen Cabinet 18"',         type:'linen',    w:18, h:81,   d:24,   color:'#90EE90' },
  { id:'DV1245',     name:'Counter Linen 12"',         type:'linen',    w:12, h:45.5, d:12,   color:'#98FB98' },
  // Wall-mounted
  { id:'WV12336',    name:'Medicine Cab 12"',          type:'medicine', w:12, h:33,   d:6,    color:'#87CEEB' },
  { id:'SVAM2427',   name:'Mirror 24"',                type:'mirror',   w:24, h:27,   d:0.75, color:'#F0E68C' },
  { id:'SVAM3027',   name:'Mirror 30"',                type:'mirror',   w:30, h:27,   d:0.75, color:'#F0E68C' },
  // Hanging fillers (wall-mounted open panels, 12" wide)
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
