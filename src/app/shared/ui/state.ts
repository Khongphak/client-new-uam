import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { USkel } from './skeleton';

const DEFAULT_ICON = { empty: 'pi-folder-open', error: 'pi-exclamation-triangle' } as const;

/**
 * Loading / empty / error state for a list or page area.
 * Text comes from the caller (message catalog or server); nothing is hard-coded here.
 * Put buttons in the `[uStateActions]` slot. `code` shows a small line such as `Error 50001`.
 */
@Component({
  selector: 'u-state',
  imports: [USkel],
  template: `
    @if (kind() === 'loading') {
      <div class="rows" role="status" [attr.aria-label]="label()" data-testid="u-state-loading">
        @for (row of rowList(); track row) {
          <div class="row">
            <u-skel width="2.5rem" height="2.5rem" radius="0.75rem" />
            <div class="lines">
              <u-skel width="55%" height="1rem" />
              <u-skel width="85%" height="0.875rem" />
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="state" [class.is-error]="kind() === 'error'">
        <span class="tile" aria-hidden="true"><i class="pi" [class]="iconClass()"></i></span>
        <b class="heading">{{ heading() }}</b>
        @if (message(); as text) {
          <p class="message">{{ text }}</p>
        }
        @if (code(); as c) {
          <small class="code">{{ c }}</small>
        }
        <div class="actions"><ng-content select="[uStateActions]" /></div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-2);
      padding: 3rem var(--sp-5);
      color: var(--uam-muted);
      text-align: center;
    }
    .tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.25rem;
      height: 3.25rem;
      margin-bottom: var(--sp-2);
      border-radius: 0.75rem;
      background: var(--uam-tile);
      color: var(--uam-navy);
      font-size: 1.375rem;
    }
    .is-error .tile {
      color: #4a5263;
    }
    .heading {
      color: var(--uam-ink);
      font-size: 1.0625rem;
    }
    .message {
      max-width: 28rem;
      margin: 0;
      line-height: 1.55;
    }
    .code {
      font-size: 0.8125rem;
    }
    .actions {
      display: flex;
      justify-content: center;
      gap: var(--sp-2);
      margin-top: var(--sp-3);
    }
    .actions:empty {
      display: none;
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      padding: 0.875rem var(--sp-4);
      border-bottom: 1px solid var(--uam-rule);
    }
    .lines {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: var(--sp-2);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UState {
  readonly kind = input.required<'loading' | 'empty' | 'error'>();
  readonly heading = input('');
  readonly message = input<string>();
  readonly code = input<string>();
  /** PrimeIcons class; defaults per kind. */
  readonly icon = input<string>();
  /** Accessible name of the loading region. */
  readonly label = input('Loading');
  /** Number of skeleton rows while loading. */
  readonly rows = input(3);

  protected readonly rowList = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
  protected readonly iconClass = computed(
    () => this.icon() ?? DEFAULT_ICON[this.kind() === 'error' ? 'error' : 'empty'],
  );
}
