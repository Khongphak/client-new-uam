import { RoleRecord, UamRoleItem, UserListItem } from '../../shared/interfaces';
import {
  formatUpdated,
  initials,
  roleFilters,
  toRoleRow,
  toUserRow,
  userFilters,
} from './list-rows';

const uamRoles: UamRoleItem[] = [
  { id: 1, name: 'ADMIN', status: 'Active', description: null, createdDate: '', createdBy: null, updatedDate: '', updatedBy: null },
];

const user = (over: Partial<UserListItem> = {}): UserListItem => ({
  id: 7,
  username: 'somchai.k',
  fullname: 'Somchai Khemthong',
  firstname: 'Somchai',
  lastname: 'Khemthong',
  email: 'somchai.k@example.test',
  department: 'Claims',
  position: null,
  phoneNo: '2201',
  isSuperAdmin: false,
  status: 'Active',
  uamRoleId: 1,
  roleName: null,
  uamRole: '',
  createdDate: '2026-10-01T00:00:00',
  createdBy: 'admin',
  updatedDate: '2026-10-28T09:15:30.263',
  updatedBy: 'somchai.k',
  ...over,
});

const role = (over: Partial<RoleRecord> = {}): RoleRecord => ({
  id: 3,
  systemId: 'sys-1',
  systemName: 'Claim System',
  roleName: 'Claim Officer',
  description: 'Register and update claims',
  status: 'Active',
  createdDate: '2026-10-01T00:00:00',
  createdBy: 'admin',
  updatedDate: '2026-10-27T00:00:00',
  updatedBy: 'somchai.k',
  ...over,
});

describe('formatUpdated', () => {
  it('formats the date part of a LocalDateTime without shifting the day', () => {
    expect(formatUpdated('2026-10-28T09:15:30.263')).toBe('28 Oct 2026');
    expect(formatUpdated('2025-01-13T00:00:00')).toBe('13 Jan 2025');
  });
  it('returns an empty string for unusable input', () => {
    expect(formatUpdated('')).toBe('');
    expect(formatUpdated('not a date')).toBe('');
  });
});

describe('initials', () => {
  it('uses the first letters of up to two words', () => {
    expect(initials('Somchai Khemthong')).toBe('SK');
    expect(initials('  anan ')).toBe('A');
    expect(initials('')).toBe('');
  });
});

describe('toUserRow', () => {
  it('resolves the UAM role name by uamRoleId, since uamRole is empty from the backend', () => {
    const row = toUserRow(user(), uamRoles);
    expect(row.uamRole).toBe('ADMIN');
  });
  it('maps display fields and the active flag', () => {
    const row = toUserRow(user({ status: 'Inactive', phoneNo: null, department: null }), uamRoles);
    expect(row).toMatchObject({
      id: 7,
      name: 'Somchai Khemthong',
      username: 'somchai.k',
      ext: '',
      department: '',
      active: false,
      updated: '28 Oct 2026',
      updatedBy: 'somchai.k',
    });
  });
  it('leaves the role empty when the id is unknown', () => {
    expect(toUserRow(user({ uamRoleId: 99 }), uamRoles).uamRole).toBe('');
  });
});

describe('toRoleRow', () => {
  it('maps the role fields', () => {
    expect(toRoleRow(role({ status: 'Inactive', description: null }))).toMatchObject({
      id: 3,
      name: 'Claim Officer',
      system: 'Claim System',
      description: '',
      active: false,
      updated: '27 Oct 2026',
      updatedBy: 'somchai.k',
    });
  });
});

describe('filters', () => {
  const users = [
    toUserRow(user(), uamRoles),
    toUserRow(user({ id: 8, department: 'IT', status: 'Inactive' }), uamRoles),
    toUserRow(user({ id: 9, department: 'IT' }), uamRoles),
  ];

  it('offers Department / UAM role / Status for users, with distinct sorted options', () => {
    const defs = userFilters(users);
    expect(defs.map((d) => d.label)).toEqual(['Department', 'UAM role', 'Status']);
    expect(defs[0].options.map((o) => o.value)).toEqual(['', 'Claims', 'IT']);
    expect(defs[1].options.map((o) => o.value)).toEqual(['', 'ADMIN']);
    expect(defs[2].options.map((o) => o.value)).toEqual(['', 'Active', 'Inactive']);
  });

  it('matches rows against the chosen value', () => {
    const [dept, , status] = userFilters(users);
    expect(users.filter((r) => dept.matches(r, 'IT')).length).toBe(2);
    expect(users.filter((r) => status.matches(r, 'Inactive')).map((r) => r.id)).toEqual([8]);
  });

  it('offers System / Status for roles', () => {
    const roles = [toRoleRow(role()), toRoleRow(role({ id: 4, systemName: 'Agent Portal' }))];
    const defs = roleFilters(roles);
    expect(defs.map((d) => d.label)).toEqual(['System', 'Status']);
    expect(defs[0].options.map((o) => o.value)).toEqual(['', 'Agent Portal', 'Claim System']);
  });
});
