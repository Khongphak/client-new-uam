import { Injectable, signal } from '@angular/core';

import { UserProfile } from '../shared/interfaces';

/** Who is signed in as far as the HTTP layer cares, plus the "session expired" signal for the UI. */
@Injectable({ providedIn: 'root' })
export class Session {
  readonly #userType = signal<string | null>(null);
  readonly #ssoSession = signal<string | null>(null);
  readonly #expired = signal(false);
  readonly #profile = signal<UserProfile | null>(null);

  readonly userType = this.#userType.asReadonly();
  /** Profile returned by login; feeds the shell (`SHELL_PROFILE`). */
  readonly profile = this.#profile.asReadonly();
  readonly ssoSession = this.#ssoSession.asReadonly();
  /** `true` after the backend said the session is over; the HTTP layer then refuses requests until {@link signIn}. */
  readonly expired = this.#expired.asReadonly();

  signIn(userType: string, ssoSession: string, profile: UserProfile | null = null): void {
    this.#userType.set(userType);
    this.#profile.set(profile);
    this.#ssoSession.set(ssoSession);
    this.#expired.set(false);
  }

  markExpired(): void {
    this.#expired.set(true);
  }

  clear(): void {
    this.#userType.set(null);
    this.#profile.set(null);
    this.#ssoSession.set(null);
    this.#expired.set(false);
  }
}
