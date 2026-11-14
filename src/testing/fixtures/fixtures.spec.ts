import { intentionalDeviations, padded } from './deviations';
import { fixtures, FixtureName } from './index';

const names = Object.keys(fixtures) as FixtureName[];
const requests = names.filter((n) => n.endsWith('.request'));
const responses = names.filter((n) => n.endsWith('.response') || n.startsWith('envelope-'));

/** Every [key, value] pair at any depth. */
function* entries(value: unknown): Generator<[string, unknown]> {
  if (Array.isArray(value)) {
    for (const item of value) yield* entries(item);
  } else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      yield [k, v];
      yield* entries(v);
    }
  }
}
const keysOf = (name: FixtureName) => new Set([...entries(fixtures[name])].map(([k]) => k));
const topKeys = (name: FixtureName) => new Set(Object.keys(fixtures[name]));

describe('golden fixtures: contract quirks are preserved', () => {
  it('status codes are STRINGS in every envelope', () => {
    for (const name of responses) {
      const f = fixtures[name] as { statusCode: unknown };
      expect(typeof f.statusCode, name).toBe('string');
    }
  });

  it('list-like fields are "[a,b]" strings or null, never arrays', () => {
    let seen = 0;
    for (const name of names) {
      for (const [k, v] of entries(fixtures[name])) {
        if (k === 'functional' || k === 'permission' || k === 'manager') {
          seen++;
          expect(
            v === null || (typeof v === 'string' && /^\[[^\]]*\]$/.test(v)),
            `${name}.${k}`,
          ).toBe(true);
          expect(Array.isArray(v), `${name}.${k}`).toBe(false);
        }
      }
    }
    expect(seen).toBeGreaterThan(5);
  });

  it('userSystemId is a number or null (never a string)', () => {
    const kinds = new Set<string>();
    for (const name of names) {
      for (const [k, v] of entries(fixtures[name])) {
        if (k !== 'userSystemId') continue;
        expect(v === null || typeof v === 'number', name).toBe(true);
        kinds.add(v === null ? 'null' : 'number');
      }
    }
    expect([...kinds].sort()).toEqual(['null', 'number']);
  });

  it('user requests use firstname/lastname/fullName; user responses use fullname', () => {
    for (const name of ['add-user.request', 'update-user.request'] as const) {
      const keys = topKeys(name);
      for (const k of ['firstname', 'lastname', 'fullName'])
        expect(keys.has(k), `${name}.${k}`).toBe(true);
      for (const k of ['fullname', 'firstName', 'lastName'])
        expect(keys.has(k), `${name}.${k}`).toBe(false);
    }
    for (const name of ['get-all-users.response', 'get-user-by-id.response'] as const) {
      const row =
        (fixtures[name].data as unknown[]).constructor === Array
          ? (fixtures[name].data as Record<string, unknown>[])[0]
          : (fixtures[name].data as Record<string, unknown>);
      for (const k of ['fullname', 'firstname', 'lastname'])
        expect(k in row, `${name}.${k}`).toBe(true);
      expect('fullName' in row, `${name}.fullName`).toBe(false);
    }
  });

  it('keeps the backend misspelling authenrizationType on reads only', () => {
    expect(keysOf('get-all-systems.response').has('authenrizationType')).toBe(true);
    expect(keysOf('add-system.request').has('authenrizationType')).toBe(false);
    expect(keysOf('update-system.request').has('authenrizationType')).toBe(false);
  });

  it('login request keys start with an upper-case letter', () => {
    expect([...topKeys('login.request')]).toEqual(['Username', 'Password', 'SystemId']);
  });

  it('numbers stay numbers (ids, token times, uamRoleId)', () => {
    const numeric: Record<string, string[]> = {
      'add-system.request': ['imageId', 'accessTokenTime', 'refreshTokenTime'],
      'update-system.request': ['id', 'imageId', 'accessTokenTime', 'refreshTokenTime'],
      'add-user.request': ['uamRoleId'],
      'add-system-to-system.request': ['accessTokenTime'],
    };
    for (const [name, keys] of Object.entries(numeric)) {
      const body = fixtures[name as FixtureName] as Record<string, unknown>;
      for (const k of keys) expect(typeof body[k], `${name}.${k}`).toBe('number');
    }
  });
});

describe('golden fixtures: intentional deviations from the legacy payload', () => {
  it('lists exactly the two user-approved deviations', () => {
    expect(intentionalDeviations.map((d) => d.id)).toEqual([
      'DEV-1-add-system-token-times',
      'DEV-2-trim-names',
    ]);
  });

  // DEV-1: legacy add-system did NOT send these. Unverified that the backend accepts them.
  it('DEV-1: add-system sends accessTokenTime and refreshTokenTime', () => {
    const body = fixtures['add-system.request'];
    expect(body.accessTokenTime).toEqual(expect.any(Number));
    expect(body.refreshTokenTime).toEqual(expect.any(Number));
  });

  // DEV-2: legacy did not trim. New app trims systemName / screenName / roleName only.
  it('DEV-2: name fields in request fixtures carry no surrounding whitespace', () => {
    let seen = 0;
    for (const name of requests) {
      for (const [k, v] of entries(fixtures[name])) {
        if (!['systemName', 'screenName', 'roleName'].includes(k)) continue;
        // add-user / update-user systemRoles[].systemName|roleName are echoed back from loaded data, not typed.
        seen++;
        expect(v, `${name}.${k}`).toBe((v as string).trim());
      }
    }
    expect(seen).toBeGreaterThan(5);
  });

  it('DEV-2: padded() produces input that trimming must remove', () => {
    expect(padded('A')).not.toBe('A');
    expect(padded('A').trim()).toBe('A');
  });
});
