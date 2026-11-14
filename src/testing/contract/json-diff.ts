/**
 * Strict structural comparison of two JSON values, built for API-contract checks.
 *
 * Reports (never ignores): missing / unexpected keys, key-case differences, type changes
 * (number vs string, null vs value, array vs string, array vs object), differing scalar
 * values and array lengths. Key order is ignored (JSON objects are unordered).
 *
 * `actual` is first passed through a JSON round trip, so it is compared as it would appear
 * on the wire: keys holding `undefined` disappear, `Date`s become ISO strings.
 */

type JsonKind = 'null' | 'array' | 'object' | 'string' | 'number' | 'boolean';

function kindOf(value: unknown): JsonKind {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonKind;
}

/** Scalar suffix for messages, e.g. ` ("30")`; empty for null / array / object. */
function preview(value: unknown): string {
  const kind = kindOf(value);
  return kind === 'string' || kind === 'number' || kind === 'boolean'
    ? ` (${JSON.stringify(value)})`
    : '';
}

function toWire(value: unknown): unknown {
  const text = JSON.stringify(value);
  return text === undefined ? undefined : JSON.parse(text);
}

export function diffJson(expected: unknown, actual: unknown, path = '$'): string[] {
  return compare(expected, toWire(actual), path);
}

function compare(expected: unknown, actual: unknown, path: string): string[] {
  const expectedKind = kindOf(expected);
  const actualKind = actual === undefined ? 'undefined' : kindOf(actual);

  if (expectedKind !== actualKind) {
    return [`${path}: type ${expectedKind} expected, got ${actualKind}${preview(actual)}`];
  }

  if (expectedKind === 'array') {
    const want = expected as unknown[];
    const got = actual as unknown[];
    const diffs: string[] = [];
    if (want.length !== got.length) {
      diffs.push(`${path}: expected ${want.length} items, got ${got.length}`);
    }
    for (let i = 0; i < Math.min(want.length, got.length); i++) {
      diffs.push(...compare(want[i], got[i], `${path}[${i}]`));
    }
    return diffs;
  }

  if (expectedKind === 'object') {
    const want = expected as Record<string, unknown>;
    const got = actual as Record<string, unknown>;
    const wantKeys = Object.keys(want);
    const gotKeys = Object.keys(got);
    const diffs: string[] = [];

    for (const key of wantKeys) {
      if (!(key in got)) diffs.push(`${path}.${key}: missing key`);
    }
    for (const key of gotKeys) {
      if (key in want) continue;
      const sameIgnoringCase = wantKeys.find((k) => k.toLowerCase() === key.toLowerCase());
      diffs.push(
        sameIgnoringCase
          ? `${path}.${key}: unexpected key (differs only by case from "${sameIgnoringCase}")`
          : `${path}.${key}: unexpected key`,
      );
    }
    for (const key of wantKeys) {
      if (key in got) diffs.push(...compare(want[key], got[key], `${path}.${key}`));
    }
    return diffs;
  }

  // null, string, number, boolean: same kind, so compare the value.
  return expected === actual
    ? []
    : [`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`];
}

/** Throws one Error listing every difference; does nothing when the values match. */
export function assertJsonMatches(expected: unknown, actual: unknown, label: string): void {
  const diffs = diffJson(expected, actual);
  if (diffs.length > 0) {
    throw new Error(`${label} does not match the golden fixture:\n  ${diffs.join('\n  ')}`);
  }
}
