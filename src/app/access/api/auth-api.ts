import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttp } from '../../core/api/api-http';
import {
  LoginData,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
} from '../../shared/interfaces';

/** v1/auth/* (spec section 2). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  readonly #api = inject(ApiHttp);

  login(request: LoginRequest): Observable<LoginData> {
    return this.#api.send<LoginData>('POST', 'v1/auth/login', request);
  }

  /** Token lives in a cookie; the answer body is not used, success is enough. */
  refreshToken(request: RefreshTokenRequest): Observable<void> {
    return this.#api.save('POST', 'v1/auth/refresh-token', request);
  }

  logout(request: LogoutRequest): Observable<void> {
    return this.#api.save('POST', 'v1/auth/logout', request);
  }
}
