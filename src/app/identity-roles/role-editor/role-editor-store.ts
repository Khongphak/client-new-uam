import { computed, Injectable, signal } from '@angular/core';

import { emptyStructure, MenuStructure } from './menu-structure';

export const ROLE_STEPS = ['Role info', 'Menus & groups', 'Permissions'] as const;
/** The Role info textarea allows 250 characters (artboard RoleEditor). */
export const ROLE_DESCRIPTION_MAX = 250;

export interface RoleInfo {
  readonly systemId: string;
  readonly roleName: string;
  readonly description: string;
  readonly active: boolean;
}

export type RoleInfoErrors = Partial<Record<'systemId' | 'roleName' | 'description', string>>;

export function validateRoleInfo(info: RoleInfo): RoleInfoErrors {
  const errors: { -readonly [K in keyof RoleInfoErrors]: string } = {};
  if (!info.systemId) errors.systemId = 'Select a system.';
  if (!info.roleName.trim()) errors.roleName = 'Enter a role name.';
  if (info.description.length > ROLE_DESCRIPTION_MAX) {
    errors.description = `Description can be at most ${ROLE_DESCRIPTION_MAX} characters.`;
  }
  return errors;
}

/** State of the role editor: current step and the Role info form. Provided by the editor page, so it dies with it. */
@Injectable()
export class RoleEditorStore {
  readonly step = signal(0);
  readonly info = signal<RoleInfo>({ systemId: '', roleName: '', description: '', active: true });

  /** The single menu structure of step 2. Menus belong to the chosen system, so it restarts when the system changes. */
  readonly structure = signal<MenuStructure>(emptyStructure());

  /** Errors stay hidden until the user first tries to move on. */
  readonly #attempted = signal(false);
  readonly errors = computed(() => validateRoleInfo(this.info()));
  readonly shownErrors = computed<RoleInfoErrors>(() => (this.#attempted() ? this.errors() : {}));

  patchInfo(patch: Partial<RoleInfo>): void {
    if (patch.systemId !== undefined && patch.systemId !== this.info().systemId) {
      this.structure.set(emptyStructure());
    }
    this.info.update((info) => ({ ...info, ...patch }));
  }

  /** Apply one pure edit from `menu-structure`. */
  editStructure(edit: (s: MenuStructure) => MenuStructure): void {
    this.structure.update(edit);
  }

  /** Next step; false (and errors shown) when Role info is not valid yet, or already on the last step. */
  next(): boolean {
    if (this.step() >= ROLE_STEPS.length - 1) return false;
    if (!this.#passInfo()) return false;
    this.step.update((n) => n + 1);
    return true;
  }

  back(): void {
    this.step.update((n) => Math.max(0, n - 1));
  }

  /** Jump to a step: backwards is free, forwards needs a valid Role info. */
  goTo(index: number): void {
    const target = Math.min(Math.max(index, 0), ROLE_STEPS.length - 1);
    if (target > 0 && target > this.step() && !this.#passInfo()) return;
    this.step.set(target);
  }

  #passInfo(): boolean {
    this.#attempted.set(true);
    return Object.keys(this.errors()).length === 0;
  }
}
