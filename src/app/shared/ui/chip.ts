import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A small label such as a permission function. `off` shows it struck through (not granted). */
@Component({
  selector: 'u-chip',
  template: '<ng-content />',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      height: 1.75rem;
      padding: 0 0.625rem;
      border: 1px solid transparent;
      border-radius: 6px;
      background: #e2edff;
      color: var(--uam-navy);
      font-size: 0.8125rem;
      font-weight: 700;
    }
    :host(.is-off) {
      background: transparent;
      border: 1px dashed #c4cad4;
      color: #6b7280;
      font-weight: 400;
      text-decoration: line-through;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-off]': 'off()' },
})
export class UChip {
  readonly off = input(false);
}

/** Wrapping group of chips. */
@Component({
  selector: 'u-chips',
  template: '<ng-content />',
  styles: ':host { display: flex; flex-wrap: wrap; gap: 0.375rem; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UChips {}
