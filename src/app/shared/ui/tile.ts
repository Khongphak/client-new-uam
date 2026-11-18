import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Icon tile for a system or group. Pass a PrimeIcons class via `icon`, or project your own glyph
 * (e.g. an SVG) as content. Decorative: the label next to it carries the meaning.
 */
@Component({
  selector: 'u-tile',
  template: `
    @if (icon(); as cls) {
      <i class="pi" [class]="cls" aria-hidden="true"></i>
    } @else {
      <ng-content />
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: var(--uam-tile);
      color: var(--uam-navy);
    }
    :host(.is-sm) {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.625rem;
    }
    :host(.is-off) {
      color: #4a5263;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-sm]': 'size() === "sm"',
    '[class.is-off]': 'off()',
    'aria-hidden': 'true',
  },
})
export class UTile {
  /** PrimeIcons class, e.g. `pi-folder-open`. */
  readonly icon = input<string>();
  readonly size = input<'md' | 'sm'>('md');
  /** Muted colour for inactive items and error states. */
  readonly off = input(false);
}
