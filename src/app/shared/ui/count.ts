import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Small pill with a counter, e.g. the number on a tab or the Filters button. */
@Component({
  selector: 'u-count',
  template: '{{ value() }}',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.5rem;
      height: 1.375rem;
      padding: 0 0.4rem;
      border-radius: 0.6875rem;
      background: #eef0f4;
      color: #4a5263;
      font-size: 0.8125rem;
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UCount {
  readonly value = input.required<number | string>();
}
