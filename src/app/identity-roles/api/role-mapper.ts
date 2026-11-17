import { AddRoleRequest, UpdateRoleRequest } from '../../shared/interfaces';
import { MenuTreeNode, toMenusPayload } from './role-menu-tree';

export interface RoleFormValue {
  readonly systemId: string;
  readonly roleName: string;
  readonly description: string;
  readonly menus: readonly MenuTreeNode[];
}

// DEV-2: roleName is trimmed.
export function toAddRoleRequest(form: RoleFormValue): AddRoleRequest {
  return {
    systemId: form.systemId,
    roleName: form.roleName.trim(),
    description: form.description,
    status: 'Active',
    menus: toMenusPayload(form.menus),
  };
}

export function toUpdateRoleRequest(
  id: number,
  form: RoleFormValue,
  active: boolean,
): UpdateRoleRequest {
  return { id, ...toAddRoleRequest(form), status: active ? 'Active' : 'Inactive' };
}
