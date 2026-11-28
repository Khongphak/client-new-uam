import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Steps } from 'primeng/steps';
import { map } from 'rxjs';

import { UBack } from '../../shared/ui';
import { USwitchRow } from '../../shared/ui/switch-row';
import { SystemApi } from '../../system-catalog/api/system-api';
import { MenuStructureStep } from './menu-structure-step';
import { ROLE_DESCRIPTION_MAX, ROLE_STEPS, RoleEditorStore } from './role-editor-store';

/**
 * Add role: 3 steps (Role info, Menus & groups, Permissions) — progress bar on a phone.
 * This page owns the frame and the Role info step; Menus & groups is its own component (UAM-ROL-02); Permissions arrives with UAM-ROL-03.
 */
@Component({
  selector: 'app-role-editor-page',
  imports: [ButtonDirective, MenuStructureStep, RouterLink, Steps, UBack, USwitchRow],
  providers: [RoleEditorStore],
  templateUrl: './role-editor-page.html',
  styleUrl: './role-editor-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleEditorPage {
  protected readonly store = inject(RoleEditorStore);
  protected readonly descriptionMax = ROLE_DESCRIPTION_MAX;

  readonly #systemApi = inject(SystemApi);
  protected readonly systems = rxResource({
    stream: () =>
      this.#systemApi
        .getAll()
        .pipe(map((list) => list.map((s) => ({ id: s.systemId, name: s.systemName.trim() })))),
  });

  protected readonly items = ROLE_STEPS.map((label) => ({ label }));
  protected readonly stepLabel = computed(() => ROLE_STEPS[this.store.step()]);
  protected readonly stepCount = ROLE_STEPS.length;
  protected readonly progress = computed(() => `${((this.store.step() + 1) / ROLE_STEPS.length) * 100}%`);
  protected readonly isFirst = computed(() => this.store.step() === 0);
  protected readonly isLast = computed(() => this.store.step() === ROLE_STEPS.length - 1);
  protected readonly nextLabel = computed(() => ROLE_STEPS[Math.min(this.store.step() + 1, ROLE_STEPS.length - 1)]);

  protected readonly systemName = computed(
    () => this.systems.value()?.find((s) => s.id === this.store.info().systemId)?.name ?? '',
  );

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
