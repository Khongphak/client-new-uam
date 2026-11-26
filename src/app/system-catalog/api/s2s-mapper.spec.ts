import { fixtures } from '../../../testing/fixtures';
import { toAddS2SRequest, toUpdateS2SRequest } from './s2s-mapper';

const FORM = {
  sourceSystemUUId: '00000000-0000-4000-8000-000000000001',
  targetSystemUUId: '00000000-0000-4000-8000-000000000002',
  accessTokenTime: 30,
};

describe('S2S request mappers', () => {
  it('add: sends the pair, token time and Active (matches the add fixture)', () => {
    expect(toAddS2SRequest(FORM)).toEqual(fixtures['add-system-to-system.request']);
  });

  it('update: adds the record id and the Active switch as status (matches the update fixture)', () => {
    expect(toUpdateS2SRequest(5, FORM, false)).toEqual(fixtures['update-system-to-system.request']);
    expect(toUpdateS2SRequest(5, FORM, true).status).toBe('Active');
  });
});
