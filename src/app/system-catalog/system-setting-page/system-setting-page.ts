import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { createTableView, FILTER_ALL, UTableFooter, UTableToolbar } from '../../shared/table';
import type { TableFilterDef, TableView } from '../../shared/table';
import { UState } from '../../shared/ui/state';
import { UStatus } from '../../shared/ui/status';
import { UToastService } from '../../shared/ui/toast';
import { MenuScreenApi } from '../api/menu-screen-api';
import { SystemApi } from '../api/system-api';
import { SystemDrawer, SystemDrawerMode, SystemSaved } from '../system-drawer/system-drawer';
import {
  CLOSED_DRAWER_QUERY,
  DrawerState,
  drawerFromParams,
  drawerQuery,
} from './drawer-url';
import {
  menuRow,
  s2sRow,
  SettingRow,
  SettingTab,
  SettingTabId,
  systemRow,
  tabFromFragment,
  TABS,
} from './system-setting-rows';

const STATUS_FILTER: TableFilterDef<SettingRow> = {
  id: 'status',
  label: 'Status',
  options: [
    { value: FILTER_ALL, label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ],
  matches: (row, value) => row.active === (value === 'Active'),
};

/** A dropdown whose options are the distinct values of one column, taken from the rows loaded. */
function columnFilter(
  id: string,
  label: string,
  rows: () => readonly SettingRow[],
  valueOf: (row: SettingRow) => string,
): TableFilterDef<SettingRow> {
  return {
    id,
    label,
    get options() {
      const values = [...new Set(rows().map(valueOf).filter(Boolean))].sort();
      return [{ value: FILTER_ALL, label: 'All' }, ...values.map((v) => ({ value: v, label: v }))];
    },
    matches: (row, value) => valueOf(row) === value,
  };
}

const cell = (index: number) => (row: SettingRow) => row.cells[index];
const name = (row: SettingRow) => row.name;

/** System Setting: System / Menu / System to System tables, searched and filtered in the browser. */
@Component({
  selector: 'app-system-setting-page',
  imports: [UTableToolbar, UTableFooter, UState, UStatus, SystemDrawer],
  templateUrl: './system-setting-page.html',
  styleUrl: './system-setting-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSettingPage {
  readonly #systems = inject(SystemApi);
  readonly #menus = inject(MenuScreenApi);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #location = inject(Location);
  readonly #toast = inject(UToastService);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly tabs = TABS;

  readonly #systemRes = rxResource({ stream: () => this.#systems.getAll(), defaultValue: [] });
  readonly #menuRes = rxResource({ stream: () => this.#menus.getAll(), defaultValue: [] });
  readonly #s2sRes = rxResource({
    stream: () => this.#systems.getAllSystemToSystem(),
    defaultValue: [],
  });

  readonly #systemRows = computed(() =>
    (this.#systemRes.hasValue() ? this.#systemRes.value() : []).map(systemRow),
  );
  readonly #menuRows = computed(() =>
    (this.#menuRes.hasValue() ? this.#menuRes.value() : []).map(menuRow),
  );
  readonly #s2sRows = computed(() =>
    (this.#s2sRes.hasValue() ? this.#s2sRes.value() : []).map(s2sRow),
  );

  // Filter options come from the rows already loaded (no extra request).
  protected readonly views: Record<SettingTabId, TableView<SettingRow>> = {
    system: createTableView({
      rows: this.#systemRows,
      searchText: (r) => [r.name, r.code, ...r.cells],
      filters: [
        columnFilter('owner', 'Owner', this.#systemRows, cell(0)),
        columnFilter('type', 'System type', this.#systemRows, cell(1)),
        STATUS_FILTER,
      ],
    }),
    menu: createTableView({
      rows: this.#menuRows,
      searchText: (r) => [r.name, r.cells[0]],
      filters: [columnFilter('system', 'System', this.#menuRows, cell(0)), STATUS_FILTER],
    }),
    'system-to-system': createTableView({
      rows: this.#s2sRows,
      searchText: (r) => [r.name, r.cells[0]],
      filters: [
        columnFilter('source', 'Source system', this.#s2sRows, name),
        columnFilter('target', 'Target system', this.#s2sRows, cell(0)),
        STATUS_FILTER,
      ],
    }),
  };

  readonly #fragment = toSignal(this.#route.fragment, {
    initialValue: this.#route.snapshot.fragment,
  });
  protected readonly tab = computed(() => tabFromFragment(this.#fragment()));
  protected readonly view = computed(() => this.views[this.tab().id]);

  /** Tab counters count the rows loaded, not the rows left after search/filter. */
  protected readonly counts = computed<Record<SettingTabId, number>>(() => ({
    system: this.#systemRows().length,
    menu: this.#menuRows().length,
    'system-to-system': this.#s2sRows().length,
  }));

  readonly #resource = computed(
    () =>
      ({ system: this.#systemRes, menu: this.#menuRes, 'system-to-system': this.#s2sRes })[
        this.tab().id
      ],
  );
  protected readonly loading = computed(
    () => this.#resource().isLoading() && this.counts()[this.tab().id] === 0,
  );
  protected readonly failed = computed(() => this.#resource().error() !== undefined);

  /** Menu / System-to-System rows only mark the row until UAM-SYS-03 / -04 bring their drawers. */
  protected readonly opened = signal<{ tab: SettingTabId; key: string } | null>(null);

  readonly #queryParams = toSignal(this.#route.queryParamMap, {
    initialValue: this.#route.snapshot.queryParamMap,
  });
  /** The drawer shown, read from `?drawer=&mode=&id=` so a deep link, refresh and Back all work. */
  protected readonly drawer = computed<DrawerState | null>(() =>
    drawerFromParams(this.#queryParams()),
  );
  protected readonly owners = computed(() => [
    ...new Set(this.#systemRows().map((r) => r.cells[0]).filter(Boolean)),
  ]);

  /** True once this page pushed a history entry for the drawer, so closing can go Back instead of stacking another. */
  #pushed = false;
  /** Name of the system just created: its row gets the highlight and the focus when the table is reloaded. */
  readonly #created = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.drawer() === null) this.#pushed = false;
    });
    effect(() => {
      const name = this.#created();
      if (name === null || this.#systemRes.isLoading()) return;
      const row = this.#systemRows().find((r) => r.name === name);
      this.#created.set(null);
      if (!row) return;
      this.opened.set({ tab: 'system', key: row.key });
      queueMicrotask(() =>
        this.#host.nativeElement
          .querySelector<HTMLElement>(`[data-testid="row-${row.key}"] button.link`)
          ?.focus(),
      );
    });
  }

  protected open(mode: 'view' | 'edit', row: SettingRow): void {
    if (this.tab().id === 'system' && row.code) {
      this.#show({ kind: 'system', mode, id: row.code });
    } else {
      this.opened.set({ tab: this.tab().id, key: row.key });
    }
  }

  protected openAdd(): void {
    if (this.tab().id === 'system') this.#show({ kind: 'system', mode: 'add', id: null });
  }

  protected isOpened(row: SettingRow): boolean {
    const o = this.opened();
    const d = this.drawer();
    if (d?.kind === 'system' && this.tab().id === 'system') return d.id !== null && d.id === row.code;
    return o !== null && o.tab === this.tab().id && o.key === row.key;
  }

  /** Opening pushes a history entry (Back closes the drawer); View → Edit replaces it. */
  #show(state: DrawerState): void {
    const replace = this.drawer() !== null;
    this.#pushed = true;
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: drawerQuery(state),
      preserveFragment: true,
      replaceUrl: replace,
    });
  }

  protected toEdit(): void {
    const d = this.drawer();
    if (d) this.#show({ ...d, mode: 'edit' as SystemDrawerMode });
  }

  protected closeDrawer(): void {
    if (this.#pushed) {
      this.#location.back();
      return;
    }
    void this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: CLOSED_DRAWER_QUERY,
      queryParamsHandling: 'merge',
      preserveFragment: true,
      replaceUrl: true,
    });
  }

  protected onSaved(saved: SystemSaved): void {
    this.closeDrawer();
    this.#systemRes.reload();
    if (saved.mode === 'add') {
      this.#created.set(saved.systemName);
      this.#toast.success(
        'System created',
        `Access token: ${saved.accessTokenTime} min · Refresh token: ${saved.refreshTokenTime} min. You can change these later in Edit.`,
      );
    } else {
      this.#toast.success('System saved');
    }
  }

  protected selectTab(tab: SettingTab): void {
    this.opened.set(null);
    void this.#router.navigate([], {
      relativeTo: this.#route,
      fragment: tab.fragment,
      replaceUrl: true,
    });
  }

  protected retry(): void {
    this.#resource().reload();
  }
}
