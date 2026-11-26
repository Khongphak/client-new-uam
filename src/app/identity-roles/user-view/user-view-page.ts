import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { ButtonDirective } from 'primeng/button';
import { EMPTY, forkJoin, map } from 'rxjs';

import { UAccordion, UApprovers, UFacts, UPermRow } from '../../shared/detail';
import { UBack, UStatus } from '../../shared/ui';
import { UState } from '../../shared/ui/state';
import { UserApi } from '../api/user-api';
import { toUserView } from './user-view-model';

/** User details (View): profile, approvers (names only) and the user's systems with role permissions. Read-only. */
@Component({
  selector: 'app-user-view-page',
  imports: [
    Avatar,
    ButtonDirective,
    RouterLink,
    UAccordion,
    UApprovers,
    UBack,
    UFacts,
    UPermRow,
    UState,
    UStatus,
  ],
  templateUrl: './user-view-page.html',
  styleUrl: './user-view-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserViewPage {
  readonly #api = inject(UserApi);

  readonly #params = toSignal(inject(ActivatedRoute).paramMap, { requireSync: true });
  protected readonly id = computed(() => this.#params().get('id') ?? '');

  protected readonly userId = computed(() => {
    const n = Number(this.id());
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  protected readonly user = rxResource({
    params: () => this.userId(),
    stream: ({ params: id }) =>
      id === null
        ? EMPTY
        : forkJoin({ user: this.#api.getById(id), detail: this.#api.getRoleDetail(id) }).pipe(
            map(({ user, detail }) => toUserView(user, detail)),
          ),
  });

  protected readonly editLink = computed(() => ['/setting/users-setting/users', this.id(), 'edit']);
  protected readonly invalidId = computed(() => this.userId() === null);
}
