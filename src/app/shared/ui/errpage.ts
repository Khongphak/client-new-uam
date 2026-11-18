import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Full-page error (404 / 403): slim topbar, icon, code, heading, paragraph and buttons.
 * Put buttons in the `[uErrpageActions]` slot. Text comes from the caller.
 */
@Component({
  selector: 'u-errpage',
  template: `
    <header class="top"><span class="brand">Phillip Life</span></header>
    <main class="body">
      <span class="tile" aria-hidden="true"><i class="pi" [class]="icon()"></i></span>
      <span class="code" data-testid="u-errpage-code">{{ code() }}</span>
      <h1 class="heading">{{ heading() }}</h1>
      <p class="message">{{ message() }}</p>
      <div class="actions"><ng-content select="[uErrpageActions]" /></div>
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--uam-ground);
    }
    .top {
      display: flex;
      align-items: center;
      height: var(--uam-menu-height);
      padding: 0 var(--sp-6);
      border-bottom: 1px solid var(--uam-line);
      background: #fff;
    }
    .brand {
      color: var(--uam-navy);
      font-size: 1.25rem;
      font-weight: 700;
    }
    .body {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--sp-3);
      padding: 3rem var(--sp-5);
      text-align: center;
    }
    .tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 0.75rem;
      background: var(--uam-tile);
      color: var(--uam-navy);
      font-size: 1.5rem;
    }
    .code {
      color: var(--uam-muted);
      font-size: 0.875rem;
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    .heading {
      margin: 0;
      color: var(--uam-navy);
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1.3;
    }
    .message {
      max-width: 30rem;
      margin: 0;
      color: var(--uam-ink-2);
      line-height: 1.6;
    }
    .actions {
      display: flex;
      justify-content: center;
      gap: var(--sp-2);
      margin-top: var(--sp-4);
    }
    @media (max-width: 767.98px) {
      .top {
        height: 3.5rem;
        padding: 0 var(--sp-4);
      }
      .body {
        padding: 2rem var(--sp-4);
      }
      .heading {
        font-size: 1.375rem;
      }
      .actions {
        flex-direction: column;
        align-self: stretch;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UErrPage {
  readonly code = input.required<string>();
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  /** PrimeIcons class. */
  readonly icon = input('pi-compass');
}
