import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { forkJoin, map } from 'rxjs';

import { toUpdateUserRequest } from '../api/user-mapper';
import { fromRoleMenuItems, MenuTreeNode } from '../api/role-menu-tree';
import { RoleApi } from '../api/role-api';
import { UserApi } from '../api/user-api';
import { ApiException } from '../../core/api/api-error';
import { AdUserItem } from '../../shared/interfaces';
import { UApprovers } from '../../shared/detail';
import { UBack, USwitchRow } from '../../shared/ui';
import { UState } from '../../shared/ui/state';
import { UToastService } from '../../shared/ui/toast';
import {
  countChanges,
  EditorRow,
  EditorState,
  fromUserRecord,
  errorSummary,
  isProfileComplete,
  rowErrors,
  validationItems,
  menuRows,
  previewRows,
  toFormValue,
} from './user-editor-model';
import { USER_EDITOR_MESSAGES } from './user-editor-messages';

export type EditorTab = 'profile' | 'systems' | 'preview';
type AdLookup = 'idle' | 'busy' | 'found' | 'not-found' | 'incomplete' | 'failed';

/**
 * Edit user in three tabs (Profile & access / Systems & roles / Permission preview). Profile fields come from
 * Active Directory and are read-only; only the username is typed. "Save changes" is enabled while the state differs
 * from what was loaded, and the bar says how many changes are unsaved. Row errors (missing system/role, repeated
 * system) and 422 messages show in a list above the tabs; Save stays closed while any remains.
 */
@Component({
  selector: 'app-user-editor-page',
  imports: [ButtonDirective, InputText, RouterLink, TableModule, UApprovers, UBack, UState, USwitchRow],
  templateUrl: './user-editor-page.html',
  styleUrl: './user-editor-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditorPage {
  readonly #userApi = inject(UserApi);
  readonly #roleApi = inject(RoleApi);
  readonly #router = inject(Router);
  readonly #toast = inject(UToastService);
  readonly #userId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: NaN },
  );

  protected readonly data = rxResource({
    params: () => ({ id: this.#userId() }),
    stream: ({ params }) =>
      forkJoin({
        user: this.#userApi.getById(params.id),
        uamRoles: this.#userApi.getUamRoles(),
        roles: this.#roleApi.getAll(),
      }).pipe(map((d) => ({ ...d, base: fromUserRecord(d.user) }))),
  });

  readonly #edited = signal<EditorState | null>(null);
  #nextKey = 1000;

  protected readonly tab = signal<EditorTab>('profile');
  protected readonly tabs: readonly { id: EditorTab; label: string }[] = [
    { id: 'profile', label: 'Profile & access' },
    { id: 'systems', label: 'Systems & roles' },
    { id: 'preview', label: 'Permission preview' },
  ];
  protected readonly adState = signal<AdLookup>('idle');
  protected readonly saving = signal(false);
  protected readonly text = USER_EDITOR_MESSAGES;
  /** Messages of the last 422; cleared by the next edit. */
  protected readonly serverErrors = signal<readonly string[]>([]);
  protected readonly openRows = signal<ReadonlySet<number>>(new Set());
  readonly #menus = signal<Readonly<Record<number, readonly MenuTreeNode[]>>>({});
  protected readonly menusFailed = signal(false);

  protected readonly base = computed(() => (this.data.hasValue() ? this.data.value().base : null));
  /** The state on screen: the edited copy, or what was loaded until the first edit. */
  protected readonly state = computed(() => this.#edited() ?? this.base());
  protected readonly roles = computed(() => (this.data.hasValue() ? this.data.value().roles : []));
  protected readonly uamRoles = computed(() =>
    this.data.hasValue() ? this.data.value().uamRoles.filter((r) => r.status === 'Active') : [],
  );
  protected readonly systems = computed(() => {
    const seen = new Map<string, string>();
    for (const r of this.roles()) if (!seen.has(r.systemId)) seen.set(r.systemId, r.systemName);
    return [...seen].map(([id, name]) => ({ id, name }));
  });

  protected readonly changes = computed(() => {
    const base = this.base();
    const cur = this.state();
    return base && cur ? countChanges(base, cur) : 0;
  });
  protected readonly rowErrs = computed(() => rowErrors(this.state()?.rows ?? []));
  protected readonly summary = computed(() => {
    const rows = this.rowErrs().size > 0 ? errorSummary(this.state()?.rows ?? [], this.rowErrs()) : null;
    if (rows) return rows;
    const items = this.serverErrors();
    return items.length > 0 ? { title: USER_EDITOR_MESSAGES.invalidTitle, items } : null;
  });
  protected readonly profileComplete = computed(() => {
    const s = this.state();
    return s ? isProfileComplete(s.profile) : false;
  });
  protected readonly canSave = computed(
    () =>
      this.changes() > 0 &&
      this.rowErrs().size === 0 &&
      this.profileComplete() &&
      !this.saving() &&
      this.adState() !== 'busy',
  );
  protected readonly barText = computed(() => {
    if (this.rowErrs().size > 0) return 'Complete or remove every system row to save.';
    const n = this.changes();
    return n === 0 ? 'No changes yet' : `${n} unsaved change${n > 1 ? 's' : ''}`;
  });
  protected readonly headName = computed(() => this.state()?.profile.fullName || this.state()?.profile.username || '');
  protected readonly headInitials = computed(() =>
    this.headName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join(''),
  );
  protected readonly preview = computed(() => {
    const s = this.state();
    return s ? previewRows(s.rows, this.roles(), this.#menus()) : [];
  });

  protected rolesOf(systemId: string | null) {
    return this.roles().filter((r) => r.systemId === systemId && r.status === 'Active');
  }

  protected menusOf(row: EditorRow) {
    const tree = row.roleId === null ? undefined : this.#menus()[row.roleId];
    return tree ? menuRows(tree) : null;
  }

  protected selectTab(tab: EditorTab): void {
    this.tab.set(tab);
    if (tab === 'preview') this.state()?.rows.forEach((r) => this.#loadMenus(r.roleId));
  }

  protected setUamRole(uamRoleId: number): void {
    this.#update((s) => ({ ...s, uamRoleId }));
  }

  protected setSuperAdmin(isSuperAdmin: boolean): void {
    this.#update((s) => ({ ...s, isSuperAdmin }));
  }

  protected setActive(active: boolean): void {
    this.#update((s) => ({ ...s, active }));
  }

  protected setUsername(username: string): void {
    this.#update((s) => ({ ...s, profile: { ...s.profile, username } }));
    this.adState.set('idle');
  }

  /** Looks the username up in AD and fills the read-only fields from the first hit. */
  protected lookUp(): void {
    const username = this.state()?.profile.username.trim();
    if (!username) return;
    this.adState.set('busy');
    this.#userApi.searchActiveDirectory(username).subscribe({
      next: (hits) => {
        const hit = hits[0];
        // MSG_INVALID_USER_AD: nothing usable from AD, so the filled fields are cleared (only the username stays).
        const profile = hit ? this.#fromAd(hit) : this.#cleared();
        if (!hit || !isProfileComplete(profile)) {
          this.#update((s) => ({ ...s, profile: this.#cleared() }));
          return this.adState.set(hit ? 'incomplete' : 'not-found');
        }
        this.#update((s) => ({ ...s, profile }));
        this.adState.set('found');
      },
      error: () => this.adState.set('failed'),
    });
  }

  protected addRow(): void {
    this.#update((s) => ({
      ...s,
      rows: [...s.rows, { key: this.#nextKey++, userSystemId: null, systemId: null, roleId: null }],
    }));
  }

  protected removeRow(key: number): void {
    this.#update((s) => ({ ...s, rows: s.rows.filter((r) => r.key !== key) }));
  }

  protected setSystem(key: number, systemId: string): void {
    this.#patchRow(key, { systemId: systemId || null, roleId: null });
  }

  protected setRole(key: number, value: string): void {
    const roleId = value ? Number(value) : null;
    this.#patchRow(key, { roleId });
    this.#loadMenus(roleId);
  }

  protected toggleRow(row: EditorRow): void {
    const open = new Set(this.openRows());
    if (open.has(row.key)) open.delete(row.key);
    else {
      open.add(row.key);
      this.#loadMenus(row.roleId);
    }
    this.openRows.set(open);
  }

  protected save(): void {
    const state = this.state();
    const userId = this.#userId();
    if (!state || !this.canSave()) return;
    const { value, unresolved } = toFormValue(state, this.roles());
    if (unresolved.length > 0) {
      this.#toast.error('Can’t save yet', 'A selected role is no longer available. Pick another role.');
      return;
    }
    this.saving.set(true);
    this.#userApi.update(userId, toUpdateUserRequest(value, state.active)).subscribe({
      next: () => {
        this.#toast.success('Changes saved');
        void this.#router.navigate(['/setting/users-setting'], { fragment: 'users' });
      },
      error: (e: unknown) => {
        this.saving.set(false);
        if (e instanceof ApiException && e.error.kind === 'validation') {
          this.serverErrors.set(validationItems(e.error.fields));
          return;
        }
        const detail = e instanceof ApiException && e.error.kind === 'network'
          ? 'The server didn’t answer. Try again.'
          : 'Please try again. If it keeps happening, contact IT Support.';
        this.#toast.error('We couldn’t save the changes', detail);
      },
    });
  }

  reload(): void {
    this.data.reload();
  }

  #fromAd(hit: AdUserItem): EditorState['profile'] {
    const cur = this.state()!.profile;
    return {
      username: cur.username,
      firstname: hit.firstName,
      lastname: hit.lastName,
      fullName: hit.fullName,
      email: hit.email,
      department: hit.department,
      position: hit.position,
      phoneNo: hit.phoneNo,
      managers: (hit.managers ?? []).slice(0, 3).map((m) => m.name),
    };
  }

  #cleared(): EditorState['profile'] {
    return {
      username: this.state()!.profile.username,
      firstname: '',
      lastname: '',
      fullName: '',
      email: '',
      department: '',
      position: '',
      phoneNo: null,
      managers: [],
    };
  }

  #update(fn: (s: EditorState) => EditorState): void {
    const cur = this.state();
    this.serverErrors.set([]);
    if (cur) this.#edited.set(fn(cur));
  }

  #patchRow(key: number, patch: Partial<EditorRow>): void {
    this.#update((s) => ({ ...s, rows: s.rows.map((r) => (r.key === key ? { ...r, ...patch } : r)) }));
  }

  #loadMenus(roleId: number | null): void {
    if (roleId === null || this.#menus()[roleId]) return;
    this.#roleApi.getRoleMenus(roleId).subscribe({
      next: (items) => this.#menus.update((m) => ({ ...m, [roleId]: fromRoleMenuItems(items) })),
      error: () => this.menusFailed.set(true),
    });
  }
}
