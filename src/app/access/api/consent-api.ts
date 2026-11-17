import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttp } from '../../core/api/api-http';
import { Consent, ConsentAcceptRequest } from '../../shared/interfaces';

/** v1/Consent/* (spec section 3). */
@Injectable({ providedIn: 'root' })
export class ConsentApi {
  readonly #api = inject(ApiHttp);

  getLatestVersion(): Observable<Consent> {
    return this.#api.get<Consent>('v1/Consent/get-consent-last-version');
  }

  accept(request: ConsentAcceptRequest): Observable<void> {
    return this.#api.save('POST', 'v1/Consent/add-user-consent-accept', request);
  }
}
