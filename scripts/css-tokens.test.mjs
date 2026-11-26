import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

// A component using a CSS variable nobody defines silently loses that style (e.g. borders), and unit tests can't see it.
const root = new URL('..', import.meta.url).pathname;
const defined = new Set(
  [...readFileSync(join(root, 'src/styles/_tokens.scss'), 'utf8').matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
);

test('shared/detail components only use custom properties defined in _tokens.scss', () => {
  const dir = join(root, 'src/app/shared/detail');
  const used = new Set();
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))) {
    for (const m of readFileSync(join(dir, file), 'utf8').matchAll(/var\((--[\w-]+)/g)) used.add(m[1]);
  }
  assert.ok(used.size > 0);
  assert.deepEqual([...used].filter((v) => !defined.has(v)), []);
});
