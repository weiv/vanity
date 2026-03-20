function exportSpecSheet() {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  function placementsTable(placements, isUpper) {
    if (!placements.length) return '<p class="empty">None</p>';
    const rows = placements.map((pl, i) => {
      const v = pl.vanity;
      const note = v.type === 'sink' ? `Sink ${pl.sinkPos || 'C'}` : (isUpper ? 'wall-mounted' : '—');
      return `<tr>
        <td class="num">${i + 1}</td>
        <td class="code">${v.id}</td>
        <td>${v.name}</td>
        <td class="num">${v.w}"</td>
        <td class="num">${v.d}"</td>
        <td class="num">${v.h}"</td>
        <td>${note}</td>
      </tr>`;
    }).join('');
    return `<table>
      <thead><tr><th>#</th><th>Code</th><th>Description</th><th>W</th><th>D</th><th>H</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  // Per-wall sections
  const wallOrder = ['W2', 'W1'];
  let wallHtml = '';
  const allPlacements = [];

  for (const id of wallOrder) {
    const wall = WALLS[id];
    const floorUsed = wall.placements.reduce((s, pl) => s + pl.vanity.w, 0);
    const upperUsed = wall.upper.reduce((s, pl) => s + pl.vanity.w, 0);
    const over = floorUsed > wall.limit;
    wall.placements.forEach(pl => allPlacements.push(pl));
    wall.upper.forEach(pl => allPlacements.push(pl));

    wallHtml += `<section class="wall-section">
      <h2><span class="wall-dot" style="background:${wall.color}"></span>${wall.label}</h2>
      <p class="wall-stats">
        Floor cabinets: <strong>${floorUsed}"</strong> of ${wall.limit}" available
        ${over ? '<span class="over">⚠ OVER LIMIT</span>' : ''}
        ${upperUsed > 0 ? ` &nbsp;·&nbsp; Upper: <strong>${upperUsed}"</strong>` : ''}
      </p>
      <h3>Floor cabinets</h3>
      ${placementsTable(wall.placements, false)}
      ${wall.upper.length > 0 ? `<h3>Upper / wall-mounted</h3>${placementsTable(wall.upper, true)}` : ''}
    </section>`;
  }

  // Material summary — group by vanity ID, count quantities
  const byId = {};
  allPlacements.forEach(pl => {
    const v = pl.vanity;
    if (!byId[v.id]) byId[v.id] = { v, qty: 0 };
    byId[v.id].qty++;
  });
  const summaryRows = Object.values(byId)
    .sort((a, b) => a.v.id.localeCompare(b.v.id))
    .map(({ v, qty }) => `<tr>
      <td class="code">${v.id}</td>
      <td>${v.name}</td>
      <td class="num">${qty}</td>
      <td class="num">${v.w}"</td>
      <td class="num">${v.d}"</td>
      <td class="num">${v.h}"</td>
    </tr>`).join('');

  // Capture the live floor plan SVG
  const fpSvg = document.getElementById('floorPlanSvg').outerHTML
    .replace(/(<svg[^>]*)/, '$1 width="220" height="242"');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Vanity Spec Sheet</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 12px; color: #1a1a1a;
  padding: 48px 56px; max-width: 860px; margin: 0 auto;
}
header { margin-bottom: 28px; border-bottom: 3px solid #1a1a1a; padding-bottom: 14px; }
header h1 { font-size: 24px; font-weight: 700; letter-spacing: -.3px; }
header .sub { font-size: 12px; color: #666; margin-top: 4px; }
h2 {
  font-size: 13px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .6px; border-bottom: 1.5px solid #333;
  padding-bottom: 5px; margin: 28px 0 10px;
  display: flex; align-items: center; gap: 8px;
}
.wall-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
h3 { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .4px; color: #666; margin: 14px 0 5px; }
.wall-stats { font-size: 12px; margin-bottom: 6px; }
.over { color: #c0392b; font-weight: 700; margin-left: 6px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 11.5px; }
th {
  background: #f2f2f2; font-size: 10px; text-transform: uppercase;
  letter-spacing: .3px; font-weight: 600;
  padding: 6px 8px; text-align: left; border: 1px solid #ccc;
}
th.num, td.num { text-align: right; }
td { padding: 5px 8px; border: 1px solid #ddd; }
td.code { font-family: 'Courier New', monospace; font-size: 11px; }
tr:nth-child(even) td { background: #fafafa; }
.empty { font-size: 11px; color: #aaa; font-style: italic; margin-bottom: 10px; }
.floor-plan-section { page-break-after: always; }
.fp-wrap { margin-top: 8px; display: inline-block; border: 1px solid #ddd; border-radius: 4px; background: #fafafa; padding: 8px; }
.fp-wrap svg { display: block; }
.wall-section { page-break-inside: avoid; }
.notes-lines { margin-top: 10px; }
.note-line { border-bottom: 1px solid #bbb; height: 30px; }
@media print {
  body { padding: 24px 32px; }
  @page { margin: 1.5cm; }
}
</style>
</head>
<body>
<header>
  <h1>Bathroom Vanity Spec Sheet</h1>
  <div class="sub">Generated: ${date}</div>
</header>

<section class="floor-plan-section">
  <h2>Floor Plan</h2>
  <div class="fp-wrap">${fpSvg}</div>
</section>

${wallHtml}

<section class="wall-section">
  <h2>Material Summary</h2>
  ${summaryRows ? `<table>
    <thead><tr><th>Code</th><th>Description</th><th class="num">Qty</th><th class="num">W</th><th class="num">D</th><th class="num">H</th></tr></thead>
    <tbody>${summaryRows}</tbody>
  </table>` : '<p class="empty">No items placed.</p>'}
</section>

<section class="wall-section">
  <h2>Notes</h2>
  <div class="notes-lines">
    ${'<div class="note-line"></div>'.repeat(10)}
  </div>
</section>

<script>window.onload = () => window.print();<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}
