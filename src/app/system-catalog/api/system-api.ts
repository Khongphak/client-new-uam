import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttp } from '../../core/api/api-http';
import {
  AddSystemRequest,
  AddSystemToSystemRequest,
  SystemRecord,
  SystemToSystemListItem,
  SystemToSystemRecord,
  UpdateSystemRequest,
  UpdateSystemToSystemRequest,
} from '../../shared/interfaces';

/** v1/Systems/* (spec section 6) and v1/SystemToSystem/* (section 7). */
@Injectable({ providedIn: 'root' })
export class SystemApi {
  readonly #api = inject(ApiHttp);

  getAll(): Observable<SystemRecord[]> {
    return this.#api.get<SystemRecord[]>('v1/Systems/get-all-systems');
  }

  /** The answer is an array (normally one element). */
  getById(systemId: string): Observable<SystemRecord[]> {
    return this.#api.get<SystemRecord[]>('v1/Systems/get-systems', { systemId });
  }

  add(request: AddSystemRequest): Observable<void> {
    return this.#api.save('POST', 'v1/Systems/add-system', request);
  }

  update(request: UpdateSystemRequest): Observable<void> {
    return this.#api.save('PUT', 'v1/Systems/update-system', request);
  }

  getAllSystemToSystem(): Observable<SystemToSystemListItem[]> {
    return this.#api.get<SystemToSystemListItem[]>('v1/SystemToSystem/get-all-system-to-system');
  }

  /** The answer is a single object. */
  getSystemToSystemById(id: number): Observable<SystemToSystemRecord> {
    return this.#api.get<SystemToSystemRecord>('v1/SystemToSystem/get-system-to-system-by-id', {
      id,
    });
  }

  addSystemToSystem(request: AddSystemToSystemRequest): Observable<void> {
    return this.#api.save('POST', 'v1/SystemToSystem/add-system-to-system', request);
  }

  updateSystemToSystem(request: UpdateSystemToSystemRequest): Observable<void> {
    return this.#api.save('PUT', 'v1/SystemToSystem/update-system-to-system', request);
  }
}
