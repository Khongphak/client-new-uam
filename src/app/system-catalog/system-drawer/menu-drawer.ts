import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { ApiException } from '../../core/api/api-error';
import { FactItem, UFacts } from '../../shared/detail/facts';
import { MenuScreenRecord } from '../../shared/interfaces';
import { parseListString } from '../../shared/list-string';
import { UDrawer } from '../../shared/ui/drawer';
import { UState } from '../../shared/ui/state';
import { UStatus } from '../../shared/ui/status';
import { USwitchRow } from '../../shared/ui/switch-row';
import { MasterDataApi } from '../api/master-data-api';
import { MenuScreenApi } from '../api/menu-screen-api';
import { toAddMenuScreenRequest, toUpdateMenuScreenRequest } from '../api/menu-screen-mapper';
import { SystemApi } from '../api/system-api';
import { formatUpdated } from '../system-setting-page/system-setting-rows';
import {
  draftFromMenuRecord,
  draftToMenuFormValue,
  EMPTY_MENU_DRAFT,
  MAX_MENU_DESCRIPTION,
  MenuDraft,
  validateMenuDraft,
} from './menu-form';
import type { SystemDrawerMode } from './system-drawer';

/** What the page needs after a successful save. */
export interface MenuSaved {
  readonly mode: 'edit' | 'add';
  readonly screenName: string;
}

const TITLES: Record<SystemDrawerMode, (name: string) => string> = {
  view: (name) => name || 'Menu',
  edit: (name) => (name ? `Edit ${name}` : 'Edit menu'),
  add: () => 'Add menu',
};

/** Menu drawer: view / edit / add, same shell and URL pattern as the System drawer (UAM-SYS-03). */
@Component({
  selector: 'app-menu-drawer',
  imports: [UDrawer, UFacts, UState, UStatus, USwitchRow],
  templateUrl: './menu-drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDrawer {
  readonly #menus = inject(MenuScreenApi);
  readonly #systems = inject(SystemApi);
  readonly #master = inject(MasterDataApi);

  readonly mode = input.required<SystemDrawerMode>();
  /** `id` of the menu to view/edit; null when adding. */
  readonly menuId = input<number | null>(null);

  readonly closed = output<void>();
  readonly saved = output<MenuSaved>();
  readonly editRequested = output<void>();

  protected readonly maxDescription = MAX_MENU_DESCRIPTION;

  readonly #record = rxResource({
    params: () => (this.mode() === 'add' ? undefined : this.menuId()),
    stream: ({ params }) => this.#menus.getById(params!),
  });
  readonly #systemList = rxResource({
    params: () => (this.mode() === 'view' ? undefined : true),
    stream: () => this.#systems.getAll(),
  });
  readonly #functions = rxResource({
    params: () => (this.mode() === 'view' ? undefined : true),
    stream: () => this.#master.getGeneralData('function'),
  });
  readonly #icons = rxResource({
    params: () => (this.mode() === 'view' ? undefined : true),
    stream: () => this.#master.getIcons(),
  });

  protected readonly record = computed<MenuScreenRecord | null>(
    () => (this.#record.hasValue() ? this.#record.value() : undefined) ?? null,
  );
  protected readonly loading = computed(() => this.#record.isLoading());
  protected readonly loadFailed = computed(() => this.#record.error() !== undefined);
  protected readonly notFound = computed(
    () => this.mode() !== 'add' && this.#record.status() === 'resolved' && this.record() === null,
  );
  protected readonly showForm = computed(
    () => this.mode() === 'add' || (this.record() !== null && !this.loading()),
  );

  readonly #masterFunctions = computed(() =>
    (this.#functions.hasValue() ? this.#functions.value() : []).map((f) => f.value),
  );

  protected readonly draft = linkedSignal<MenuDraft>(() => {
    const record = this.mode() === 'add' ? null : this.record();
    return record ? draftFromMenuRecord(record, this.#masterFunctions()) : EMPTY_MENU_DRAFT;
  });
  protected readonly active = linkedSignal(
    () => this.mode() === 'add' || (this.record()?.status ?? '').toLowerCase() === 'active',
  );
  protected readonly tried = signal(false);
  protected readonly saving = signal(false);
  protected readonly banner = signal<string | null>(null);
  readonly #serverErrors = signal<Partial<Record<keyof MenuDraft, string>>>({});

  protected readonly errors = computed(() =>
    this.tried() ? { ...validateMenuDraft(this.draft()), ...this.#serverErrors() } : {},
  );

  protected readonly heading = computed(() => TITLES[this.mode()](this.record()?.screenName ?? ''));

  protected readonly systemOptions = computed(() => {
    const list = (this.#systemList.hasValue() ? this.#systemList.value() : []).map((s) => ({
      id: s.systemId,
      name: s.systemName,
    }));
    const current = this.record();
    return current && !list.some((s) => s.id === current.systemId)
      ? [{ id: current.systemId, name: current.systemName }, ...list]
      : list;
  });
  /** Master functions, plus any the record has that the master list lacks (kept so an edit does not drop them). */
  protected readonly functionOptions = computed(() => {
    const master = this.#masterFunctions();
    const extra = this.draft().functional.filter((f) => !master.includes(f));
    return [...master, ...extra];
  });
  protected readonly iconOptions = computed(() =>
    (this.#icons.hasValue() ? this.#icons.value() : [])
      .filter((i) => i.category === 'Menu')
      .map((i) => ({ id: i.id, name: i.name, src: `data:image/svg+xml;base64,${i.data}` })),
  );

  protected readonly facts = computed<FactItem[]>(() => {
    const r = this.record();
    if (!r) return [];
    const by = r.updatedBy ? ` by ${r.updatedBy}` : '';
    return [
      { icon: 'pi-hashtag', label: 'Menu ID', value: String(r.id) },
      { icon: 'pi-server', label: 'System', value: r.systemName },
      { icon: 'pi-link', label: 'Menu URL', value: r.url },
      { icon: 'pi-align-left', label: 'Description', value: r.description },
      { icon: 'pi-sliders-h', label: 'Functions', value: parseListString(r.functional).join(', ') },
      { icon: 'pi-clock', label: 'Updated', value: `${formatUpdated(r.updatedDate)}${by}` },
    ];
  });

  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  protected set<K extends keyof MenuDraft>(key: K, value: MenuDraft[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
    this.#serverErrors.update(({ [key]: _gone, ...rest }) => rest);
  }

  protected has(fn: string): boolean {
    return this.draft().functional.includes(fn);
  }

  protected toggle(fn: string): void {
    const current = this.draft().functional;
    this.set('functional', current.includes(fn) ? current.filter((f) => f !== fn) : [...current, fn]);
  }

  protected retry(): void {
    this.#record.reload();
  }

  protected save(): void {
    this.tried.set(true);
    this.banner.set(null);
    const errors = validateMenuDraft(this.draft());
    if (Object.keys(errors).length > 0) {
      this.#focusFirstInvalid(Object.keys(errors)[0]);
      return;
    }
    const form = draftToMenuFormValue(this.draft());
    const current = this.record();
    const edit = this.mode() === 'edit' && current !== null;
    this.saving.set(true);
    const call = edit
      ? this.#menus.update(toUpdateMenuScreenRequest(current.id, form, this.active()))
      : this.#menus.add(toAddMenuScreenRequest(form));
    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit({ mode: edit ? 'edit' : 'add', screenName: form.screenName.trim() });
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.#showSaveError(err);
      },
    });
  }

  #showSaveError(err: unknown): void {
    const error = err instanceof ApiException ? err.error : null;
    if (error?.kind === 'already-existed') {
      // 40301 does not say which field; the menu name is the likely one (contract section "40301").
      this.#serverErrors.set({ screenName: 'This name is already in use. Choose a different name.' });
      this.#focusFirstInvalid('screenName');
      return;
    }
    const detail = error && 'message' in error && error.message ? error.message : null;
    this.banner.set(
      error?.kind === 'network'
        ? 'We couldn’t reach the server. Your changes are still here — try again.'
        : (detail ?? 'The server couldn’t finish your request. Your changes are still here — try again.'),
    );
  }

  #focusFirstInvalid(key: string): void {
    queueMicrotask(() => {
      const target = this.body()?.nativeElement.querySelector<HTMLElement>(`[data-field="${key}"]`);
      target?.focus();
    });
  }
}
