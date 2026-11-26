import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, Observable } from 'rxjs';

import { CLIENT_ID } from '../core/api/api-config';
import { Session } from '../core/session';
import { AuthApi } from './api/auth-api';

/**
 * The one way to leave the app (Logout in the shell, Decline on the consent page — UAM-AUT-04).
 * Tells the backend (`v1/auth/logout`, payload unchanged), then ALWAYS clears the local session
 * (memory + sessionStorage) and goes to `/login`, even when the call fails or the session has expired.
 */
@Injectable({ providedIn: 'root' })
export class SignOut {
  readonly #authApi = inject(AuthApi);
  readonly #session = inject(Session);
  readonly #router = inject(Router);
  readonly #clientId = inject(CLIENT_ID);

  /** Completes without error once the local session is gone. */
  run(): Observable<void> {
    const profile = this.#session.profile();
    const finish = () => {
      this.#session.clear();
      void this.#router.navigateByUrl('/login');
    };
    if (!profile) {
      return new Observable<void>((s) => {
        finish();
        s.complete();
      });
    }
    return this.#authApi.logout({ Username: profile.userName, ClientId: this.#clientId }).pipe(
      catchError(() => EMPTY),
      finalize(finish),
    );
  }
}
