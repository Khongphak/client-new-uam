import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { UChip, UChips } from '../ui/chip';

/**
 * A menu name with its function chips. With `granted`, functions outside it are shown struck through
 * (supported by the menu but not given to the role). `group` adds a "Group /" prefix; `flush` = padded row inside a group card.
 */
@Component({
  selector: 'u-perm-row',
  imports: [UChip, UChips],
  template: `
    <span class="name">
      @if (group(); as g) {
        <small>{{ g }} /</small>
      }
      {{ name() }}
    </span>
    <u-chips>
      @for (f of functional(); track f) {
        @let off = isOff(f);
        <u-chip [off]="off" [attr.aria-label]="off ? f + ', not granted' : null">{{ f }}</u-chip>
      }
    </u-chips>
  `,
  styles: `
    :host {
      display: flex;
      gap: 0.75rem 1.25rem;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0;
      border-top: 1px solid var(--uam-rule);
      flex-wrap: wrap;
      font-size: 0.9375rem;
    }
    :host(.is-flush) {
      padding: 0.75rem 1.25rem;
      border-top: 0;
      border-bottom: 1px solid var(--uam-rule);
    }
    :host(.is-flush:last-child) {
      border-bottom: 0;
    }
    small {
      color: var(--uam-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-flush]': 'flush()' },
})
export class UPermRow {
  readonly name = input.required<string>();
  readonly group = input<string>();
  /** Functions the menu supports (parsed from the `functional` list string). */
  readonly functional = input.required<readonly string[]>();
  /** Functions given to the role (parsed from `permission`). Omit to show every chip as granted. */
  readonly granted = input<readonly string[] | null>(null);
  readonly flush = input(false, { transform: (v: boolean | '') => v === '' || v });

  protected isOff(fn: string): boolean {
    const g = this.granted();
    return g !== null && !g.includes(fn);
  }
}
