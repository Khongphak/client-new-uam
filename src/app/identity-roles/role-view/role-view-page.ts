import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { forkJoin, map } from 'rxjs';

import {
  type FactItem,
  UFacts,
  UGroupHead,
  UMetaIco,
  UPermRow,
  UStats,
  type StatItem,
} from '../../shared/detail';
import { RoleRecord } from '../../shared/interfaces';
import { UBack, UStatus } from '../../shared/ui';
import { UState } from '../../shared/ui/state';
import { RoleApi } from '../api/role-api';
import { formatUpdated } from '../user-permission/list-rows';
import { buildRoleMenuView } from './role-view-model';

const BACK_LINK = '/setting/users-setting';

/** Role details (read-only): role information, size stats and the menu/permission tree. */
@Component({
  selector: 'app-role-view-page',
  imports: [ButtonDirective, UBack, UFacts, UGroupHead, UMetaIco, UPermRow, UState, UStats, UStatus],
  templateUrl: './role-view-page.html',
  styleUrl: './role-view-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleViewPage {
  readonly #roleApi = inject(RoleApi);
  readonly #params = toSignal(inject(ActivatedRoute).paramMap);

  protected readonly backLink = BACK_LINK;

  protected readonly roleId = computed(() => {
    const id = Number(this.#params()?.get('id'));
    return Number.isInteger(id) && id > 0 ? id : undefined;
  });

  protected readonly data = rxResource({
    params: () => this.roleId(),
    stream: ({ params: id }) =>
      forkJoin({
        roles: this.#roleApi.getById(id),
        menus: this.#roleApi.getRoleMenus(id),
      }).pipe(
        map(({ roles, menus }) => {
          const role: RoleRecord | undefined = roles[0];
          return role ? { role, menu: buildRoleMenuView(menus) } : null;
        }),
      ),
  });

  /** No usable id, or the server has no such role. */
  protected readonly notFound = computed(
    () => this.roleId() === undefined || (this.data.hasValue() && this.data.value() === null),
  );
  protected readonly failed = computed(() => !!this.data.error());
  protected readonly loaded = computed(() => (this.data.hasValue() ? this.data.value() : null));

  protected readonly stats = computed<StatItem[]>(() => {
    const s = this.loaded()?.menu.stats;
    return s
      ? [
          { value: s.menus, label: 'Menus' },
          { value: s.groups, label: 'Groups' },
          { value: s.topLevel, label: 'Top level' },
        ]
      : [];
  });

  protected readonly facts = computed<FactItem[]>(() => {
    const role = this.loaded()?.role;
    if (!role) return [];
    const date = formatUpdated(role.updatedDate);
    return [
      { icon: 'pi-server', label: 'System', value: role.systemName },
      { icon: 'pi-id-card', label: 'Role name', value: role.roleName },
      { icon: 'pi-align-left', label: 'Description', value: role.description },
      {
        icon: 'pi-clock',
        label: 'Updated',
        value: date && role.updatedBy ? `${date} by ${role.updatedBy}` : date,
      },
    ];
  });

  protected readonly summary = computed(() => {
    const m = this.loaded()?.menu;
    if (!m) return '';
    const inGroups = m.stats.menus - m.stats.topLevel;
    return `${m.stats.topLevel} top-level menus · ${m.stats.groups} groups · ${inGroups} menus in groups. Crossed-out functions exist on the menu but this role doesn’t get them.`;
  });

  protected reload(): void {
    this.data.reload();
  }
}
