import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Shimmering placeholder block. Decorative: put `role="status"` + a label on the surrounding region. */
@Component({
  selector: 'u-skel',
  template: '',
  styles: `
    :host {
      display: block;
      width: var(--u-skel-w, 100%);
      height: var(--u-skel-h, 1rem);
      border-radius: var(--u-skel-r, 6px);
      background: linear-gradient(90deg, #eef0f4 25%, #f7f8fa 37%, #eef0f4 63%);
      background-size: 400% 100%;
      animation: u-shimmer 1.4s ease infinite;
    }
    @keyframes u-shimmer {
      0% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0 50%;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[style.--u-skel-w]': 'width()',
    '[style.--u-skel-h]': 'height()',
    '[style.--u-skel-r]': 'radius()',
  },
})
export class USkel {
  /** Any CSS length, e.g. `55%` or `2.5rem`. */
  readonly width = input<string>();
  readonly height = input<string>();
  readonly radius = input<string>();
}
