import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Paginator, type PaginatorState } from 'primeng/paginator';

import type { TableView } from './table-view';

/**
 * Under every table: "Showing 1 to X of Y entries" on the left, paginator on the right.
 * `<u-table-footer [view]="view" />`
 */
@Component({
  selector: 'u-table-footer',
  imports: [Paginator],
  template: `
    @let v = view();
    <p-paginator
      [first]="(v.page() * v.pageSize)"
      [rows]="v.pageSize"
      [totalRecords]="v.total()"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      (onPageChange)="onPage(v, $event)"
    />
  `,
  styles: `
    :host {
      display: block;
      border-top: 1px solid var(--uam-rule);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UTableFooter<T> {
  readonly view = input.required<TableView<T>>();

  protected onPage(view: TableView<T>, event: PaginatorState) {
    view.page.set(event.page ?? 0);
  }
}
