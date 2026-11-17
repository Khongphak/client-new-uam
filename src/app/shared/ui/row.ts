import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A list row inside a card. Apply to a real element so tappable rows are links/buttons:
 * `<a uRow routerLink="...">`, `<button uRow>` or `<div uRow>`.
 * `layout="stack"` stacks children; `layout="cols"` is a grid driven by `cols`.
 */
@Component({
  selector: 'a[uRow], button[uRow], div[uRow]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      width: 100%;
      min-height: 4.25rem;
      padding: 0.5rem 1.25rem;
      border: 0;
      border-bottom: 1px solid var(--uam-rule);
      background: #fff;
      color: inherit;
      font: inherit;
      text-align: left;
      text-decoration: none;
      box-sizing: border-box;
    }
    :host(:last-child) {
      border-bottom: 0;
    }
    :host(a:hover),
    :host(button:hover) {
      background: #f6f8fc;
      cursor: pointer;
    }
    :host(.is-disabled) {
      background: #fafafa;
    }
    :host(.is-stack) {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
    :host(.is-cols) {
      display: grid;
      grid-template-columns: var(--cols);
      gap: 1rem;
      align-items: center;
    }
    @media (max-width: 767.98px) {
      :host(a),
      :host(button) {
        min-height: 2.75rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-stack]': 'layout() === "stack"',
    '[class.is-cols]': 'layout() === "cols"',
    '[class.is-disabled]': 'disabled()',
    '[style.--cols]': 'cols()',
  },
})
export class URow {
  readonly layout = input<'row' | 'stack' | 'cols'>('row');
  /** CSS `grid-template-columns` for `layout="cols"`. */
  readonly cols = input<string>();
  /** Visual only; also set `disabled` / `aria-disabled` on the element yourself. */
  readonly disabled = input(false);
}
