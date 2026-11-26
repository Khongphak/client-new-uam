import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';

import { UCount } from '../ui/count';
import type { TableView } from './table-view';

/**
 * The bar above every table: search on the left, Filters button (with count) and Reset on the right,
 * and the panel of labelled dropdowns underneath when open.
 * `<u-table-toolbar [view]="view" searchPlaceholder="Search systems" />`
 */
@Component({
  selector: 'u-table-toolbar',
  imports: [ButtonDirective, IconField, InputIcon, InputText, UCount],
  template: `
    @let v = view();
    <div class="bar">
      <p-iconfield class="grow">
        <p-inputicon class="pi pi-search" />
        <input
          pInputText
          type="search"
          [attr.aria-label]="searchPlaceholder()"
          [placeholder]="searchPlaceholder()"
          [value]="v.query()"
          (input)="v.setQuery($any($event.target).value)"
        />
      </p-iconfield>
      @if (v.filterDefs.length > 0) {
        <div class="bar__end">
          <button
            pButton
            type="button"
            severity="secondary"
            data-testid="filters-btn"
            aria-controls="filters"
            [class.p-highlight]="v.filtersOpen()"
            [attr.aria-expanded]="v.filtersOpen()"
            (click)="v.toggleFilters()"
          >
            <i class="pi pi-filter" aria-hidden="true"></i>
            <span>Filters</span>
            @if (v.activeCount() > 0) {
              <u-count [value]="v.activeCount()" />
            }
          </button>
          @if (v.hasActive()) {
            <button pButton type="button" text data-testid="reset-btn" (click)="v.reset()">
              <i class="pi pi-filter-slash" aria-hidden="true"></i>
              <span>Reset</span>
            </button>
          }
        </div>
      }
    </div>
    @if (v.filtersOpen() && v.filterDefs.length > 0) {
      <div class="u-filters" id="filters" role="group" aria-label="Filters">
        @for (def of v.filterDefs; track def.id) {
          <div class="field">
            <label [for]="'f-' + def.id">{{ def.label }}</label>
            <select
              class="p-inputtext p-component"
              [id]="'f-' + def.id"
              [value]="v.filterValues()[def.id] ?? ''"
              (change)="v.setFilter(def.id, $any($event.target).value)"
            >
              @for (option of def.options; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.625rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--uam-rule);
    }
    .grow {
      flex: 1 1 15rem;
      max-width: 26rem;
      min-width: 0;
    }
    .grow input {
      width: 100%;
      height: 2.5rem;
      font-size: 0.9375rem;
    }
    .bar__end {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      margin-left: auto;
    }
    .bar__end button {
      height: 2.5rem;
    }
    .u-filters {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
      gap: var(--sp-3) var(--sp-4);
      padding: var(--sp-4);
      background: #f8fafc;
      border-bottom: 1px solid var(--uam-line);
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .field > label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--uam-muted);
    }
    .field select {
      height: 2.5rem;
      font-size: 0.9375rem;
    }
    @media (max-width: 767px) {
      .bar {
        padding: 0.75rem 1rem;
      }
      .bar__end {
        width: 100%;
        margin-left: 0;
      }
      .bar__end button {
        flex: 1;
        justify-content: center;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UTableToolbar<T> {
  readonly view = input.required<TableView<T>>();
  readonly searchPlaceholder = input('Search');
}
