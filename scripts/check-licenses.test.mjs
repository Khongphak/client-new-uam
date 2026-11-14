import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findViolations } from './check-licenses.mjs';

const lock = (versions) => ({
  lockfileVersion: 3,
  packages: Object.fromEntries(
    Object.entries(versions).map(([path, version]) => [path, { version }]),
  ),
});

const allowed = {
  'node_modules/primeng': '21.1.10',
  'node_modules/@primeuix/themes': '2.0.3',
  'node_modules/primeicons': '7.0.0',
};

test('passes for the versions locked in ADR-0001', () => {
  assert.deepEqual(findViolations(lock(allowed)), []);
});

test('fails when primeng goes above major 21', () => {
  const v = findViolations(lock({ ...allowed, 'node_modules/primeng': '22.1.4' }));
  assert.equal(v.length, 1);
  assert.match(v[0], /primeng@22\.1\.4/);
});

test('fails when @primeuix/themes goes above major 2', () => {
  const v = findViolations(lock({ ...allowed, 'node_modules/@primeuix/themes': '3.0.0' }));
  assert.equal(v.length, 1);
  assert.match(v[0], /@primeuix\/themes@3\.0\.0/);
});

test('fails when primeicons goes above major 7', () => {
  const v = findViolations(lock({ ...allowed, 'node_modules/primeicons': '8.0.0' }));
  assert.equal(v.length, 1);
  assert.match(v[0], /primeicons@8\.0\.0/);
});

test('fails on a paid -lts build even when the major is allowed', () => {
  const v = findViolations(lock({ ...allowed, 'node_modules/primeng': '20.5.1-lts' }));
  assert.equal(v.length, 1);
  assert.match(v[0], /-lts/);
});

test('checks nested copies, not only the top-level one', () => {
  const v = findViolations(
    lock({ ...allowed, 'node_modules/some-lib/node_modules/primeng': '22.0.0' }),
  );
  assert.equal(v.length, 1);
});

test('ignores unrelated packages with similar names', () => {
  assert.deepEqual(
    findViolations(lock({ ...allowed, 'node_modules/primeng-extra': '99.0.0' })),
    [],
  );
});

const script = fileURLToPath(new URL('./check-licenses.mjs', import.meta.url));
const run = (data) => {
  const file = join(mkdtempSync(join(tmpdir(), 'lic-')), 'package-lock.json');
  writeFileSync(file, JSON.stringify(data));
  try {
    execFileSync(process.execPath, [script, file], { stdio: 'pipe' });
    return 0;
  } catch (e) {
    return e.status;
  }
};

test('CLI exits 0 for an allowed lockfile', () => {
  assert.equal(run(lock(allowed)), 0);
});

test('CLI exits 1 when primeng 22 is simulated', () => {
  assert.equal(run(lock({ ...allowed, 'node_modules/primeng': '22.1.4' })), 1);
});
