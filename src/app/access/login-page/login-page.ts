import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { CLIENT_ID } from '../../core/api/api-config';
import { ApiException } from '../../core/api/api-error';
import { CONSENT_URL, HOME_URL, safeReturnUrl } from '../../core/guards/auth-guard';
import { Session } from '../../core/session';
import { AuthApi } from '../api/auth-api';

export const REMEMBERED_USERNAME_KEY = 'uam.rememberedUsername';

const MESSAGE = {
  credentials: 'Username or password is incorrect. Check them and try again.',
  network: 'Network Error!!!',
  server: 'Something went wrong on our side. Please try again, or contact IT Support.',
} as const;

function readRemembered(): string {
  try {
    return localStorage.getItem(REMEMBERED_USERNAME_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeRemembered(username: string | null): void {
  try {
    if (username) localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
    else localStorage.removeItem(REMEMBERED_USERNAME_KEY);
  } catch {
    // Storage can be blocked; remembering the username is only a convenience.
  }
}

/** Sign in (artboard Main / MainPhone, note n-login). Payload of `v1/auth/login` is unchanged. */
@Component({
  selector: 'app-login-page',
  imports: [FormsModule, ButtonModule, CheckboxModule, InputTextModule, MessageModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  readonly #auth = inject(AuthApi);
  readonly #session = inject(Session);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #clientId = inject(CLIENT_ID);

  readonly username = signal(readRemembered());
  readonly password = signal('');
  readonly remember = signal(true);
  readonly showPassword = signal(false);
  readonly busy = signal(false);
  /** Message of the alert; `null` = no error. */
  readonly error = signal<string | null>(null);
  /** Only a rejected login marks the fields invalid, not a network or server failure. */
  readonly invalid = signal(false);

  canSubmit(): boolean {
    return !this.busy() && this.username().trim() !== '' && this.password() !== '';
  }

  edit(field: 'username' | 'password', value: string): void {
    (field === 'username' ? this.username : this.password).set(value);
    this.error.set(null);
    this.invalid.set(false);
  }

  submit(): void {
    if (!this.canSubmit()) return;
    const username = this.username().trim();
    this.busy.set(true);
    this.error.set(null);
    this.invalid.set(false);
    this.#auth
      .login({ Username: username, Password: this.password(), SystemId: this.#clientId })
      .subscribe({
        next: ({ result }) => {
          writeRemembered(this.remember() ? username : null);
          this.#session.signIn(
            result.userProfile.userType,
            result.sessionId,
            result.userProfile,
            result.isConsent,
          );
          // Come back to where the guard stopped the user; consent comes first when still pending.
          const returnUrl = safeReturnUrl(this.#route.snapshot.queryParamMap.get('returnUrl'));
          const target = result.isConsent
            ? (returnUrl ?? HOME_URL)
            : returnUrl
              ? `${CONSENT_URL}?returnUrl=${encodeURIComponent(returnUrl)}`
              : CONSENT_URL;
          void this.#router.navigateByUrl(target);
        },
        error: (err: unknown) => {
          const kind = err instanceof ApiException ? err.error.kind : 'unknown';
          this.busy.set(false);
          this.invalid.set(kind !== 'network' && kind !== 'server');
          this.error.set(
            kind === 'network'
              ? MESSAGE.network
              : kind === 'server'
                ? MESSAGE.server
                : MESSAGE.credentials,
          );
        },
      });
  }
}
