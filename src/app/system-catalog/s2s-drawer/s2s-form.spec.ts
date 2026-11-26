import { draftFromRecord, draftToFormValue, EMPTY_S2S_DRAFT, validateS2SDraft } from './s2s-form';
import { SystemToSystemRecord } from '../../shared/interfaces';

const VALID = { sourceSystemUUId: 'A', targetSystemUUId: 'B', accessTokenTime: '30' };

describe('S2S form', () => {
  it('accepts a complete draft', () => {
    expect(validateS2SDraft(VALID)).toEqual({});
  });

  it('requires source, target and token time', () => {
    expect(Object.keys(validateS2SDraft(EMPTY_S2S_DRAFT)).sort()).toEqual([
      'accessTokenTime',
      'sourceSystemUUId',
      'targetSystemUUId',
    ]);
  });

  it('token time must be whole minutes', () => {
    expect(validateS2SDraft({ ...VALID, accessTokenTime: '1.5' }).accessTokenTime).toBe(
      'Enter whole minutes',
    );
    expect(validateS2SDraft({ ...VALID, accessTokenTime: '-3' }).accessTokenTime).toBe(
      'Enter whole minutes',
    );
    expect(validateS2SDraft({ ...VALID, accessTokenTime: ' 45 ' })).toEqual({});
  });

  it('reads a record into a draft (null token stays blank) and back into a form value', () => {
    const record = {
      sourceSystemUUId: 'A',
      targetSystemUUId: 'B',
      accessTokenTime: null,
    } as SystemToSystemRecord;
    expect(draftFromRecord(record)).toEqual({ ...VALID, accessTokenTime: '' });
    expect(draftToFormValue(VALID)).toEqual({
      sourceSystemUUId: 'A',
      targetSystemUUId: 'B',
      accessTokenTime: 30,
    });
  });
});
