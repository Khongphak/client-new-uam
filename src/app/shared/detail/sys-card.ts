import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { UTile } from '../ui/tile';

/** Responsive grid of {@link USysCard}. */
@Component({
  selector: 'u-sys-grid',
  template: '<ng-content />',
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class USysGrid {}

/**
 * System card. Use a real element: `<a uSysCard href=… external>` opens in a new tab, `<div uSysCard>` is static.
 * Pass a PrimeIcons class via `icon`, or project an `<img>`/svg as content for the tile.
 */
@Component({
  selector: 'a[uSysCard], div[uSysCard]',
  imports: [UTile],
  template: `
    <span class="top">
      <u-tile [icon]="icon()"><ng-content /></u-tile>
      @if (external()) {
        <i class="pi pi-external-link" aria-hidden="true"></i>
      }
    </span>
    <span class="body">
      <b>{{ name() }}</b>
      @if (description(); as d) {
        <span class="muted">{{ d }}</span>
      }
    </span>
    <span class="foot">
      <span>{{ owner() }}</span>
      <span>{{ type() }}</span>
    </span>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      padding: 1.25rem;
      background: #fff;
      border: 1px solid var(--uam-line);
      border-radius: 14px;
      box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
      color: inherit;
      text-decoration: none;
      box-sizing: border-box;
    }
    :host(a:hover) {
      border-color: #c7dafc;
      box-shadow: 0 6px 20px rgba(0, 25, 75, 0.08);
    }
    :host(a:focus-visible) {
      outline: 2px solid #2854a7;
      outline-offset: 2px;
    }
    :host(.is-disabled) {
      background: #fafafa;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      min-height: 2.5rem;
    }
    .top .pi {
      color: var(--uam-muted);
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }
    .body b {
      font-size: 1.0625rem;
      overflow-wrap: anywhere;
    }
    .muted {
      color: var(--uam-muted);
    }
    .foot {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      font-size: 0.9375rem;
      color: var(--uam-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-disabled]': 'disabled()',
    '[attr.target]': 'external() ? "_blank" : null',
    '[attr.rel]': 'external() ? "noopener" : null',
    '[attr.aria-label]': 'external() ? "Open " + name() + " in a new tab" : null',
  },
})
export class USysCard {
  readonly name = input.required<string>();
  readonly description = input<string | null>();
  readonly owner = input<string | null>();
  readonly type = input<string | null>();
  readonly icon = input<string>();
  /** Visual only (inactive system). */
  readonly disabled = input(false, { transform: (v: boolean | '') => v === '' || v });
  /** Opens in a new tab: adds target/rel, the external-link icon and an accessible name. */
  readonly external = input(false, { transform: (v: boolean | '') => v === '' || v });
}
