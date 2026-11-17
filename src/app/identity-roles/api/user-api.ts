import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttp } from '../../core/api/api-http';
import {
  AddUserRequest,
  AdSearchRequest,
  AdUserItem,
  UamRoleItem,
  UpdateUserRequest,
  UserListItem,
  UserRecord,
  UserRoleDetail,
} from '../../shared/interfaces';

/** v1/Users/*, v1/UAM/* (spec section 10). */
@Injectable({ providedIn: 'root' })
export class UserApi {
  readonly #api = inject(ApiHttp);

  getAll(): Observable<UserListItem[]> {
    return this.#api.get<UserListItem[]>('v1/Users/get-all-users');
  }

  /** The answer is a single object. */
  getById(userId: number): Observable<UserRecord> {
    return this.#api.get<UserRecord>('v1/Users/get-user-byId', { userId });
  }

  /** Per-system menu permissions of the user, for the preview. */
  getRoleDetail(userId: number): Observable<UserRoleDetail> {
    return this.#api.get<UserRoleDetail>('v1/Users/get-userRole-byId', { userId });
  }

  /** Searches Active Directory; the form only uses the first hit. */
  searchActiveDirectory(userName: string): Observable<AdUserItem[]> {
    const body: AdSearchRequest = { userName, email: null, position: null, department: null };
    return this.#api.send<AdUserItem[]>('POST', 'v1/Users/search-users-activeDirectory', body);
  }

  getUamRoles(): Observable<UamRoleItem[]> {
    return this.#api.get<UamRoleItem[]>('v1/UAM/get-all-uam-roles');
  }

  add(request: AddUserRequest): Observable<void> {
    return this.#api.save('POST', 'v1/Users/add-user', request);
  }

  update(userId: number, request: UpdateUserRequest): Observable<void> {
    return this.#api.save('PUT', `v1/Users/update-user/${userId}`, request);
  }
}
