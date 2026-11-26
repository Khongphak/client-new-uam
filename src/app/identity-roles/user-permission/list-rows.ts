import { FILTER_ALL, type TableFilterDef } from '../../shared/table';
import { RoleRecord, UamRoleItem, UserListItem } from '../../shared/interfaces';

/** One display row of the Users tab. Only fields the user list model already carries. */
export interface UserRow {
  readonly id: number;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly ext: string;
  readonly department: string;
  readonly uamRole: string;
  readonly active: boolean;
  readonly updated: string;
  readonly updatedBy: string;
}

/** One display row of the Roles tab. */
export interface RoleRow {
  readonly id: number;
  readonly name: string;
  readonly system: string;
  readonly description: string;
  readonly active: boolean;
  readonly updated: string;
  readonly updatedBy: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2026-10-28T09:15:30` → `28 Oct 2026`. Reads the date part as written, so no time-zone shift. */
export function formatUpdated(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  return match && month ? `${match[3]} ${month} ${match[1]}` : '';
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function toUserRow(user: UserListItem, uamRoles: readonly UamRoleItem[]): UserRow {
  return {
    id: user.id,
    name: user.fullname,
    username: user.username,
    email: user.email,
    ext: user.phoneNo ?? '',
    department: user.department ?? '',
    // `uamRole` / `roleName` come back empty: the name is looked up by id.
    uamRole: uamRoles.find((role) => role.id === user.uamRoleId)?.name ?? '',
    active: user.status === 'Active',
    updated: formatUpdated(user.updatedDate),
    updatedBy: user.updatedBy ?? '',
  };
}

export function toRoleRow(role: RoleRecord): RoleRow {
  return {
    id: role.id,
    name: role.roleName,
    system: role.systemName,
    description: role.description ?? '',
    active: role.status === 'Active',
    updated: formatUpdated(role.updatedDate),
    updatedBy: role.updatedBy ?? '',
  };
}

const distinctOptions = (values: readonly string[]) => [
  { value: FILTER_ALL, label: 'All' },
  ...[...new Set(values.filter((value) => value !== ''))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value })),
];

const statusFilter = <T extends { readonly active: boolean }>(): TableFilterDef<T> => ({
  id: 'status',
  label: 'Status',
  options: [
    { value: FILTER_ALL, label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ],
  matches: (row, value) => row.active === (value === 'Active'),
});

export function userFilters(rows: readonly UserRow[]): TableFilterDef<UserRow>[] {
  return [
    {
      id: 'department',
      label: 'Department',
      options: distinctOptions(rows.map((row) => row.department)),
      matches: (row, value) => row.department === value,
    },
    {
      id: 'uamRole',
      label: 'UAM role',
      options: distinctOptions(rows.map((row) => row.uamRole)),
      matches: (row, value) => row.uamRole === value,
    },
    statusFilter<UserRow>(),
  ];
}

export function roleFilters(rows: readonly RoleRow[]): TableFilterDef<RoleRow>[] {
  return [
    {
      id: 'system',
      label: 'System',
      options: distinctOptions(rows.map((row) => row.system)),
      matches: (row, value) => row.system === value,
    },
    statusFilter<RoleRow>(),
  ];
}
