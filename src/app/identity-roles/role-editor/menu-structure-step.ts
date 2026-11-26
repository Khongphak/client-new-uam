import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { map } from 'rxjs';

import { parseListString } from '../../shared/list-string';
import { UCount } from '../../shared/ui';
import { MasterDataApi } from '../../system-catalog/api/master-data-api';
import { MenuScreenApi } from '../../system-catalog/api/menu-screen-api';
import {
  addGroup,
  allPlaces,
  deleteGroup,
  destinations,
  dropTarget,
  groupCount,
  menuCount,
  menuIdOf,
  menuKey,
  MenuOption,
  moveBy,
  place,
  placeLabel,
  removeMenu,
  renameGroup,
  ROOT,
  setGroupIcon,
  StructureRow,
  structureRows,
  usedMenuIds,
  MAX_GROUP_DEPTH,
  depthOf,
} from './menu-structure';
import { RoleEditorStore } from './role-editor-store';

/**
 * Step 2 of the role editor: ONE menu structure (groups and menus, max 2 group levels) on the left, the menus not
 * used yet on the right. Reorder/move by dragging, or with the ⋯ menu (Move up / Move down / Move to…) and the
 * "Add to…" select, so the keyboard never needs a drag.
 */
@Component({
  selector: 'app-menu-structure-step',
  imports: [ButtonDirective, InputText, UCount],
  templateUrl: './menu-structure-step.html',
  styleUrl: './menu-structure-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuStructureStep {
  protected readonly store = inject(RoleEditorStore);
  readonly #menuApi = inject(MenuScreenApi);
  readonly #master = inject(MasterDataApi);

  protected readonly menus = rxResource({
    params: () => this.store.info().systemId || undefined,
    stream: ({ params }) =>
      this.#menuApi.getBySystemId(params).pipe(
        map((list): MenuOption[] =>
          list.map((m) => ({
            menuId: m.id,
            screenName: m.screenName,
            functional: parseListString(m.functional),
            imageId: m.imageId,
          })),
        ),
      ),
  });
  readonly #icons = rxResource({ stream: () => this.#master.getIcons() });

  /** Group icons: the "Menu" icons of `get-icons`. Server SVG is shown through `<img>` only, never as HTML. */
  protected readonly iconOptions = computed(() =>
    (this.#icons.hasValue() ? this.#icons.value() : [])
      .filter((i) => i.category === 'Menu')
      .map((i) => ({ id: i.id, name: i.name, src: `data:image/svg+xml;base64,${i.data}` })),
  );

  protected readonly query = signal('');
  protected readonly openKey = signal<string | null>(null);
  protected readonly editKey = signal<string | null>(null);
  protected readonly deleteKey = signal<string | null>(null);
  protected readonly overKey = signal<string | null>(null);
  /** Spoken to screen readers after a move (the list reorders silently otherwise). */
  protected readonly announcement = signal('');
  #dragKey: string | null = null;

  readonly #structure = this.store.structure;
  readonly #options = computed(() => (this.menus.hasValue() ? this.menus.value() : []));
  readonly #byId = computed(() => new Map(this.#options().map((m) => [m.menuId, m])));

  protected readonly rows = computed(() => {
    const s = this.#structure();
    const open = this.openKey();
    return structureRows(s).map((row) => {
      const group = row.isGroup ? s.groups[row.key] : undefined;
      return {
        row,
        group,
        name: group ? group.name : (this.#byId().get(menuIdOf(row.key))?.screenName ?? row.key),
        count: group ? menuCount(s, row.key) : 0,
        iconSrc: group ? (this.iconOptions().find((i) => i.id === group.imageGroupId)?.src ?? null) : null,
        pad: `${12 + row.depth * 28}px`,
        canSub: !!group && depthOf(s, row.key) < MAX_GROUP_DEPTH,
        dests: open === row.key && row.kind === 'item' ? destinations(s, row.key) : [],
      };
    });
  });

  protected readonly poolAll = computed(() => {
    const used = usedMenuIds(this.#structure());
    return this.#options().filter((m) => !used.has(m.menuId));
  });
  protected readonly pool = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.poolAll().filter((m) => !q || m.screenName.toLowerCase().includes(q));
  });
  protected readonly poolText = computed(() => `${this.poolAll().length} of ${this.#options().length} not used yet`);
  protected readonly places = computed(() =>
    allPlaces(this.#structure()).map((key) => ({ key, label: placeLabel(this.#structure(), key) })),
  );
  protected readonly summary = computed(() => {
    const s = this.#structure();
    const used = usedMenuIds(s).size;
    const top = s.items[ROOT].filter((k) => !k.startsWith('g')).length;
    return `${groupCount(s)} groups · ${used} menus assigned (${top} at top level)`;
  });
  protected readonly editingIcons = this.iconOptions;

  // ---- edits -------------------------------------------------------------------------------------------------
  #edit(fn: Parameters<RoleEditorStore['editStructure']>[0], message?: string): void {
    this.store.editStructure(fn);
    this.openKey.set(null);
    this.overKey.set(null);
    if (message) this.announcement.set(message);
  }

  #nameOf(key: string): string {
    const s = this.#structure();
    return key in s.groups ? s.groups[key].name : (this.#byId().get(menuIdOf(key))?.screenName ?? key);
  }

  protected toggleMenu(key: string): void {
    this.openKey.update((k) => (k === key ? null : key));
  }
  protected closeMenu(): void {
    this.openKey.set(null);
  }

  protected newGroup(parent: string): void {
    const meta = {
      name: parent === ROOT ? 'New group' : 'New sub group',
      imageGroupId: this.iconOptions()[0]?.id ?? 0,
    };
    const result = addGroup(this.#structure(), parent, meta);
    if (!result.key) return;
    this.store.structure.set(result.structure);
    this.openKey.set(null);
    this.editKey.set(result.key);
    this.announcement.set(`Added ${meta.name}`);
  }
  protected toggleEdit(key: string): void {
    this.editKey.update((k) => (k === key ? null : key));
    this.openKey.set(null);
  }
  protected rename(key: string, event: Event): void {
    this.store.editStructure((s) => renameGroup(s, key, (event.target as HTMLInputElement).value));
  }
  protected pickIcon(key: string, id: number): void {
    this.store.editStructure((s) => setGroupIcon(s, key, id));
  }
  protected askDelete(key: string): void {
    this.deleteKey.set(key);
    this.openKey.set(null);
  }
  protected cancelDelete(): void {
    this.deleteKey.set(null);
  }
  protected doDelete(key: string): void {
    const name = this.#nameOf(key);
    this.deleteKey.set(null);
    this.editKey.set(null);
    this.#edit((s) => deleteGroup(s, key), `Deleted ${name}`);
  }
  protected remove(key: string): void {
    this.#edit((s) => removeMenu(s, key), `Removed ${this.#nameOf(key)} from the role`);
  }
  protected up(key: string): void {
    this.#edit((s) => moveBy(s, key, -1), `Moved ${this.#nameOf(key)} up`);
  }
  protected down(key: string): void {
    this.#edit((s) => moveBy(s, key, 1), `Moved ${this.#nameOf(key)} down`);
  }
  protected moveTo(key: string, dest: string): void {
    const s = this.#structure();
    this.#edit((cur) => place(cur, key, dest, cur.items[dest].length), `Moved ${this.#nameOf(key)} to ${placeLabel(s, dest)}`);
  }
  protected addFromPool(menuId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const dest = select.value;
    select.value = '';
    if (!dest) return;
    this.#edit(
      (s) => place(s, menuKey(menuId), dest, s.items[dest].length),
      `Added ${this.#byId().get(menuId)?.screenName ?? 'menu'} to ${placeLabel(this.#structure(), dest)}`,
    );
  }
  protected search(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  // ---- drag and drop (desktop; the ⋯ menu does the same without a pointer) ------------------------------------
  protected dragStart(key: string, event: DragEvent): void {
    this.#dragKey = key;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', key);
    }
  }
  protected dragEnd(): void {
    this.#dragKey = null;
    this.overKey.set(null);
  }
  #target(event: DragEvent, row: StructureRow | 'end') {
    if (!this.#dragKey) return null;
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const half = event.clientY - box.top < box.height / 2 ? 'top' : 'bottom';
    return dropTarget(this.#structure(), this.#dragKey, row, half);
  }
  protected dragOver(event: DragEvent, row: StructureRow | 'end'): void {
    const target = this.#target(event, row);
    if (!target) return;
    event.preventDefault();
    this.overKey.set(`${row === 'end' ? 'end' : row.key}|${target.pos}`);
  }
  protected dragLeave(rowKey: string): void {
    if ((this.overKey() ?? '').startsWith(`${rowKey}|`)) this.overKey.set(null);
  }
  protected drop(event: DragEvent, row: StructureRow | 'end'): void {
    event.preventDefault();
    const target = this.#target(event, row);
    const key = this.#dragKey;
    this.dragEnd();
    if (!target || !key) return;
    this.#edit(
      (s) => place(s, key, target.parent, target.index),
      `Moved ${this.#nameOf(key)} to ${placeLabel(this.#structure(), target.parent)}`,
    );
  }
  protected ring(key: string): string {
    const over = this.overKey();
    if (over === `${key}|before`) return 'inset 0 3px 0 0 #2854a7';
    if (over === `${key}|after`) return 'inset 0 -3px 0 0 #2854a7';
    return 'none';
  }
  protected into(key: string): boolean {
    return this.overKey() === `${key}|into`;
  }

  protected readonly root = ROOT;
}
