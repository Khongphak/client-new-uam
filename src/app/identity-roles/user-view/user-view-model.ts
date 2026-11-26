import { FactItem } from '../../shared/detail';
import { RoleMenuItem, UserRecord, UserRoleDetail } from '../../shared/interfaces';
import { parseListString } from '../../shared/list-string';
import { formatUpdated, initials } from '../user-permission/list-rows';

export interface UserViewMenu {
  /** Name of the enclosing group, or null for a top-level menu. */
  readonly group: string | null;
  readonly name: string;
  /** Functions given to the user's role in this system. */
  readonly functions: readonly string[];
}

export interface UserViewSystem {
  readonly id: number;
  readonly name: string;
  readonly subtitle: string;
  readonly open: boolean;
  readonly menus: readonly UserViewMenu[];
}

/** Everything the User View page shows, derived only from `get-user-byId` and `get-userRole-byId`. */
export interface UserView {
  readonly name: string;
  readonly initials: string;
  readonly active: boolean;
  readonly role: string;
  readonly facts: readonly FactItem[];
  readonly approvers: readonly string[];
  readonly systems: readonly UserViewSystem[];
}

/** Menus of a tree in display order; a group's menus carry the group name (nested groups use the nearest one). */
function flattenMenus(nodes: readonly RoleMenuItem[], group: string | null = null): UserViewMenu[] {
  return nodes.flatMap((node) => {
    if (!node.menuId && node.groupMenus?.length) {
      return flattenMenus(node.groupMenus, node.groupName ?? group);
    }
    if (!node.menuId) return [];
    return [{ group, name: node.screenName ?? '', functions: parseListString(node.permission) }];
  });
}

export function toUserView(user: UserRecord, detail: UserRoleDetail): UserView {
  const updated = formatUpdated(user.updatedDate);
  return {
    name: user.fullname,
    initials: initials(user.fullname),
    active: user.status === 'Active',
    role: user.uamRoleName,
    facts: [
      { icon: 'pi-user', label: 'Username', value: user.username },
      { icon: 'pi-id-card', label: 'Name – Surname', value: user.fullname },
      { icon: 'pi-envelope', label: 'Email', value: user.email },
      { icon: 'pi-phone', label: 'Extension number', value: user.phoneNo },
      { icon: 'pi-briefcase', label: 'Position', value: user.position },
      { icon: 'pi-building', label: 'Department', value: user.department },
      { icon: 'pi-shield', label: 'UAM role', value: user.uamRoleName },
      { icon: 'pi-key', label: 'System Admin', value: user.isSuperAdmin ? 'Yes' : 'No' },
      {
        icon: 'pi-clock',
        label: 'Updated',
        value: updated && user.updatedBy ? `${updated} by ${user.updatedBy}` : updated,
      },
    ],
    approvers: parseListString(user.manager),
    systems: detail.userSystems.map((s, i) => {
      const menus = flattenMenus(s.menuRoleScreens);
      return {
        id: s.id,
        name: s.systemName,
        subtitle: `Role: ${s.roleName} · ${menus.length} ${menus.length === 1 ? 'menu' : 'menus'}`,
        open: i === 0,
        menus,
      };
    }),
  };
}
