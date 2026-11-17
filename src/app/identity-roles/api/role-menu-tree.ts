import { RoleMenuItem, RoleMenuRequestNode } from '../../shared/interfaces';
import { parseListString, toListString } from '../../shared/list-string';

/** Pure domain model of the Role editor's menu tree (no Angular). */
export type MenuTreeNode = GroupNode | MenuNode;

interface NodeBase {
  readonly imageGroupId: number;
  /** Present only on nodes loaded from the server; echoed back on update. */
  readonly roleId?: number;
  readonly roleMenuId?: number;
  readonly parentId?: number;
}
export interface GroupNode extends NodeBase {
  readonly kind: 'group';
  readonly groupName: string;
  readonly children: readonly MenuTreeNode[];
}
export interface MenuNode extends NodeBase {
  readonly kind: 'menu';
  readonly menuId: number;
  readonly screenName: string;
  readonly permission: readonly string[];
  /** Functions the menu supports; `permission` must stay a subset of it. */
  readonly functional: readonly string[];
}

/** Server tree → editor tree. A node with `menuId` 0 or null that has `groupMenus` is a group. */
export function fromRoleMenuItems(items: readonly RoleMenuItem[] | null): MenuTreeNode[] {
  return (items ?? []).map((item): MenuTreeNode => {
    const ids = {
      imageGroupId: item.imageGroupId,
      roleId: item.roleId,
      roleMenuId: item.roleMenuId,
      parentId: item.parentId,
    };
    if (!item.menuId && item.groupMenus) {
      return {
        kind: 'group',
        ...ids,
        groupName: item.groupName ?? '',
        children: fromRoleMenuItems(item.groupMenus),
      };
    }
    return {
      kind: 'menu',
      ...ids,
      menuId: item.menuId ?? 0,
      screenName: item.screenName ?? '',
      permission: parseListString(item.permission),
      functional: parseListString(item.functional),
    };
  });
}

/**
 * Editor tree → `menus` of add/update-role. Depth-first, pre-order, with ONE running `sortOrder` (1, 2, 3 …) for the
 * whole tree (not reset per level). Keys that do not apply are omitted, never null.
 */
export function toMenusPayload(tree: readonly MenuTreeNode[]): RoleMenuRequestNode[] {
  let order = 0;
  const walk = (nodes: readonly MenuTreeNode[]): RoleMenuRequestNode[] =>
    nodes.map((node) => {
      const base = {
        sortOrder: ++order,
        imageGroupId: node.imageGroupId,
        ...(node.roleId !== undefined && { roleId: node.roleId }),
        ...(node.roleMenuId !== undefined && { roleMenuId: node.roleMenuId }),
        ...(node.parentId !== undefined && { parentId: node.parentId }),
      };
      if (node.kind === 'group') {
        return { ...base, groupName: node.groupName, groupMenus: walk(node.children) };
      }
      return { ...base, menuId: node.menuId, permission: toListString(node.permission) };
    });
  return walk(tree);
}
