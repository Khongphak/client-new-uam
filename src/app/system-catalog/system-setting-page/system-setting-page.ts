import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { createTableView, FILTER_ALL, UTableFooter, UTableToolbar } from '../../shared/table';
import type { TableFilterDef, TableView } from '../../shared/table';
import { UState } from '../../shared/ui/state';
import { UStatus } from '../../shared/ui/status';
import { MenuScreenApi } from '../api/menu-screen-api';
import { SystemApi } from '../api/system-api';
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
  imports: [UTableToolbar, UTableFooter, UState, UStatus],
  templateUrl: './system-setting-page.html',
  styleUrl: './system-setting-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSettingPage {
  readonly #systems = inject(SystemApi);
  readonly #menus = inject(MenuScreenApi);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

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

  /**
   * Row last opened with View / Edit (highlighted like the artboard's `sel` row). UAM-SYS-02..04 show the drawer
   * for it; until then the buttons only mark the row.
   */
  protected readonly opened = signal<{
    tab: SettingTabId;
    mode: 'view' | 'edit';
    key: string;
  } | null>(null);

  protected open(mode: 'view' | 'edit', row: SettingRow): void {
    this.opened.set({ tab: this.tab().id, mode, key: row.key });
  }

  protected isOpened(row: SettingRow): boolean {
    const o = this.opened();
    return o !== null && o.tab === this.tab().id && o.key === row.key;
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
