import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Status as a coloured dot plus text, never a coloured chip (design spec). */
@Component({
  selector: 'u-status',
  template: `<span class="dot" aria-hidden="true"></span>{{ text() }}`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--uam-muted);
      font-size: 0.9375rem;
    }
    :host(.is-ok) {
      color: var(--uam-ok);
    }
    .dot {
      width: 0.4375rem;
      height: 0.4375rem;
      border-radius: 50%;
      background: currentColor;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-ok]': 'active()' },
})
export class UStatus {
  readonly active = input.required<boolean>();
  /** Overrides the default "Active" / "Inactive" text. */
  readonly label = input<string>();

  protected readonly text = computed(() => this.label() ?? (this.active() ? 'Active' : 'Inactive'));
}
