import { computed, signal, type Signal } from '@angular/core';

/** Value meaning "no filter" for a dropdown. */
export const FILTER_ALL = '';

export interface TableFilterOption {
  readonly value: string;
  readonly label: string;
}

/** One labelled dropdown in the Filters panel. Applied client-side to the rows already loaded. */
export interface TableFilterDef<T> {
  readonly id: string;
  readonly label: string;
  readonly options: readonly TableFilterOption[];
  /** True when `row` satisfies the selected (non-empty) `value`. */
  readonly matches: (row: T, value: string) => boolean;
}

export interface TableViewConfig<T> {
  readonly rows: Signal<readonly T[]>;
  /** Fields the search box looks at. */
  readonly searchText: (row: T) => readonly (string | null | undefined)[];
  readonly filters?: readonly TableFilterDef<T>[];
  readonly pageSize?: number;
}

export type TableView<T> = ReturnType<typeof createTableView<T>>;

/**
 * Search + filter + paging state for one table, computed in the browser from the loaded rows.
 * No request parameters are involved, so the backend payload is unchanged.
 */
export function createTableView<T>(config: TableViewConfig<T>) {
  const filterDefs = config.filters ?? [];
  const pageSize = config.pageSize ?? 10;

  const query = signal('');
  const filterValues = signal<Readonly<Record<string, string | undefined>>>({});
  const filtersOpen = signal(false);
  const page = signal(0);

  const activeFilters = computed(() =>
    filterDefs.filter((def) => (filterValues()[def.id] ?? FILTER_ALL) !== FILTER_ALL),
  );
  const activeCount = computed(() => activeFilters().length);
  const hasActive = computed(() => activeCount() > 0 || query().trim() !== '');

  const filtered = computed(() => {
    const needle = query().trim().toLowerCase();
    const active = activeFilters();
    const values = filterValues();
    return config.rows().filter(
      (row) =>
        active.every((def) => def.matches(row, values[def.id] ?? FILTER_ALL)) &&
        (needle === '' ||
          config
            .searchText(row)
            .some((text) => (text ?? '').toLowerCase().includes(needle))),
    );
  });

  const total = computed(() => filtered().length);
  const pageCount = computed(() => Math.max(1, Math.ceil(total() / pageSize)));
  /** Current page index, kept inside the range when the rows shrink. */
  const safePage = computed(() => Math.min(page(), pageCount() - 1));
  const start = computed(() => safePage() * pageSize);
  const pageRows = computed(() => filtered().slice(start(), start() + pageSize));
  const first = computed(() => (total() === 0 ? 0 : start() + 1));
  const last = computed(() => Math.min(start() + pageSize, total()));

  return {
    pageSize,
    filterDefs,
    query: query.asReadonly(),
    filterValues: filterValues.asReadonly(),
    filtersOpen: filtersOpen.asReadonly(),
    page: Object.assign(safePage, { set: (value: number) => page.set(value) }),
    filtered,
    pageRows,
    total,
    first,
    last,
    activeCount,
    hasActive,
    setQuery(value: string) {
      query.set(value);
      page.set(0);
    },
    setFilter(id: string, value: string) {
      if (!filterDefs.some((def) => def.id === id)) return;
      filterValues.update((current) => ({ ...current, [id]: value }));
      page.set(0);
    },
    toggleFilters() {
      filtersOpen.update((open) => !open);
    },
    reset() {
      query.set('');
      filterValues.set({});
      page.set(0);
    },
  };
}
