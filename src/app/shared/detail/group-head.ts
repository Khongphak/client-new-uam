import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { UTile } from '../ui/tile';

/** Header of a menu group inside a card: tile, path, and a hint such as "2 menus". */
@Component({
  selector: 'u-group-head',
  imports: [UTile],
  template: `
    <u-tile size="sm" [icon]="icon()" />
    <b>{{ title() }}</b>
    @if (hint(); as h) {
      <span class="hint">{{ h }}</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      background: #f8fafc;
      border-bottom: 1px solid var(--uam-rule);
    }
    b {
      flex: 1;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .hint {
      color: var(--uam-muted);
      font-size: 0.875rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UGroupHead {
  readonly title = input.required<string>();
  readonly hint = input<string>();
  readonly icon = input<string>('pi-folder-open');
}
