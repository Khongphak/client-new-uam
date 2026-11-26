import type { RoleMenuItem } from '../../shared/interfaces';
import { countMenuStats, type MenuStats } from '../../shared/detail';
import { parseListString } from '../../shared/list-string';

export interface MenuRowView {
  readonly name: string;
  /** Functions the menu supports. */
  readonly functional: readonly string[];
  /** Functions given to this role. */
  readonly granted: readonly string[];
}

/** One card: the top-level menus (`path` null) or the menus directly inside one group. */
export interface MenuSectionView {
  readonly path: string | null;
  /** 0 for the top level and first-level groups; +1 per nested group. */
  readonly depth: number;
  readonly menus: readonly MenuRowView[];
}

export interface RoleMenuView {
  readonly stats: MenuStats;
  readonly sections: readonly MenuSectionView[];
}

const isGroup = (n: RoleMenuItem): boolean => n.menuId == null || n.menuId === 0;
const bySortOrder = (a: RoleMenuItem, b: RoleMenuItem): number => a.sortOrder - b.sortOrder;

/** `view` → `View`: the backend stores function names in lower case, the design shows them capitalised. */
const label = (fn: string): string => fn.charAt(0).toUpperCase() + fn.slice(1);

function toRow(n: RoleMenuItem): MenuRowView {
  return {
    name: n.screenName ?? '',
    functional: parseListString(n.functional).map(label),
    granted: parseListString(n.permission).map(label),
  };
}

/**
 * Read-only view of a role's menu tree, computed from the tree already loaded (no extra backend field).
 * "Top level" is the number of menus that sit outside any group, as in the artboard.
 */
export function buildRoleMenuView(tree: readonly RoleMenuItem[]): RoleMenuView {
  const roots = [...tree].sort(bySortOrder);
  const topMenus = roots.filter((n) => !isGroup(n));
  const sections: MenuSectionView[] = [];
  if (topMenus.length > 0) sections.push({ path: null, depth: 0, menus: topMenus.map(toRow) });

  const walk = (nodes: readonly RoleMenuItem[], parents: readonly string[]): void => {
    for (const g of nodes.filter(isGroup)) {
      const path = [...parents, g.groupName ?? ''];
      const children = [...(g.groupMenus ?? [])].sort(bySortOrder);
      const menus = children.filter((n) => !isGroup(n));
      if (menus.length > 0) {
        sections.push({ path: path.join(' › '), depth: parents.length, menus: menus.map(toRow) });
      }
      walk(children, path);
    }
  };
  walk(roots, []);

  return {
    stats: { ...countMenuStats(tree), topLevel: topMenus.length },
    sections,
  };
}
