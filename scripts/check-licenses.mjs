// Guard against leaving the MIT-licensed PrimeNG line (ADR-0001 (ฉ)).
// PrimeNG 22+, @primeuix/themes 3+, PrimeIcons 8+ and any `-lts` build need a paid licence.
// Usage: node scripts/check-licenses.mjs [path/to/package-lock.json]
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MAX_MAJOR = {
  primeng: 21,
  '@primeuix/themes': 2,
  primeicons: 7,
};

/** @returns {string[]} one message per offending entry in an npm v2/v3 lockfile */
export function findViolations(lock) {
  const violations = [];
  for (const [path, meta] of Object.entries(lock.packages ?? {})) {
    const name = path.split('node_modules/').at(-1);
    if (!(name in MAX_MAJOR) || !meta?.version) continue;

    const { version } = meta;
    const major = Number.parseInt(version, 10);
    if (version.includes('-lts')) {
      violations.push(`${name}@${version} (${path}): -lts builds are not MIT`);
    } else if (!(major <= MAX_MAJOR[name])) {
      violations.push(`${name}@${version} (${path}): major must be <= ${MAX_MAJOR[name]}`);
    }
  }
  return violations;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2] ?? 'package-lock.json';
  const violations = findViolations(JSON.parse(readFileSync(file, 'utf8')));
  if (violations.length > 0) {
    console.error('check:licenses failed — see ADR-0001:');
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log(`check:licenses ok (${Object.keys(MAX_MAJOR).join(', ')})`);
}
