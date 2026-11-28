import { MenuScreenRecord } from '../../shared/interfaces';
import {
  draftFromMenuRecord,
  draftToMenuFormValue,
  EMPTY_MENU_DRAFT,
  validateMenuDraft,
} from './menu-form';

const RECORD = {
  id: 1,
  systemId: 'S-1',
  screenName: 'Screen',
  url: '/screen',
  functional: '[Add,view]',
  description: null,
  imageId: 2,
} as MenuScreenRecord;

describe('menu form', () => {
  it('requires system, name, url and an icon', () => {
    expect(Object.keys(validateMenuDraft(EMPTY_MENU_DRAFT)).sort()).toEqual([
      'imageId',
      'screenName',
      'systemId',
      'url',
    ]);
  });

  it('accepts a complete draft with no function and caps the description', () => {
    const ok = { ...EMPTY_MENU_DRAFT, systemId: 'S-1', screenName: 'a', url: '/a', imageId: 2 };
    expect(validateMenuDraft(ok)).toEqual({});
    expect(validateMenuDraft({ ...ok, description: 'x'.repeat(251) }).description).toBeDefined();
    expect(validateMenuDraft({ ...ok, screenName: '   ' }).screenName).toBe('Required');
  });

  it('maps a record to a draft, matching function names to the master list ignoring case', () => {
    const draft = draftFromMenuRecord(RECORD, ['add', 'view', 'edit']);
    expect(draft).toMatchObject({ systemId: 'S-1', imageId: 2, description: '' });
    expect(draft.functional).toEqual(['add', 'view']);
  });

  it('keeps a function the master list does not know, so an edit never drops it silently', () => {
    expect(draftFromMenuRecord(RECORD, ['view']).functional).toEqual(['Add', 'view']);
  });

  it('turns a draft into the form value', () => {
    const draft = { ...EMPTY_MENU_DRAFT, systemId: 'S-1', screenName: 'n', url: '/n', imageId: 3, functional: ['add'] };
    expect(draftToMenuFormValue(draft)).toEqual({
      systemId: 'S-1',
      screenName: 'n',
      description: '',
      url: '/n',
      imageId: 3,
      functional: ['add'],
    });
  });
});
