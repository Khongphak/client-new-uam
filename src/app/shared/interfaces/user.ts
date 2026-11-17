import { LocalDateTime, RecordStatus } from './api-envelope';
import { RoleMenuItem } from './role';

// v1/Users/*, v1/UAM/* — spec section 10. Note the case differences: requests use `fullName`, responses `fullname`.
export interface UserListItem {
  readonly id: number;
  readonly username: string;
  readonly fullname: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly email: string;
  readonly department: string | null;
  readonly position: string | null;
  readonly phoneNo: string | null;
  readonly isSuperAdmin: boolean;
  /** Must not be null. */
  readonly status: string;
  readonly uamRoleId: number;
  /** Always null/empty in practice — resolve the name from {@link UamRoleItem} by `uamRoleId`. */
  readonly roleName: string | null;
  readonly uamRole: string;
  readonly createdDate: LocalDateTime;
  readonly createdBy: string | null;
  /** Must not be null. */
  readonly updatedDate: LocalDateTime;
  readonly updatedBy: string | null;
}

export interface UserSystemRole {
  /** Id of the user-system row: a number for existing rows, null for rows added in the form. Echo it back unchanged. */
  readonly userSystemId: number | null;
  readonly systemId: string | null;
  readonly systemName: string | null;
  readonly roleId: number | null;
  readonly roleName: string | null;
}

/** `data` of `get-user-byId` — a single object, not an array. */
export interface UserRecord extends Omit<UserListItem, 'roleName' | 'uamRole'> {
  readonly uamRoleName: string;
  /** List string of manager names, e.g. `[Name One,Name Two]` (see shared/list-string). */
  readonly manager: string;
  readonly systemRoles: readonly UserSystemRole[];
}

export interface UserSystemAccess {
  /** Equals `userSystemId` of the matching {@link UserSystemRole}. */
  readonly id: number;
  readonly systemId: string;
  readonly systemName: string;
  readonly roleId: number;
  readonly roleName: string;
  readonly menuRoleScreens: readonly RoleMenuItem[];
}

/** `data` of `get-userRole-byId`: top-level profile fields are mostly empty; `userSystems` is what the preview uses. */
export interface UserRoleDetail {
  readonly userId: number | null;
  readonly userSystems: readonly UserSystemAccess[];
}

export interface AdSearchRequest {
  readonly userName: string;
  readonly email: null;
  readonly position: null;
  readonly department: null;
}

export interface AdUserItem {
  readonly username: string;
  readonly fullName: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNo: string | null;
  /** Present in the response; never show or log it. */
  readonly checkPwd: unknown;
  readonly department: string;
  readonly position: string;
  /** Not declared by the old model but read by the form (`name` only). */
  readonly managers?: readonly { readonly name: string }[];
}

export interface UamRoleItem {
  readonly id: number;
  readonly name: string;
  readonly status: string;
  readonly description: string | null;
  readonly createdDate: LocalDateTime;
  readonly createdBy: string | null;
  readonly updatedDate: LocalDateTime;
  readonly updatedBy: string | null;
}

export interface AddUserRequest {
  readonly username: string;
  /** Lower-case `firstname`/`lastname` but camel-case `fullName`. */
  readonly firstname: string;
  readonly lastname: string;
  readonly fullName: string;
  readonly email: string;
  readonly department: string;
  readonly position: string;
  readonly phoneNo: string | null;
  /** `UamRoleItem.id` as a number. */
  readonly uamRoleId: number;
  readonly isSuperAdmin: boolean;
  readonly status: RecordStatus;
  /** List string of names, `[]` when none. */
  readonly manager: string;
  /** Rows missing from this array are treated by the backend as removed. All five keys must be sent. */
  readonly systemRoles: readonly UserSystemRole[];
}

/** Same body as add; sent to `update-user/{userId}` (no `id` in the body). */
export type UpdateUserRequest = AddUserRequest;
