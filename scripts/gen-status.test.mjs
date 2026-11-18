import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { buildStatus, run } from './gen-status.mjs';

const map = { 'UAM-A-01': 1, 'UAM-A-02': 2, 'UAM-A-03': 3 };
const open = (number, ...labels) => ({ number, state: 'OPEN', stateReason: null, labels });

test('maps status labels (string or {name}) to todo/doing/done', () => {
  const { status, warnings, mismatches } = buildStatus(
    [open(1, 'P0', 'status:in-review'), open(2, { name: 'status:qa' }), open(3, { name: 'status:ready' })],
    map,
  );
  assert.deepEqual(status, { 'UAM-A-01': 'doing', 'UAM-A-02': 'done', 'UAM-A-03': 'todo' });
  assert.deepEqual([warnings, mismatches], [[], []]);
});

test('status:blocked is todo with a warning but not a mismatch', () => {
  const r = buildStatus([open(1, 'status:blocked'), open(2, 'status:done'), open(3, 'status:backlog')], map);
  assert.equal(r.status['UAM-A-01'], 'todo');
  assert.equal(r.warnings.length, 1);
  assert.equal(r.mismatches.length, 0);
});

test('closed as completed with stale label is done and flagged as mismatch', () => {
  const issue = { number: 1, state: 'CLOSED', stateReason: 'COMPLETED', labels: ['status:backlog'] };
  const r = buildStatus([issue, open(2, 'status:done'), open(3, 'status:done')], map);
  assert.equal(r.status['UAM-A-01'], 'done');
  assert.equal(r.mismatches.length, 1);
});

test('closed as not_planned is never done and is flagged', () => {
  const issue = { number: 1, state: 'CLOSED', stateReason: 'NOT_PLANNED', labels: ['status:done'] };
  const r = buildStatus([issue, open(2, 'status:done'), open(3, 'status:done')], map);
  assert.equal(r.status['UAM-A-01'], 'todo');
  assert.equal(r.mismatches.length, 1);
});

test('multiple, missing status labels and unknown issue fall back to todo with warnings', () => {
  const r = buildStatus([open(1, 'status:done', 'status:qa'), open(2, 'P1')], map);
  assert.deepEqual(r.status, { 'UAM-A-01': 'todo', 'UAM-A-02': 'todo', 'UAM-A-03': 'todo' });
  assert.equal(r.warnings.length, 3);
  assert.equal(r.mismatches.length, 2); // multiple + none; missing issue is a warning only
});

test('run keeps _comment, follows issue-map key order and --check exits 1 on mismatch', () => {
  const dir = mkdtempSync(join(tmpdir(), 'genstatus-'));
  const mapPath = join(dir, 'issue-map.json');
  const outPath = join(dir, 'status.json');
  const inPath = join(dir, 'issues.json');
  writeFileSync(mapPath, JSON.stringify(map));
  writeFileSync(outPath, JSON.stringify({ _comment: 'keep me', 'UAM-A-03': 'done' }));
  writeFileSync(inPath, JSON.stringify([open(3, 'status:done'), open(1, 'status:in-progress'), open(2, 'status:ready')]));

  const ok = run({ input: inPath, mapPath, outPath, check: false, log: () => {} });
  assert.equal(ok.exitCode, 0);
  const written = JSON.parse(readFileSync(outPath, 'utf8'));
  assert.deepEqual(Object.keys(written), ['_comment', 'UAM-A-01', 'UAM-A-02', 'UAM-A-03']);
  assert.equal(written._comment, 'keep me');
  assert.equal(written['UAM-A-01'], 'doing');

  writeFileSync(inPath, JSON.stringify([open(1, 'status:done'), open(2, 'P1'), open(3, 'status:done')]));
  const before = readFileSync(outPath, 'utf8');
  const bad = run({ input: inPath, mapPath, outPath, check: true, log: () => {} });
  assert.equal(bad.exitCode, 1);
  assert.equal(readFileSync(outPath, 'utf8'), before); // --check does not write
});
