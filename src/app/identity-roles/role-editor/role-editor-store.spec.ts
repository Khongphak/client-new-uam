import { menuKey, place, ROOT } from './menu-structure';
import { RoleEditorStore, ROLE_DESCRIPTION_MAX, validateRoleInfo } from './role-editor-store';

describe('validateRoleInfo (UAM-ROL-01)', () => {
  const ok = { systemId: 's1', roleName: 'Claim Officer', description: '', active: true };

  it('accepts a system and a name; description is optional', () => {
    expect(validateRoleInfo(ok)).toEqual({});
  });

  it('requires a system', () => {
    expect(validateRoleInfo({ ...ok, systemId: '' }).systemId).toBeTruthy();
  });

  it('requires a name, and a name of only spaces does not count', () => {
    expect(validateRoleInfo({ ...ok, roleName: '' }).roleName).toBeTruthy();
    expect(validateRoleInfo({ ...ok, roleName: '   ' }).roleName).toBeTruthy();
  });

  it('caps the description at the length the form allows', () => {
    const long = 'x'.repeat(ROLE_DESCRIPTION_MAX + 1);
    expect(validateRoleInfo({ ...ok, description: long }).description).toBeTruthy();
    expect(validateRoleInfo({ ...ok, description: 'x'.repeat(ROLE_DESCRIPTION_MAX) })).toEqual({});
  });
});

describe('RoleEditorStore', () => {
  const fill = (s: RoleEditorStore) =>
    s.patchInfo({ systemId: 's1', roleName: 'Claim Officer', description: 'd' });

  it('starts on Role info, active by default, with no error shown yet', () => {
    const s = new RoleEditorStore();
    expect(s.step()).toBe(0);
    expect(s.info().active).toBe(true);
    expect(s.shownErrors()).toEqual({});
  });

  it('refuses Next while required fields are empty and then shows the errors', () => {
    const s = new RoleEditorStore();
    expect(s.next()).toBe(false);
    expect(s.step()).toBe(0);
    expect(Object.keys(s.shownErrors()).sort()).toEqual(['roleName', 'systemId']);
  });

  it('moves to step 2 when valid, and Back keeps what was typed', () => {
    const s = new RoleEditorStore();
    fill(s);
    expect(s.next()).toBe(true);
    expect(s.step()).toBe(1);
    s.back();
    expect(s.step()).toBe(0);
    expect(s.info()).toMatchObject({ systemId: 's1', roleName: 'Claim Officer', description: 'd' });
  });

  it('does not go past the last step or before the first', () => {
    const s = new RoleEditorStore();
    fill(s);
    s.next();
    s.next();
    expect(s.next()).toBe(false);
    expect(s.step()).toBe(2);
    s.goTo(0);
    s.back();
    expect(s.step()).toBe(0);
  });

  it('goTo may go back freely but not forward past an invalid Role info', () => {
    const s = new RoleEditorStore();
    s.goTo(2);
    expect(s.step()).toBe(0);
    expect(s.shownErrors().roleName).toBeTruthy();
    fill(s);
    s.goTo(2);
    expect(s.step()).toBe(2);
    s.goTo(0);
    expect(s.step()).toBe(0);
  });

  it('drops an error as soon as the field is fixed', () => {
    const s = new RoleEditorStore();
    s.next();
    s.patchInfo({ roleName: 'A' });
    expect(s.shownErrors().roleName).toBeUndefined();
    expect(s.shownErrors().systemId).toBeTruthy();
  });
});

describe('RoleEditorStore menu structure (UAM-ROL-02)', () => {
  it('keeps the structure when other info changes, drops it when the system changes', () => {
    const s = new RoleEditorStore();
    s.patchInfo({ systemId: 's1' });
    s.editStructure((st) => place(st, menuKey(1), ROOT, 0));
    s.patchInfo({ roleName: 'A' });
    expect(s.structure().items[ROOT]).toEqual([menuKey(1)]);
    s.patchInfo({ systemId: 's1' });
    expect(s.structure().items[ROOT]).toEqual([menuKey(1)]);
    s.patchInfo({ systemId: 's2' });
    expect(s.structure().items[ROOT]).toEqual([]);
  });
});
