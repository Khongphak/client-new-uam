import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { EMPTY, finalize } from 'rxjs';

import { CLIENT_ID } from '../../core/api/api-config';
import { HOME_URL, safeReturnUrl } from '../../core/guards/auth-guard';
import { Session } from '../../core/session';
import { UDialog } from '../../shared/ui/dialog';
import { USkel } from '../../shared/ui/skeleton';
import { UState } from '../../shared/ui/state';
import { AuthApi } from '../api/auth-api';
import { ConsentApi } from '../api/consent-api';

const MESSAGE = {
  loadFailed: 'We couldn’t load the consent text. Try again, or contact IT Support.',
  acceptFailed: 'We couldn’t save your answer. Try again, or contact IT Support.',
} as const;

/** PDPA consent (artboard Consent / ConsentPhone, note n-consent). Payloads of Consent/accept and auth/logout are unchanged. */
@Component({
  selector: 'app-consent-page',
  imports: [FormsModule, ButtonModule, CheckboxModule, MessageModule, UDialog, UState, USkel],
  templateUrl: './consent-page.html',
  styleUrl: './consent-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentPage {
  readonly #consentApi = inject(ConsentApi);
  readonly #authApi = inject(AuthApi);
  readonly #session = inject(Session);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #clientId = inject(CLIENT_ID);

  protected readonly profile = this.#session.profile;
  protected readonly messages = MESSAGE;
  protected readonly agreed = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);
  protected readonly asking = signal(false);
  protected readonly leaving = signal(false);

  protected readonly consent = rxResource({
    params: () => this.profile()?.userName,
    stream: ({ params }) => (params ? this.#consentApi.getLatestVersion() : EMPTY),
  });

  protected readonly canAgree = computed(
    () => this.agreed() && this.consent.hasValue() && !this.saving() && !this.leaving(),
  );

  protected agree(): void {
    const profile = this.profile();
    const consent = this.consent.hasValue() ? this.consent.value() : null;
    if (!this.canAgree() || !profile || !consent) return;
    this.saving.set(true);
    this.saveFailed.set(false);
    this.#consentApi
      .accept({
        username: profile.userName,
        consentId: consent.id,
        acceptedFlag: 'Y',
        acceptedDate: new Date().toISOString(),
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.#session.markConsented();
          const returnUrl = safeReturnUrl(this.#route.snapshot.queryParamMap.get('returnUrl'));
          void this.#router.navigateByUrl(returnUrl ?? HOME_URL);
        },
        error: () => this.saveFailed.set(true),
      });
  }

  protected declineAndSignOut(): void {
    const profile = this.profile();
    if (!profile || this.leaving()) return;
    this.leaving.set(true);
    const done = () => {
      this.#session.clear();
      this.asking.set(false);
      void this.#router.navigateByUrl('/login');
    };
    // The session is cleared even if the server could not be told (the user chose to leave).
    this.#authApi
      .logout({ Username: profile.userName, ClientId: this.#clientId })
      .subscribe({ next: done, error: done });
  }
}
