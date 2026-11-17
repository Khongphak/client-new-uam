import {
  AddUserRequest,
  RoleRecord,
  UpdateUserRequest,
  UserSystemRole,
} from '../../shared/interfaces';
import { toListString } from '../../shared/list-string';

/** A row of the "system + role" list in the user form. */
export interface SystemRoleSelection {
  readonly systemId: string | null;
  readonly roleId: number | null;
  /** Id of the existing user-system row; null for rows added in the form. */
  readonly userSystemId: number | null;
}

export interface UserFormValue {
  readonly username: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly fullName: string;
  readonly email: string;
  readonly department: string;
  readonly position: string;
  readonly phoneNo: string | null;
  readonly uamRoleId: number;
  readonly isSuperAdmin: boolean;
  /** Up to three manager names; empty entries are dropped. */
  readonly managers: readonly string[];
  readonly systemRoles: readonly UserSystemRole[];
}

export interface ResolvedSystemRoles {
  readonly resolved: UserSystemRole[];
  /** Incomplete rows (no system or no role) are dropped; rows whose role is not in the loaded list are reported here
   * so the screen can warn instead of silently losing them. */
  readonly unresolved: SystemRoleSelection[];
}

/** Builds `systemRoles` by id (not by role name): sends all five keys, taking the names from `get-all-roles`. */
export function resolveSystemRoles(
  rows: readonly SystemRoleSelection[],
  roles: readonly RoleRecord[],
): ResolvedSystemRoles {
  const resolved: UserSystemRole[] = [];
  const unresolved: SystemRoleSelection[] = [];
  for (const row of rows) {
    if (row.systemId === null || row.roleId === null) continue;
    const role = roles.find((r) => r.id === row.roleId && r.systemId === row.systemId);
    if (!role) {
      unresolved.push(row);
      continue;
    }
    resolved.push({
      userSystemId: row.userSystemId,
      systemId: role.systemId,
      systemName: role.systemName,
      roleId: role.id,
      roleName: role.roleName,
    });
  }
  return { resolved, unresolved };
}

export function toAddUserRequest(form: UserFormValue): AddUserRequest {
  return {
    username: form.username,
    firstname: form.firstname,
    lastname: form.lastname,
    fullName: form.fullName,
    email: form.email,
    department: form.department,
    position: form.position,
    phoneNo: form.phoneNo,
    uamRoleId: form.uamRoleId,
    isSuperAdmin: form.isSuperAdmin,
    status: 'Active',
    manager: toListString(form.managers.map((m) => m.trim()).filter((m) => m.length > 0)),
    systemRoles: form.systemRoles,
  };
}

/** Same body as add, with `status` from the Active switch. */
export function toUpdateUserRequest(form: UserFormValue, active: boolean): UpdateUserRequest {
  return { ...toAddUserRequest(form), status: active ? 'Active' : 'Inactive' };
}
