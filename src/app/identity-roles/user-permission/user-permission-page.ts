import { ChangeDetectionStrategy, Component, computed, inject, Resource } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { forkJoin, map } from 'rxjs';

import { UCount } from '../../shared/ui';
import { UState } from '../../shared/ui/state';
import { RoleApi } from '../api/role-api';
import { UserApi } from '../api/user-api';
import { toRoleRow, toUserRow } from './list-rows';
import { RolesTable } from './roles-table';
import { UsersTable } from './users-table';

export type UserPermissionTab = 'roles' | 'users';

/**
 * User & Permission: Roles tab first, then Users. The tab lives in the URL fragment
 * (`#roles` / `#users`) so a refresh or a shared link opens the same tab; no fragment means Roles.
 */
@Component({
  selector: 'app-user-permission-page',
  imports: [ButtonDirective, RolesTable, RouterLink, UCount, UsersTable, UState],
  templateUrl: './user-permission-page.html',
  styleUrl: './user-permission-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPermissionPage {
  readonly #roleApi = inject(RoleApi);
  readonly #userApi = inject(UserApi);

  readonly #fragment = toSignal(inject(ActivatedRoute).fragment, { initialValue: null });
  protected readonly tab = computed<UserPermissionTab>(() =>
    this.#fragment() === 'users' ? 'users' : 'roles',
  );

  protected readonly roles = rxResource({
    stream: () => this.#roleApi.getAll().pipe(map((list) => list.map(toRoleRow))),
  });

  protected readonly users = rxResource({
    stream: () =>
      forkJoin({ users: this.#userApi.getAll(), uamRoles: this.#userApi.getUamRoles() }).pipe(
        map(({ users, uamRoles }) => users.map((user) => toUserRow(user, uamRoles))),
      ),
  });

  /** What the active tab's list is doing, without the template caring which resource backs it. */
  protected readonly state = computed(() => {
    const list: Resource<readonly unknown[] | undefined> =
      this.tab() === 'users' ? this.users : this.roles;
    // `value()` throws while the resource is in error, so it is read only when there is a value.
    const count = list.hasValue() ? list.value().length : undefined;
    return {
      what: this.tab(),
      loading: list.isLoading() && count === undefined,
      failed: !!list.error(),
      empty: count === 0,
    };
  });

  protected reload(): void {
    (this.tab() === 'users' ? this.users : this.roles).reload();
  }
}
