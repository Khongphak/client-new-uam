import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Small muted icon + text, e.g. the system name under a page title. */
@Component({
  selector: 'u-meta-ico',
  template: `<i class="pi" [class]="icon()" aria-hidden="true"></i><ng-content />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      color: var(--uam-muted);
    }
    .pi {
      font-size: 0.875rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UMetaIco {
  /** PrimeIcons class, e.g. `pi-server`. */
  readonly icon = input.required<string>();
}
