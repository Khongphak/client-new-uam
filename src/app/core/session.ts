import { Injectable, signal } from '@angular/core';

/** Who is signed in as far as the HTTP layer cares, plus the "session expired" signal for the UI. */
@Injectable({ providedIn: 'root' })
export class Session {
  readonly #userType = signal<string | null>(null);
  readonly #ssoSession = signal<string | null>(null);
  readonly #expired = signal(false);

  readonly userType = this.#userType.asReadonly();
  readonly ssoSession = this.#ssoSession.asReadonly();
  /** `true` after the backend said the session is over; the HTTP layer then refuses requests until {@link signIn}. */
  readonly expired = this.#expired.asReadonly();

  signIn(userType: string, ssoSession: string): void {
    this.#userType.set(userType);
    this.#ssoSession.set(ssoSession);
    this.#expired.set(false);
  }

  markExpired(): void {
    this.#expired.set(true);
  }

  clear(): void {
    this.#userType.set(null);
    this.#ssoSession.set(null);
    this.#expired.set(false);
  }
}
