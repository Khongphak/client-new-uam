import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { UDialog, UDialogDetail, UDialogKind } from '../../shared/ui/dialog';
import { Session } from '../session';
import { HttpErrorDialogState } from './http-error-dialog';

/** Texts of DlgSession / DlgNetwork / DlgServer (typed message catalog for these three dialogs). */
const MESSAGES = {
  session: {
    heading: 'Your session has expired',
    message: 'Log in again to continue. Changes you haven’t saved are lost.',
  },
  network: {
    heading: 'Can’t reach the server',
    message: 'Check your connection, then try again.',
    detail: { label: 'Error', value: 'Network error' },
  },
  server: {
    heading: 'Something went wrong',
    message:
      'The server couldn’t finish your request. Try again in a moment. If this keeps happening, contact IT Support.',
  },
} as const;

interface View {
  readonly kind: UDialogKind;
  readonly icon: string;
  readonly heading: string;
  readonly message: string;
  readonly detail: UDialogDetail | null;
  readonly retryable: boolean;
}

/** Mounted once in the app root: shows the single `u-dialog` for session-expired, network and server errors. */
@Component({
  selector: 'u-http-error-dialogs',
  imports: [UDialog, ButtonModule],
  template: `
    @if (view(); as v) {
      <u-dialog
        [visible]="true"
        [kind]="v.kind"
        [icon]="v.icon"
        [heading]="v.heading"
        [message]="v.message"
        [detail]="v.detail"
      >
        <span uDialogActions class="actions">
          @if (v.retryable) {
            <p-button
              label="Close"
              severity="secondary"
              data-testid="dlg-close"
              (onClick)="state.dismiss()"
            />
            <p-button label="Try again" data-testid="dlg-retry" (onClick)="retry()" />
          } @else {
            <p-button label="Log in again" data-testid="dlg-login" (onClick)="logIn()" />
          }
        </span>
      </u-dialog>
    }
  `,
  styles: '.actions { display: contents; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpErrorDialogs {
  protected readonly state = inject(HttpErrorDialogState);
  readonly #session = inject(Session);
  readonly #router = inject(Router);
  readonly #document = inject(DOCUMENT);

  /** Session expiry outranks everything: nothing else can succeed until the user signs in again. */
  protected readonly view = computed<View | null>(() => {
    if (this.#session.expired()) {
      return { kind: 'info', icon: 'pi-bell', ...MESSAGES.session, detail: null, retryable: false };
    }
    const error = this.state.current();
    if (error?.kind === 'network') {
      return { kind: 'warn', icon: 'pi-wifi', ...MESSAGES.network, retryable: true };
    }
    if (error?.kind === 'server') {
      const value = error.message ? `${error.code} · ${error.message}` : error.code;
      return {
        kind: 'error',
        icon: 'pi-exclamation-triangle',
        ...MESSAGES.server,
        detail: { label: 'Error', value },
        retryable: true,
      };
    }
    return null;
  });

  protected logIn(): void {
    this.#session.clear();
    void this.#router.navigateByUrl('/login');
  }

  /** The interceptor does not keep failed requests, so "Try again" reloads the page to refetch its data. */
  protected retry(): void {
    this.state.dismiss();
    this.#document.defaultView?.location.reload();
  }
}
