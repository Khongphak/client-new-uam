import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiHttp } from '../../core/api/api-http';
import {
  AddRoleRequest,
  RoleMenuItem,
  RoleRecord,
  UpdateRoleRequest,
} from '../../shared/interfaces';

/** v1/Roles/* (spec section 9). */
@Injectable({ providedIn: 'root' })
export class RoleApi {
  readonly #api = inject(ApiHttp);

  getAll(): Observable<RoleRecord[]> {
    return this.#api.get<RoleRecord[]>('v1/Roles/get-all-roles');
  }

  /** The answer is an array (normally one element). */
  getById(roleId: number): Observable<RoleRecord[]> {
    return this.#api.get<RoleRecord[]>('v1/Roles/get-role', { roleId });
  }

  /** `data` may be null when the role has no menus → empty list. */
  getRoleMenus(roleId: number): Observable<RoleMenuItem[]> {
    return this.#api
      .get<RoleMenuItem[] | null>('v1/Roles/get-roleMenu-byRoleId', { roleId })
      .pipe(map((items) => items ?? []));
  }

  add(request: AddRoleRequest): Observable<void> {
    return this.#api.save('POST', 'v1/Roles/add-role', request);
  }

  update(request: UpdateRoleRequest): Observable<void> {
    return this.#api.save('PUT', 'v1/Roles/update-role', request);
  }
}
