import { LocalDateTime, RecordStatus } from './api-envelope';

// v1/Roles/* — spec section 9, and the menu tree of section 12.2.
export interface RoleRecord {
  readonly id: number;
  readonly systemId: string;
  readonly systemName: string;
  readonly roleName: string;
  readonly description: string | null;
  /** Must not be null. */
  readonly status: string;
  readonly createdDate: LocalDateTime;
  readonly createdBy: string | null;
  /** Must not be null. */
  readonly updatedDate: LocalDateTime;
  readonly updatedBy: string | null;
}

/**
 * Node of the menu tree the backend returns for a role (`get-roleMenu-byRoleId`, `get-menuRoleScreens-bySystemId`,
 * `userSystems[].menuRoleScreens`). `menuId === 0` (or null in the user preview) with `groupMenus` = group (folder).
 */
export interface RoleMenuItem {
  readonly id?: number;
  readonly roleId: number;
  readonly roleMenuId: number;
  readonly menuId: number | null;
  /** `roleMenuId` of the parent; 0 = root. */
  readonly parentId: number;
  readonly groupName: string | null;
  readonly screenName: string | null;
  readonly sortOrder: number;
  /** List string such as `[add,view]`, `[]` or null (never touched). */
  readonly permission: string | null;
  /** List string of what the menu supports. Not declared by the old model but always read. */
  readonly functional?: string | null;
  readonly imageGroupId: number;
  readonly createdDate?: LocalDateTime;
  readonly createdBy?: string | null;
  readonly updatedDate?: LocalDateTime;
  readonly updatedBy?: string | null;
  readonly groupMenus: readonly RoleMenuItem[];
}

/**
 * Node of the `menus` array in add-role / update-role bodies. Optional keys must be absent (not null) when unset:
 * ids exist only on nodes loaded from the server; `groupName`/`groupMenus` only on groups; `menuId`/`permission` only on menus.
 */
export interface RoleMenuRequestNode {
  readonly sortOrder: number;
  readonly imageGroupId: number;
  readonly roleId?: number;
  readonly roleMenuId?: number;
  readonly parentId?: number;
  readonly groupName?: string;
  readonly groupMenus?: readonly RoleMenuRequestNode[];
  readonly menuId?: number;
  readonly permission?: string;
}

export interface AddRoleRequest {
  readonly systemId: string;
  readonly roleName: string;
  readonly description: string;
  readonly status: RecordStatus;
  readonly menus: readonly RoleMenuRequestNode[];
}

export interface UpdateRoleRequest extends AddRoleRequest {
  readonly id: number;
}
