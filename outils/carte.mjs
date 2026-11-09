import fs from 'fs'; import { feature } from 'topojson-client';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'));
const fc = feature(topo, topo.objects.countries);
const K = Math.cos(46.5 * Math.PI / 180), LON0 = -5.2, LAT0 = 51.2, S = 100 / ((9.7 - LON0) * K);
const P = ([lon, lat]) => [((lon - LON0) * K * S), ((LAT0 - lat) * S)];
const inBox = ring => ring.some(([lo, la]) => lo > -6.5 && lo < 11 && la > 40.5 && la < 52.5);
function path(f, filtre, tol) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  let d = '';
  for (const poly of polys) { if (!inBox(poly[0])) continue;
    for (const ring of poly) { let last = null, s = '';
      for (const c of ring) { const [x, y] = P(c); if (last && Math.hypot(x - last[0], y - last[1]) < tol) continue; s += (s ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); last = [x, y]; }
      if (s.split('L').length > 3) d += s + 'Z'; } }
  return d;
}
const fr = fc.features.find(f => f.properties.name === 'France');
const voisins = ['Belgium','Luxembourg','Germany','Switzerland','Italy','Spain','United Kingdom','Andorra','Netherlands','Austria'];
const out = { france: path(fr, null, 0.25), voisins: fc.features.filter(f => voisins.includes(f.properties.name)).map(f => path(f, null, 0.9)).join(''),
  h: ((LAT0 - 41.2) * S).toFixed(1), LON0, LAT0, K, S };
console.log(out.france.length, out.voisins.length, out.h, S);
fs.writeFileSync('carte.json', JSON.stringify(out));
