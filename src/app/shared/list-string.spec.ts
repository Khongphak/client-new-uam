import { parseListString, toListString } from './list-string';

describe('list string', () => {
  it('parses [a,b] and trims', () => {
    expect(parseListString('[add, view ,edit]')).toEqual(['add', 'view', 'edit']);
  });
  it.each([null, undefined, '', '[]'])('treats %j as empty', (v) => {
    expect(parseListString(v)).toEqual([]);
  });
  it('formats without spaces and round-trips', () => {
    expect(toListString(['add', 'view'])).toBe('[add,view]');
    expect(toListString([])).toBe('[]');
    expect(parseListString(toListString(['A', 'B']))).toEqual(['A', 'B']);
  });
  it('keeps case (backend comparison is case-sensitive)', () => {
    expect(parseListString('[Add,View]')).toEqual(['Add', 'View']);
  });
});
