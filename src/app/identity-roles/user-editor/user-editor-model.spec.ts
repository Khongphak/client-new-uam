import { RoleRecord, UserRecord } from '../../shared/interfaces';
import {
  countChanges,
  EditorState,
  fromUserRecord,
  errorSummary,
  isProfileComplete,
  rowErrors,
  validationItems,
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

  it('flags a missing system, a missing role and a repeated system per row (TC-USR-010, TC-USR-011)', () => {
    const rows = [
      ...base.rows,
      { key: 50, userSystemId: null, systemId: null, roleId: null },
      { key: 51, userSystemId: null, systemId: 's1', roleId: 6 },
      { key: 52, userSystemId: null, systemId: 's9', roleId: null },
    ];
    const errors = rowErrors(rows);
    expect(errors.has(base.rows[0].key)).toBe(false);
    expect(errors.get(50)).toEqual({ noSystem: true, noRole: true, duplicate: false });
    // the second use of a system is the one flagged
    expect(errors.get(51)).toEqual({ noSystem: false, noRole: false, duplicate: true });
    expect(errors.get(52)).toEqual({ noSystem: false, noRole: true, duplicate: false });
  });

  it('has no errors for complete rows with different systems', () => {
    expect(rowErrors(base.rows).size).toBe(0);
    expect(errorSummary(base.rows, rowErrors(base.rows))).toBeNull();
  });

  it('summarises row errors with row numbers; "required" title wins over "invalid"', () => {
    const dup = [
      { key: 1, userSystemId: null, systemId: 's1', roleId: 5 },
      { key: 2, userSystemId: null, systemId: 's1', roleId: 6 },
    ];
    expect(errorSummary(dup, rowErrors(dup))).toEqual({
      title: 'Invalid input',
      items: ['Row 2: Duplicate system detected. Please check and select a different system.'],
    });
    const mixed = [...dup, { key: 3, userSystemId: null, systemId: null, roleId: null }];
    expect(errorSummary(mixed, rowErrors(mixed))).toEqual({
      title: 'Some required information is missing, please correct and try again.',
      items: [
        'Row 2: Duplicate system detected. Please check and select a different system.',
        'Row 3: select a system',
        'Row 3: select a role',
      ],
    });
  });

  it('knows when the AD profile is missing something required (phone is optional)', () => {
    expect(isProfileComplete({ ...base.profile, phoneNo: null })).toBe(true);
    expect(isProfileComplete({ ...base.profile, email: '' })).toBe(false);
    expect(isProfileComplete({ ...base.profile, firstname: '  ' })).toBe(false);
    expect(isProfileComplete({ ...base.profile, username: '' })).toBe(false);
  });

  it('lists every 422 ModelState message', () => {
    expect(validationItems({ 'user.email': 'Email is invalid', username: 'Username is taken' })).toEqual([
      'Email is invalid',
      'Username is taken',
    ]);
    expect(validationItems({})).toEqual([]);
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
