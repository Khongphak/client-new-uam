import { diffJson } from './json-diff';

/** Mutation checks: every kind of drift from the golden JSON must be reported. */
describe('diffJson', () => {
  const golden = {
    systemId: '00000000-0000-4000-8000-000000000001',
    accessTokenTime: 30,
    userSystemId: null as number | null,
    functional: '[add,view]',
    nested: { firstname: 'Test' },
    list: [{ id: 1 }, { id: 2 }],
    flag: false,
  };

  it('reports nothing for an identical value', () => {
    expect(diffJson(golden, structuredClone(golden))).toEqual([]);
  });

  it('ignores key order', () => {
    const reordered = {
      flag: false,
      list: golden.list,
      nested: golden.nested,
      functional: golden.functional,
      userSystemId: null,
      accessTokenTime: 30,
      systemId: golden.systemId,
    };
    expect(diffJson(golden, reordered)).toEqual([]);
  });

  it('FAILS when a key is renamed (reports missing + unexpected)', () => {
    const { accessTokenTime, ...rest } = structuredClone(golden);
    const diffs = diffJson(golden, { ...rest, accessToken: accessTokenTime });
    expect(diffs).toContainEqual(expect.stringContaining('$.accessTokenTime: missing key'));
    expect(diffs).toContainEqual(expect.stringContaining('$.accessToken: unexpected key'));
  });

  it('FAILS when a key changes case, and hints at the case-only difference', () => {
    const { nested, ...rest } = structuredClone(golden);
    const diffs = diffJson(golden, { ...rest, nested: { firstName: 'Test' } });
    expect(diffs).toContainEqual(expect.stringContaining('$.nested.firstname: missing key'));
    expect(diffs).toContainEqual(expect.stringContaining('$.nested.firstName: unexpected key'));
    expect(diffs.join('\n')).toContain('differs only by case');
    void nested;
  });

  it('FAILS when a number becomes a string', () => {
    const diffs = diffJson(golden, { ...structuredClone(golden), accessTokenTime: '30' });
    expect(diffs).toEqual(['$.accessTokenTime: type number expected, got string ("30")']);
  });

  it('FAILS when a string status code becomes a number', () => {
    expect(diffJson({ statusCode: '20000' }, { statusCode: 20000 })).toEqual([
      '$.statusCode: type string expected, got number (20000)',
    ]);
  });

  it('FAILS when an extra key appears', () => {
    const diffs = diffJson(golden, { ...structuredClone(golden), extra: 1 });
    expect(diffs).toEqual(['$.extra: unexpected key']);
  });

  it('FAILS when a key is missing', () => {
    const { flag, ...rest } = structuredClone(golden);
    void flag;
    expect(diffJson(golden, rest)).toEqual(['$.flag: missing key']);
  });

  it('FAILS when a key holds undefined (it would be dropped on the wire)', () => {
    expect(diffJson(golden, { ...structuredClone(golden), flag: undefined })).toEqual([
      '$.flag: missing key',
    ]);
  });

  it('FAILS when null becomes a number, or a number becomes null', () => {
    expect(diffJson(golden, { ...structuredClone(golden), userSystemId: 12 })).toEqual([
      '$.userSystemId: type null expected, got number (12)',
    ]);
    expect(diffJson({ id: 12 }, { id: null })).toEqual(['$.id: type number expected, got null']);
  });

  it('FAILS when a list-like string becomes a real array (or vice versa)', () => {
    expect(diffJson(golden, { ...structuredClone(golden), functional: ['add', 'view'] })).toEqual([
      '$.functional: type string expected, got array',
    ]);
    expect(diffJson({ a: [1] }, { a: '[1]' })).toEqual([
      '$.a: type array expected, got string ("[1]")',
    ]);
  });

  it('FAILS when a list-like string has different content', () => {
    expect(diffJson(golden, { ...structuredClone(golden), functional: '[add, view]' })).toEqual([
      '$.functional: expected "[add,view]", got "[add, view]"',
    ]);
  });

  it('FAILS when a string value differs (e.g. untrimmed name)', () => {
    expect(diffJson({ systemName: 'A' }, { systemName: ' A ' })).toEqual([
      '$.systemName: expected "A", got " A "',
    ]);
  });

  it('FAILS on array length and on drift inside array items', () => {
    expect(diffJson(golden, { ...structuredClone(golden), list: [{ id: 1 }] })).toEqual([
      '$.list: expected 2 items, got 1',
    ]);
    expect(diffJson(golden, { ...structuredClone(golden), list: [{ id: 1 }, { ID: 2 }] })).toEqual(
      expect.arrayContaining([expect.stringContaining('$.list[1].id: missing key')]),
    );
  });

  it('FAILS when an object becomes an array or vice versa', () => {
    expect(diffJson({ a: {} }, { a: [] })).toEqual(['$.a: type object expected, got array']);
  });
});
