// Fails if any demo marker is found in a built bundle. Usage: node scripts/check-no-demo.mjs [dir]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const MARKERS = ['__UAM_DEMO_MODE__', 'Simulated DB error (demo)', 'data-testid="demo-banner"', 'demo-banner'];

export function findMarkers(dir) {
  const hits = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) hits.push(...findMarkers(path));
    else if (/\.(js|mjs|css|html|json)$/.test(name)) {
      const text = readFileSync(path, 'utf8');
      for (const m of MARKERS) if (text.includes(m)) hits.push(`${path}: ${m}`);
    }
  }
  return hits;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2] ?? 'dist/client-new-uam/browser';
  const hits = findMarkers(dir);
  if (hits.length) {
    console.error(`Demo code found in ${dir}:\n${hits.join('\n')}`);
    process.exit(1);
  }
  console.log(`OK: no demo markers in ${dir}`);
}
