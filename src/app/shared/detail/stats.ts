import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { RoleMenuItem } from '../interfaces';

export interface StatItem {
  readonly value: number | string;
  readonly label: string;
}

export interface MenuStats {
  readonly menus: number;
  readonly groups: number;
  readonly topLevel: number;
}

/**
 * Menus / Groups / Top level of a role, computed on the front end from the menu tree already loaded
 * (no extra field from the backend). A group is a node without a `menuId` (null or 0); groups count at any depth.
 */
export function countMenuStats(tree: readonly RoleMenuItem[]): MenuStats {
  let menus = 0;
  let groups = 0;
  const walk = (nodes: readonly RoleMenuItem[]): void => {
    for (const n of nodes) {
      if (n.menuId == null || n.menuId === 0) groups++;
      else menus++;
      walk(n.groupMenus ?? []);
    }
  };
  walk(tree);
  return { menus, groups, topLevel: tree.length };
}

/** A bordered strip of big numbers with captions. */
@Component({
  selector: 'u-stats',
  template: `
    @for (s of items(); track s.label) {
      <div>
        <b>{{ s.value }}</b>
        <span>{{ s.label }}</span>
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      border: 1px solid var(--hair);
      border-radius: 0.75rem;
      margin: var(--sp-3) 0 var(--sp-4);
    }
    div {
      padding: 0.75rem var(--sp-2);
      text-align: center;
      border-left: 1px solid var(--uam-rule);
    }
    div:first-child {
      border-left: 0;
    }
    b {
      display: block;
      font-size: 1.375rem;
      line-height: 1.2;
      color: var(--uam-navy);
    }
    span {
      font-size: 0.8125rem;
      color: var(--uam-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', '[attr.aria-label]': 'label()' },
})
export class UStats {
  readonly items = input.required<readonly StatItem[]>();
  /** Accessible name of the group, e.g. "Role size". */
  readonly label = input<string>();
}
