const STRIP_SCALE = 4;   // px per inch in wall strip
const STRIP_H = 88;      // must match CSS .wall-strip height
const UPPER_STRIP_H = 44; // must match CSS .wall-upper-strip height
const OX = 14, OY = 10; // floor plan SVG offset
// ASCII grid: 19 columns span W2→W1 = 130" actual; 1 row = 12" (wall heights check out)
const H_SCALE = 130 / 19; // px per ASCII column (≈ 6.84 px = 6.84")
const V_SCALE = 12;        // px per ASCII row (12" per row)

const ELEV_Y       = 3;                        // px per vertical inch
const ELEV_SVG_H   = 280;                      // SVG viewBox height
const ELEV_FLOOR_Y = 260;                      // y of floor line
const ELEV_KICK_H  = 3.5 * ELEV_Y;            // toe-kick height
const ELEV_CTR_H   = 1.5 * ELEV_Y;            // countertop thickness
const ELEV_MOUNT_Y = ELEV_FLOOR_Y - 38*ELEV_Y; // bottom y of wall-mounted items (38" AFF)
