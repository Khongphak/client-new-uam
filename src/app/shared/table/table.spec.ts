import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UTableFooter } from './table-footer';
import { UTableToolbar } from './table-toolbar';
import { createTableView, type TableFilterDef } from './table-view';

interface Row {
  name: string;
  owner: string;
  status: 'Active' | 'Inactive';
}

const ROWS: Row[] = [
  { name: 'Alpha', owner: 'Ann', status: 'Active' },
  { name: 'Beta', owner: 'Bob', status: 'Inactive' },
  { name: 'Gamma', owner: 'Ann', status: 'Active' },
  { name: 'Delta', owner: 'Cid', status: 'Inactive' },
  { name: 'Epsilon', owner: 'Ann', status: 'Inactive' },
];

const STATUS: TableFilterDef<Row> = {
  id: 'status',
  label: 'Status',
  options: [
    { value: '', label: 'All' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ],
  matches: (row, value) => row.status === value,
};
const OWNER: TableFilterDef<Row> = {
  id: 'owner',
  label: 'Owner',
  options: [
    { value: '', label: 'All' },
    { value: 'Ann', label: 'Ann' },
  ],
  matches: (row, value) => row.owner === value,
};

function make(pageSize = 2) {
  const rows = signal<readonly Row[]>(ROWS);
  const view = createTableView<Row>({
    rows,
    searchText: (r) => [r.name, r.owner],
    filters: [STATUS, OWNER],
    pageSize,
  });
  return { rows, view };
}

describe('createTableView', () => {
  it('shows everything paged when nothing is applied', () => {
    const { view } = make();
    expect(view.total()).toBe(5);
    expect(view.pageRows().map((r) => r.name)).toEqual(['Alpha', 'Beta']);
    expect([view.first(), view.last()]).toEqual([1, 2]);
    expect(view.activeCount()).toBe(0);
    expect(view.hasActive()).toBe(false);
  });

  it('searches case-insensitively across the given fields and trims', () => {
    const { view } = make(10);
    view.setQuery('  ANN ');
    expect(view.filtered().map((r) => r.name)).toEqual(['Alpha', 'Gamma', 'Epsilon']);
    view.setQuery('bet');
    expect(view.filtered().map((r) => r.name)).toEqual(['Beta']);
  });

  it('combines filters with AND and counts only the non-empty ones', () => {
    const { view } = make(10);
    view.setFilter('status', 'Inactive');
    expect(view.activeCount()).toBe(1);
    view.setFilter('owner', 'Ann');
    expect(view.activeCount()).toBe(2);
    expect(view.filtered().map((r) => r.name)).toEqual(['Epsilon']);
    view.setFilter('owner', '');
    expect(view.activeCount()).toBe(1);
    expect(view.total()).toBe(3);
  });

  it('does not count the search text in the Filters counter but treats it as active', () => {
    const { view } = make();
    view.setQuery('a');
    expect(view.activeCount()).toBe(0);
    expect(view.hasActive()).toBe(true);
  });

  it('goes back to page 1 when the search or a filter changes', () => {
    const { view } = make();
    view.page.set(2);
    view.setQuery('a');
    expect(view.page()).toBe(0);
    view.page.set(1);
    view.setFilter('status', 'Active');
    expect(view.page()).toBe(0);
  });

  it('reports the shown range on the last, partial page', () => {
    const { view } = make();
    view.page.set(2);
    expect(view.pageRows().map((r) => r.name)).toEqual(['Epsilon']);
    expect([view.first(), view.last(), view.total()]).toEqual([5, 5, 5]);
  });

  it('reports 0 to 0 when nothing matches', () => {
    const { view } = make();
    view.setQuery('zzz');
    expect([view.first(), view.last(), view.total()]).toEqual([0, 0, 0]);
    expect(view.pageRows()).toEqual([]);
  });

  it('clamps the page when the loaded rows shrink', () => {
    const { rows, view } = make();
    view.page.set(2);
    rows.set(ROWS.slice(0, 2));
    expect(view.pageRows().map((r) => r.name)).toEqual(['Alpha', 'Beta']);
    expect(view.first()).toBe(1);
  });

  it('reset clears search and filters, keeps the panel open state, returns to page 1', () => {
    const { view } = make();
    view.toggleFilters();
    view.setQuery('a');
    view.setFilter('status', 'Active');
    view.page.set(1);
    view.reset();
    expect([view.query(), view.activeCount(), view.page(), view.filtersOpen()]).toEqual([
      '',
      0,
      0,
      true,
    ]);
    expect(view.total()).toBe(5);
  });

  it('ignores an unknown filter id', () => {
    const { view } = make();
    view.setFilter('nope', 'x');
    expect(view.total()).toBe(5);
  });
});

@Component({
  imports: [UTableToolbar, UTableFooter],
  template: `
    <u-table-toolbar [view]="view" searchPlaceholder="Search systems" />
    <u-table-footer [view]="view" />
  `,
})
class Host {
  readonly view = createTableView<Row>({
    rows: signal(ROWS),
    searchText: (r) => [r.name, r.owner],
    filters: [STATUS, OWNER],
    pageSize: 2,
  });
}

describe('table toolbar + footer', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return { fixture, el, view: fixture.componentInstance.view };
  }
  const q = (el: HTMLElement, sel: string) => el.querySelector<HTMLElement>(sel)!;

  it('types into search and filters the view', () => {
    const { fixture, el, view } = setup();
    const input = q(el, 'input[type="search"]') as HTMLInputElement;
    expect(input.placeholder).toBe('Search systems');
    input.value = 'beta';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(view.total()).toBe(1);
    expect(q(el, '.p-paginator-current').textContent).toContain(
      'Showing 1 to 1 of 1 entries',
    );
  });

  it('opens the panel from the Filters button, shows the count and applies a dropdown', () => {
    const { fixture, el, view } = setup();
    const btn = q(el, '[data-testid="filters-btn"]');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('#filters')).toBeNull();
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const labels = [...el.querySelectorAll('.u-filters label')].map((l) => l.textContent?.trim());
    expect(labels).toEqual(['Status', 'Owner']);
    const select = q(el, '#f-status') as HTMLSelectElement;
    select.value = 'Active';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(view.total()).toBe(2);
    expect(q(el, '[data-testid="filters-btn"] u-count').textContent?.trim()).toBe('1');
  });

  it('shows Reset only when something is applied and clears it', () => {
    const { fixture, el, view } = setup();
    expect(el.querySelector('[data-testid="reset-btn"]')).toBeNull();
    view.setQuery('a');
    fixture.detectChanges();
    q(el, '[data-testid="reset-btn"]').click();
    fixture.detectChanges();
    expect(view.query()).toBe('');
    expect((q(el, 'input[type="search"]') as HTMLInputElement).value).toBe('');
    expect(el.querySelector('[data-testid="reset-btn"]')).toBeNull();
  });

  it('footer shows the range and pages with the paginator', () => {
    const { fixture, el, view } = setup();
    expect(q(el, '.p-paginator-current').textContent).toContain('Showing 1 to 2 of 5 entries');
    q(el, '.p-paginator-next').click();
    fixture.detectChanges();
    expect(view.page()).toBe(1);
    expect(q(el, '.p-paginator-current').textContent).toContain('Showing 3 to 4 of 5 entries');
  });
});
