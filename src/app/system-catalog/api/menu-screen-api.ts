import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttp } from '../../core/api/api-http';
import {
  AddMenuScreenRequest,
  MenuScreenBySystemItem,
  MenuScreenRecord,
  RoleMenuItem,
  UpdateMenuScreenRequest,
} from '../../shared/interfaces';

/** v1/Menus/*, v2/Menus/* (spec section 8). */
@Injectable({ providedIn: 'root' })
export class MenuScreenApi {
  readonly #api = inject(ApiHttp);

  getAll(): Observable<MenuScreenRecord[]> {
    return this.#api.get<MenuScreenRecord[]>('v1/Menus/get-all-menuScreens');
  }

  /** Used to build the screen-name filter of the Menu list. */
  getForFilter(): Observable<MenuScreenRecord[]> {
    return this.#api.get<MenuScreenRecord[]>('v1/Menus/get-menuScreens');
  }

  /** The answer is a single object. */
  getById(screenId: number): Observable<MenuScreenRecord> {
    return this.#api.get<MenuScreenRecord>('v1/Menus/get-menuScreen-byId', { screenId });
  }

  add(request: AddMenuScreenRequest): Observable<void> {
    return this.#api.save('POST', 'v1/Menus/add-menuScreen', request);
  }

  update(request: UpdateMenuScreenRequest): Observable<void> {
    return this.#api.save('PUT', 'v1/Menus/update-menuScreen', request);
  }

  /** "Menu list" box of the Role editor. `roleId` only when editing/viewing a role. */
  getBySystemId(systemId: string, roleId?: number): Observable<MenuScreenBySystemItem[]> {
    return this.#api.get<MenuScreenBySystemItem[]>('v2/Menus/get-menuScreens-bySystemId', {
      systemId,
      roleId,
    });
  }

  /** Menu tree of one role in one system (user permission preview). */
  getRoleScreensBySystemId(systemId: string, roleId: number): Observable<RoleMenuItem[]> {
    return this.#api.get<RoleMenuItem[]>('v1/Menus/get-menuRoleScreens-bySystemId', {
      systemId,
      roleId,
    });
  }
}
