import { RoleRecord, UserRecord } from '../../shared/interfaces';
import {
  countChanges,
  EditorState,
  fromUserRecord,
  invalidRows,
  previewRows,
  toFormValue,
} from './user-editor-model';

const record = (over: Partial<UserRecord> = {}): UserRecord =>
  ({
    id: 7,
    username: 'nattaya.p',
    fullname: 'Nattaya Prasert',
    firstname: 'Nattaya',
    lastname: 'Prasert',
    email: 'n@example.test',
    department: 'Claims',
    position: 'Officer',
    phoneNo: '2241',
    isSuperAdmin: false,
    status: 'Active',
    uamRoleId: 1,
    uamRoleName: 'USER',
    manager: '[Somchai K,Wichai B]',
    systemRoles: [
      { userSystemId: 11, systemId: 's1', systemName: 'Claim System', roleId: 5, roleName: 'Officer' },
      { userSystemId: 12, systemId: 's2', systemName: 'Docs', roleId: 8, roleName: 'Viewer' },
    ],
    ...over,
  }) as UserRecord;

const roles = [
  { id: 5, systemId: 's1', systemName: 'Claim System', roleName: 'Officer' },
  { id: 6, systemId: 's1', systemName: 'Claim System', roleName: 'Approver' },
  { id: 8, systemId: 's2', systemName: 'Docs', roleName: 'Viewer' },
] as RoleRecord[];

describe('user editor model', () => {
  let base: EditorState;
  beforeEach(() => (base = fromUserRecord(record())));

  it('reads the record: managers from the list string, Active from status', () => {
    expect(base.profile.managers).toEqual(['Somchai K', 'Wichai B']);
    expect(base.active).toBe(true);
    expect(base.rows.map((r) => r.userSystemId)).toEqual([11, 12]);
  });

  it('counts nothing when untouched, and returns to 0 when a change is reverted', () => {
    expect(countChanges(base, base)).toBe(0);
    const off = { ...base, active: false };
    expect(countChanges(base, off)).toBe(1);
    expect(countChanges(base, { ...off, active: true })).toBe(0);
  });

  it('counts switches, role card, profile and each changed/added/removed row once', () => {
    const cur: EditorState = {
      ...base,
      uamRoleId: 2,
      isSuperAdmin: true,
      profile: { ...base.profile, email: 'new@example.test' },
      rows: [
        { ...base.rows[0], roleId: 6 },
        { key: 99, userSystemId: null, systemId: 's2', roleId: 8 },
      ],
    };
    // uam role + admin + profile + row0 changed + row1 removed + new row
    expect(countChanges(base, cur)).toBe(6);
  });

  it('flags incomplete rows and duplicate systems', () => {
    const rows = [
      ...base.rows,
      { key: 50, userSystemId: null, systemId: null, roleId: null },
      { key: 51, userSystemId: null, systemId: 's1', roleId: 6 },
    ];
    expect(invalidRows(rows)).toEqual(new Set([50, 51]));
  });

  it('builds the update body fields from the state (ids kept, names from the role list)', () => {
    const form = toFormValue({ ...base, rows: [{ ...base.rows[0], roleId: 6 }] }, roles);
    expect(form.value.systemRoles).toEqual([
      { userSystemId: 11, systemId: 's1', systemName: 'Claim System', roleId: 6, roleName: 'Approver' },
    ]);
    expect(form.value.managers).toEqual(['Somchai K', 'Wichai B']);
    expect(form.value.fullName).toBe('Nattaya Prasert');
    expect(form.unresolved).toEqual([]);
  });

  it('flattens a role menu tree to preview rows with the granted functions', () => {
    const rows = previewRows(
      [{ key: 1, userSystemId: 11, systemId: 's1', roleId: 5 }],
      roles,
      {
        5: [
          {
            kind: 'group',
            imageGroupId: 1,
            groupName: 'Claims',
            children: [
              { kind: 'menu', imageGroupId: 1, menuId: 3, screenName: 'Register', permission: ['view', 'add'], functional: ['view', 'add', 'edit'] },
            ],
          },
        ],
      },
    );
    expect(rows).toEqual([
      { system: 'Claim System', role: 'Officer', group: 'Claims', menu: 'Register', perms: ['view', 'add'] },
    ]);
  });
});
