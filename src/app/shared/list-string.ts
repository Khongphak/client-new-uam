/**
 * The backend stores lists as one string: `[a,b,c]` (no spaces), `[]` for empty, sometimes null.
 * Used by `functional`, `permission` and `manager`. Names containing a comma cannot round-trip (known backend limit).
 */
export function parseListString(value: string | null | undefined): string[] {
  if (!value) return [];
  const inner = value.trim().replace(/^\[/, '').replace(/\]$/, '');
  return inner
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function toListString(items: readonly string[]): string {
  return `[${items.join(',')}]`;
}
