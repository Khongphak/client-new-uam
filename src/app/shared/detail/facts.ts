import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface FactItem {
  /** PrimeIcons class, e.g. `pi-user`. */
  readonly icon: string;
  readonly label: string;
  /** Null / blank shows an em dash. */
  readonly value: string | null | undefined;
}

/** Read-only label/value list with an icon per row. `cols` = two columns on desktop; `prose` = long-text style. */
@Component({
  selector: 'u-facts',
  template: `
    <ul class="u-facts" [class.is-cols]="cols()" [class.is-prose]="prose()">
      @for (item of items(); track item.label) {
        <li>
          <i class="pi" [class]="item.icon" aria-hidden="true"></i>
          <span>
            <span class="u-facts__k">{{ item.label }}</span>
            <span class="u-facts__v">{{ item.value?.trim() || '—' }}</span>
          </span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      display: grid;
      grid-template-columns: 1.25rem minmax(0, 1fr);
      gap: var(--sp-3);
      padding: 0.75rem 0;
      border-top: 1px solid var(--uam-rule);
    }
    li:first-child {
      border-top: 0;
    }
    .pi {
      color: var(--uam-muted);
      font-size: 1rem;
      margin-top: 0.1875rem;
    }
    .u-facts__k {
      display: block;
      font-size: 0.8125rem;
      color: var(--uam-muted);
      line-height: 1.4;
    }
    .u-facts__v {
      display: block;
      font-weight: 700;
      overflow-wrap: anywhere;
    }
    ul.is-cols {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: var(--sp-5);
    }
    ul.is-cols li:nth-child(2) {
      border-top: 0;
    }
    @media (max-width: 767px) {
      ul.is-cols {
        grid-template-columns: minmax(0, 1fr);
      }
      ul.is-cols li:nth-child(2) {
        border-top: 1px solid var(--uam-rule);
      }
    }
    ul.is-prose li {
      padding: 1.125rem 0;
    }
    ul.is-prose .pi {
      font-size: 1.125rem;
      color: var(--uam-navy);
      margin-top: 0.25rem;
    }
    ul.is-prose .u-facts__k {
      font-size: 1.0625rem;
      font-weight: 700;
      color: var(--uam-navy);
      margin-bottom: 0.25rem;
    }
    ul.is-prose .u-facts__v {
      font-weight: 400;
      line-height: 1.7;
      color: var(--ink);
      max-width: 46rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-cols]': 'cols()', '[class.is-prose]': 'prose()' },
})
export class UFacts {
  readonly items = input.required<readonly FactItem[]>();
  readonly cols = input(false, { transform: (v: boolean | '') => v === '' || v });
  readonly prose = input(false, { transform: (v: boolean | '') => v === '' || v });
}
