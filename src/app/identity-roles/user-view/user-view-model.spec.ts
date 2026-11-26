import { RoleMenuItem, UserRecord, UserRoleDetail } from '../../shared/interfaces';
import { toUserView } from './user-view-model';

const menu = (over: Partial<RoleMenuItem>): RoleMenuItem =>
  ({
    roleId: 1,
    roleMenuId: 1,
    menuId: 10,
    parentId: 0,
    groupName: null,
    screenName: 'Claim Register',
    sortOrder: 1,
    permission: '[View,Add]',
    functional: '[View,Add,Edit]',
    imageGroupId: 0,
    groupMenus: [],
    ...over,
  }) as RoleMenuItem;

const record = (over: Partial<UserRecord> = {}): UserRecord =>
  ({
    id: 5,
    username: 'nattaya.p',
    fullname: 'Nattaya Prasert',
    email: 'n@example.test',
    phoneNo: '2241',
    position: 'Claim Officer',
    department: 'Claims',
    isSuperAdmin: false,
    status: 'Active',
    uamRoleName: 'USER',
    manager: '[Somchai Khemthong,Wichai Boonmee]',
    updatedDate: '2026-10-28T09:00:00',
    updatedBy: 'somchai.k',
    systemRoles: [],
    ...over,
  }) as UserRecord;

const detail: UserRoleDetail = {
  userId: 5,
  userSystems: [
    {
      id: 1,
      systemId: 's1',
      systemName: 'Claim System',
      roleId: 1,
      roleName: 'Claim Officer',
      menuRoleScreens: [
        menu({
          menuId: 0,
          groupName: 'Claims',
          screenName: null,
          groupMenus: [menu({}), menu({ roleMenuId: 2, menuId: 11, screenName: 'Claim Search', permission: '[View]' })],
        }),
        menu({ roleMenuId: 3, menuId: 12, screenName: 'Dashboard', permission: '[]' }),
      ],
    },
    { id: 2, systemId: 's2', systemName: 'Document Center', roleId: 2, roleName: 'Viewer', menuRoleScreens: [] },
  ],
};

describe('toUserView', () => {
  it('maps profile facts, name initials and status', () => {
    const v = toUserView(record(), detail);
    expect(v.name).toBe('Nattaya Prasert');
    expect(v.initials).toBe('NP');
    expect(v.active).toBe(true);
    expect(v.role).toBe('USER');
    const byLabel = Object.fromEntries(v.facts.map((f) => [f.label, f.value]));
    expect(byLabel['Username']).toBe('nattaya.p');
    expect(byLabel['Extension number']).toBe('2241');
    expect(byLabel['System Admin']).toBe('No');
    expect(byLabel['Updated']).toBe('28 Oct 2026 by somchai.k');
  });

  it('shows System Admin = Yes and an inactive user', () => {
    const v = toUserView(record({ isSuperAdmin: true, status: 'Inactive' }), detail);
    expect(v.active).toBe(false);
    expect(v.facts.find((f) => f.label === 'System Admin')!.value).toBe('Yes');
  });

  it('parses approvers from the manager list string, names only', () => {
    expect(toUserView(record(), detail).approvers).toEqual(['Somchai Khemthong', 'Wichai Boonmee']);
    expect(toUserView(record({ manager: '[]' }), detail).approvers).toEqual([]);
  });

  it('flattens each system into menus with group prefix and granted functions; first system opens', () => {
    const [first, second] = toUserView(record(), detail).systems;
    expect(first.open).toBe(true);
    expect(first.menus).toEqual([
      { group: 'Claims', name: 'Claim Register', functions: ['View', 'Add'] },
      { group: 'Claims', name: 'Claim Search', functions: ['View'] },
      { group: null, name: 'Dashboard', functions: [] },
    ]);
    expect(first.subtitle).toBe('Role: Claim Officer · 3 menus');
    expect(second.open).toBe(false);
    expect(second.subtitle).toBe('Role: Viewer · 0 menus');
  });
});
