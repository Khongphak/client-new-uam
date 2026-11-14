// Guards for the golden fixtures in src/testing/fixtures (UAM-QA-01). Node only: the Vitest
// side runs in a browser-like env without file-system access.
import { readdirSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const dir = new URL('../src/testing/fixtures/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const text = files.map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n');
const index = readFileSync(new URL('index.ts', dir), 'utf8');

test('every fixture file is registered in index.ts and parses as JSON', () => {
  assert.ok(files.length > 0);
  for (const f of files) {
    JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    assert.ok(index.includes(`'${f.replace(/\.json$/, '')}':`), `${f} missing from index.ts`);
  }
  const registered = [...index.matchAll(/^\s+'([^']+)':/gm)].map((m) => m[1]);
  assert.equal(registered.length, files.length, 'index.ts registers a name without a file');
});

test('fixtures are synthetic: only @example.test e-mails', () => {
  const emails = text.match(/[\w.+-]+@[\w.-]+/g) ?? [];
  assert.ok(emails.length > 0);
  for (const e of emails) assert.match(e, /@example\.test$/);
});

test('fixtures are synthetic: only placeholder GUIDs', () => {
  const guids = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) ?? [];
  assert.ok(guids.length > 0);
  for (const g of guids) assert.match(g, /^00000000-0000-4000-8000-0000000000[0-9a-f]{2}$/);
});

test('fixtures are synthetic: only *.example.test hosts', () => {
  for (const m of text.matchAll(/https?:\/\/([^/"\s]+)/g)) assert.match(m[1], /\.example\.test$/);
});
