import { SystemRecord } from '../../shared/interfaces';
import {
  draftFromRecord,
  EMPTY_DRAFT,
  draftToFormValue,
  validateSystemDraft,
} from './system-form';

const VALID = {
  ...EMPTY_DRAFT,
  systemName: ' IT TICKET ',
  type: 'Web Application',
  ownerName: 'Test Owner',
  url: 'https://system-a.example.test/',
  accessTokenTime: '30',
  refreshTokenTime: '60',
  imageId: 1,
};

describe('system form', () => {
  it('accepts a complete draft', () => {
    expect(validateSystemDraft(VALID)).toEqual({});
  });

  it('requires name, type, owner, url, both token times and an icon', () => {
    expect(Object.keys(validateSystemDraft(EMPTY_DRAFT)).sort()).toEqual([
      'accessTokenTime',
      'imageId',
      'ownerName',
      'refreshTokenTime',
      'systemName',
      'type',
      'url',
    ]);
  });

  it('treats a blank name as missing', () => {
    expect(validateSystemDraft({ ...VALID, systemName: '   ' }).systemName).toBeDefined();
  });

  it('keeps token times to whole minutes from 0 to 9999', () => {
    for (const bad of ['10000', '-1', '1.5', 'abc']) {
      expect(validateSystemDraft({ ...VALID, accessTokenTime: bad }).accessTokenTime).toBeDefined();
    }
    for (const ok of ['0', '9999']) {
      expect(validateSystemDraft({ ...VALID, refreshTokenTime: ok }).refreshTokenTime).toBeUndefined();
    }
  });

  it('limits the description to 250 characters', () => {
    expect(validateSystemDraft({ ...VALID, description: 'x'.repeat(251) }).description).toBeDefined();
    expect(validateSystemDraft({ ...VALID, description: 'x'.repeat(250) }).description).toBeUndefined();
  });

  it('turns a draft into the form value the mapper sends (numbers, untouched description/url)', () => {
    expect(draftToFormValue({ ...VALID, description: ' d ' })).toEqual({
      type: 'Web Application',
      systemName: ' IT TICKET ',
      description: ' d ',
      url: 'https://system-a.example.test/',
      ownerName: 'Test Owner',
      imageId: 1,
      accessTokenTime: 30,
      refreshTokenTime: 60,
    });
  });

  it('loads a record into a draft, using empty text for null fields', () => {
    const record = {
      systemName: 'A',
      type: 'Web',
      description: null,
      url: 'u',
      ownerName: 'o',
      imageId: 7,
      accessTokenTime: null,
      refreshTokenTime: 15,
      status: 'INACTIVE',
    } as SystemRecord;
    expect(draftFromRecord(record)).toEqual({
      systemName: 'A',
      type: 'Web',
      description: '',
      url: 'u',
      ownerName: 'o',
      imageId: 7,
      accessTokenTime: '',
      refreshTokenTime: '15',
    });
  });
});
