import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttp } from '../../core/api/api-http';
import { AccessHistoryRequest, UserSystemItem } from '../../shared/interfaces';

/** v1/Home/*, v1/UserAccesses/* (spec section 5). */
@Injectable({ providedIn: 'root' })
export class HomeApi {
  readonly #api = inject(ApiHttp);

  getUserSystems(userName: string): Observable<UserSystemItem[]> {
    return this.#api.get<UserSystemItem[]>('v1/Home/get-userSystems', { userName });
  }

  /** Fire-and-forget on card click; the caller must not block opening the system on this. */
  addAccessHistory(request: AccessHistoryRequest): Observable<void> {
    return this.#api.save('POST', 'v1/UserAccesses/add-useraccess-history', request);
  }
}
