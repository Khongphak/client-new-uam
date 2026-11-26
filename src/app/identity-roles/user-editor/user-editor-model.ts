import { RoleRecord, UserRecord } from '../../shared/interfaces';
import { parseListString } from '../../shared/list-string';
import { MenuTreeNode } from '../api/role-menu-tree';
import { ResolvedSystemRoles, resolveSystemRoles, UserFormValue } from '../api/user-mapper';

/** Pure model of the Edit user screen (no Angular): what the form holds, how changes are counted and sent. */
export interface ProfileFields {
  readonly username: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly fullName: string;
  readonly email: string;
  readonly department: string;
  readonly position: string;
  readonly phoneNo: string | null;
  readonly managers: readonly string[];
}

export interface EditorRow {
  /** Stable id of the row inside the screen (rows added in the form have no `userSystemId`). */
  readonly key: number;
  readonly userSystemId: number | null;
  readonly systemId: string | null;
  readonly roleId: number | null;
}

export interface EditorState {
  readonly profile: ProfileFields;
  readonly uamRoleId: number;
  readonly isSuperAdmin: boolean;
  readonly active: boolean;
  readonly rows: readonly EditorRow[];
}

export function fromUserRecord(record: UserRecord): EditorState {
  return {
    profile: {
      username: record.username,
      firstname: record.firstname,
      lastname: record.lastname,
      fullName: record.fullname,
      email: record.email,
      department: record.department ?? '',
      position: record.position ?? '',
      phoneNo: record.phoneNo,
      managers: parseListString(record.manager),
    },
    uamRoleId: record.uamRoleId,
    isSuperAdmin: record.isSuperAdmin,
    active: record.status === 'Active',
    rows: record.systemRoles.map((r, key) => ({
      key,
      userSystemId: r.userSystemId,
      systemId: r.systemId,
      roleId: r.roleId,
    })),
  };
}

const sameProfile = (a: ProfileFields, b: ProfileFields): boolean =>
  a.username === b.username &&
  a.firstname === b.firstname &&
  a.lastname === b.lastname &&
  a.fullName === b.fullName &&
  a.email === b.email &&
  a.department === b.department &&
  a.position === b.position &&
  a.phoneNo === b.phoneNo &&
  a.managers.join('\u0000') === b.managers.join('\u0000');

/**
 * Number of unsaved changes, by difference from what was loaded (so reverting a change takes it back off):
 * profile (as a whole), UAM role, System Admin, Active, and each system row added, removed or changed.
 */
export function countChanges(base: EditorState, current: EditorState): number {
  let n = 0;
  if (!sameProfile(base.profile, current.profile)) n++;
  if (base.uamRoleId !== current.uamRoleId) n++;
  if (base.isSuperAdmin !== current.isSuperAdmin) n++;
  if (base.active !== current.active) n++;
  for (const row of current.rows) {
    const was = row.userSystemId === null ? undefined : base.rows.find((b) => b.userSystemId === row.userSystemId);
    if (!was || was.systemId !== row.systemId || was.roleId !== row.roleId) n++;
  }
  for (const was of base.rows) {
    if (!current.rows.some((r) => r.userSystemId === was.userSystemId)) n++;
  }
  return n;
}

/** Keys of rows that cannot be saved: no system, no role, or a system that appears more than once. */
export function invalidRows(rows: readonly EditorRow[]): Set<number> {
  const bad = new Set<number>();
  const seen = new Set<string>();
  for (const row of rows) {
    if (row.systemId === null || row.roleId === null) {
      bad.add(row.key);
    } else if (seen.has(row.systemId)) {
      bad.add(row.key);
    } else {
      seen.add(row.systemId);
    }
  }
  return bad;
}

export function toFormValue(
  state: EditorState,
  roles: readonly RoleRecord[],
): { value: UserFormValue; unresolved: ResolvedSystemRoles['unresolved'] } {
  const { resolved, unresolved } = resolveSystemRoles(state.rows, roles);
  const p = state.profile;
  return {
    unresolved,
    value: {
      username: p.username,
      firstname: p.firstname,
      lastname: p.lastname,
      fullName: p.fullName,
      email: p.email,
      department: p.department,
      position: p.position,
      phoneNo: p.phoneNo,
      uamRoleId: state.uamRoleId,
      isSuperAdmin: state.isSuperAdmin,
      managers: p.managers,
      systemRoles: resolved,
    },
  };
}

export interface PreviewRow {
  readonly system: string;
  readonly role: string;
  readonly group: string;
  readonly menu: string;
  readonly perms: readonly string[];
}

/** Menus of one role as rows: group name + menu + the functions the role has (ungrouped menus get an empty group). */
export function menuRows(tree: readonly MenuTreeNode[], group = ''): { group: string; menu: string; perms: readonly string[] }[] {
  return tree.flatMap((node) =>
    node.kind === 'group'
      ? menuRows(node.children, node.groupName)
      : [{ group, menu: node.screenName, perms: node.permission }],
  );
}

/** Preview of everything the selected systems/roles give; rows whose menus are not loaded yet are skipped. */
export function previewRows(
  rows: readonly EditorRow[],
  roles: readonly RoleRecord[],
  menusByRole: Readonly<Record<number, readonly MenuTreeNode[]>>,
): PreviewRow[] {
  return rows.flatMap((row) => {
    const role = roles.find((r) => r.id === row.roleId && r.systemId === row.systemId);
    const tree = row.roleId === null ? undefined : menusByRole[row.roleId];
    if (!role || !tree) return [];
    return menuRows(tree).map((m) => ({ system: role.systemName, role: role.roleName, ...m }));
  });
}
