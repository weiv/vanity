const ns = 'http://www.w3.org/2000/svg';

function el(tag, attrs, text) {
  const e = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  return e;
}

function svgText(x, y, txt, opts = {}) {
  return el('text', {
    x, y,
    'font-size': opts.size || 6,
    fill: opts.fill || '#333',
    'text-anchor': opts.anchor || 'middle',
    'font-family': 'Arial, sans-serif',
    'font-weight': opts.bold ? '700' : 'normal',
    ...(opts.angle ? { transform: `rotate(${opts.angle},${x},${y})` } : {}),
  }, txt);
}

// Convert ASCII-grid char coordinates to SVG px
// Horizontal: 19 chars = 130" actual; vertical: 1 char = 12"
function p(col, row) { return [OX + col * H_SCALE, OY + row * V_SCALE]; }
