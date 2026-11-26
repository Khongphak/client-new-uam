import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { UTile } from '../ui/tile';

/** One collapsible block per system on View pages. Native `<details>`, so it works from the keyboard. */
@Component({
  selector: 'u-accordion',
  imports: [UTile],
  template: `
    <details [open]="open()">
      <summary>
        <u-tile [icon]="icon()" />
        <span class="text">
          <b>{{ title() }}</b>
          @if (subtitle(); as sub) {
            <span class="sub">{{ sub }}</span>
          }
        </span>
        <i class="pi pi-angle-down chev" aria-hidden="true"></i>
      </summary>
      <div class="body"><ng-content /></div>
    </details>
  `,
  styles: `
    :host {
      display: block;
      border-bottom: 1px solid var(--uam-rule);
    }
    :host(:last-child) {
      border-bottom: 0;
    }
    summary {
      list-style: none;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      min-height: 4rem;
      padding: 0.5rem 1.25rem;
      cursor: pointer;
    }
    summary::-webkit-details-marker {
      display: none;
    }
    summary:hover {
      background: #f8fafc;
    }
    summary:focus-visible {
      outline: 2px solid #2854a7;
      outline-offset: -2px;
    }
    .text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .sub {
      font-size: 0.875rem;
      color: var(--uam-muted);
    }
    .chev {
      display: inline-block;
      margin-left: auto;
      color: var(--uam-muted);
      transition: transform 0.15s;
    }
    details[open] .chev {
      transform: rotate(180deg);
    }
    .body {
      padding: 0 1.25rem 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UAccordion {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  /** PrimeIcons class for the tile. */
  readonly icon = input<string>();
  readonly open = input(false, { transform: (v: boolean | '') => v === '' || v });
}
