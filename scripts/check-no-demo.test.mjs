import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { findMarkers } from './check-no-demo.mjs';

test('reports demo markers in nested bundle files and ignores clean output', () => {
  const dir = mkdtempSync(join(tmpdir(), 'nodemo-'));
  mkdirSync(join(dir, 'sub'));
  writeFileSync(join(dir, 'main.js'), 'console.log("hi")');
  assert.deepEqual(findMarkers(dir), []);
  writeFileSync(join(dir, 'sub', 'chunk.js'), 'x="__UAM_DEMO_MODE__"');
  assert.equal(findMarkers(dir).length, 1);
});
