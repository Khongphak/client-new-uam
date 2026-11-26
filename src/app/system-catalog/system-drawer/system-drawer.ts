import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { ApiException } from '../../core/api/api-error';
import { FactItem, UFacts } from '../../shared/detail/facts';
import { SystemRecord } from '../../shared/interfaces';
import { UDrawer } from '../../shared/ui/drawer';
import { UState } from '../../shared/ui/state';
import { UStatus } from '../../shared/ui/status';
import { USwitchRow } from '../../shared/ui/switch-row';
import { MasterDataApi } from '../api/master-data-api';
import { SystemApi } from '../api/system-api';
import { toAddSystemRequest, toUpdateSystemRequest } from '../api/system-mapper';
import { formatUpdated } from '../system-setting-page/system-setting-rows';
import {
  draftFromRecord,
  draftToFormValue,
  EMPTY_DRAFT,
  MAX_DESCRIPTION,
  SystemDraft,
  validateSystemDraft,
} from './system-form';

export type SystemDrawerMode = 'view' | 'edit' | 'add';

/** What the page needs after a successful save. */
export interface SystemSaved {
  readonly mode: 'edit' | 'add';
  readonly systemName: string;
  readonly accessTokenTime: number;
  readonly refreshTokenTime: number;
}

const TITLES: Record<SystemDrawerMode, (name: string) => string> = {
  view: (name) => name || 'System',
  edit: (name) => (name ? `Edit ${name}` : 'Edit system'),
  add: () => 'Add system',
};

/** System drawer: view / edit / add (UAM-SYS-02). Opening, closing and the URL belong to the page. */
@Component({
  selector: 'app-system-drawer',
  imports: [UDrawer, UFacts, UState, UStatus, USwitchRow],
  templateUrl: './system-drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemDrawer {
  readonly #systems = inject(SystemApi);
  readonly #master = inject(MasterDataApi);

  readonly mode = input.required<SystemDrawerMode>();
  /** `systemId` of the record to view/edit; null when adding. */
  readonly systemId = input<string | null>(null);
  /** Owners seen in the table, offered as suggestions (the owner list has no endpoint). */
  readonly owners = input<readonly string[]>([]);

  readonly closed = output<void>();
  readonly saved = output<SystemSaved>();
  readonly editRequested = output<void>();

  protected readonly maxDescription = MAX_DESCRIPTION;

  readonly #record = rxResource({
    params: () => (this.mode() === 'add' ? undefined : this.systemId()),
    stream: ({ params }) => this.#systems.getById(params!),
  });
  readonly #types = rxResource({
    params: () => (this.mode() === 'view' ? undefined : true),
    stream: () => this.#master.getGeneralData('systemType'),
  });
  readonly #icons = rxResource({
    params: () => (this.mode() === 'view' ? undefined : true),
    stream: () => this.#master.getIcons(),
  });

  protected readonly record = computed<SystemRecord | null>(
    () => (this.#record.hasValue() ? this.#record.value()[0] : undefined) ?? null,
  );
  protected readonly loading = computed(() => this.#record.isLoading());
  protected readonly loadFailed = computed(() => this.#record.error() !== undefined);
  protected readonly notFound = computed(
    () => this.mode() !== 'add' && this.#record.status() === 'resolved' && this.record() === null,
  );
  protected readonly showForm = computed(
    () => this.mode() === 'add' || (this.record() !== null && !this.loading()),
  );

  protected readonly draft = linkedSignal<SystemDraft>(() => {
    const record = this.mode() === 'add' ? null : this.record();
    return record ? draftFromRecord(record) : EMPTY_DRAFT;
  });
  protected readonly active = linkedSignal(
    () => this.mode() === 'add' || (this.record()?.status ?? '').toLowerCase() === 'active',
  );
  protected readonly tried = signal(false);
  protected readonly saving = signal(false);
  protected readonly banner = signal<string | null>(null);
  readonly #serverErrors = signal<Partial<Record<keyof SystemDraft, string>>>({});

  protected readonly errors = computed(() =>
    this.tried() ? { ...validateSystemDraft(this.draft()), ...this.#serverErrors() } : {},
  );

  protected readonly heading = computed(() => TITLES[this.mode()](this.record()?.systemName ?? ''));

  protected readonly typeOptions = computed(() => {
    const values = (this.#types.hasValue() ? this.#types.value() : []).map((t) => t.value);
    const current = this.draft().type;
    return current && !values.includes(current) ? [current, ...values] : values;
  });
  protected readonly ownerOptions = computed(() => {
    const current = this.draft().ownerName;
    return [...new Set([...this.owners(), ...(current ? [current] : [])])].sort();
  });
  protected readonly iconOptions = computed(() =>
    (this.#icons.hasValue() ? this.#icons.value() : [])
      .filter((i) => i.category === 'Systems')
      .map((i) => ({ id: i.id, name: i.name, src: `data:image/svg+xml;base64,${i.data}` })),
  );

  protected readonly facts = computed<FactItem[]>(() => {
    const r = this.record();
    if (!r) return [];
    const minutes = (n: number | null) => (n === null ? null : `${n} min`);
    const by = r.updatedBy ? ` by ${r.updatedBy}` : '';
    return [
      { icon: 'pi-hashtag', label: 'System ID', value: r.systemId },
      { icon: 'pi-tag', label: 'System type', value: r.type },
      { icon: 'pi-user', label: 'Owner', value: r.ownerName },
      { icon: 'pi-align-left', label: 'Description', value: r.description },
      { icon: 'pi-link', label: 'System URL', value: r.url },
      { icon: 'pi-clock', label: 'Access token', value: minutes(r.accessTokenTime) },
      { icon: 'pi-refresh', label: 'Refresh token', value: minutes(r.refreshTokenTime) },
      { icon: 'pi-clock', label: 'Updated', value: `${formatUpdated(r.updatedDate)}${by}` },
    ];
  });

  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  protected set<K extends keyof SystemDraft>(key: K, value: SystemDraft[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
    this.#serverErrors.update(({ [key]: _gone, ...rest }) => rest);
  }

  protected retry(): void {
    this.#record.reload();
  }

  protected save(): void {
    this.tried.set(true);
    this.banner.set(null);
    const errors = validateSystemDraft(this.draft());
    if (Object.keys(errors).length > 0) {
      this.#focusFirstInvalid(Object.keys(errors)[0]);
      return;
    }
    const form = draftToFormValue(this.draft());
    const current = this.record();
    const edit = this.mode() === 'edit' && current !== null;
    this.saving.set(true);
    const call = edit
      ? this.#systems.update(toUpdateSystemRequest(current, form, this.active()))
      : this.#systems.add(toAddSystemRequest(form));
    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit({
          mode: edit ? 'edit' : 'add',
          systemName: form.systemName.trim(),
          accessTokenTime: form.accessTokenTime,
          refreshTokenTime: form.refreshTokenTime,
        });
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
      // 40301 does not say which field; the name is the likely one (contract section "40301").
      this.#serverErrors.set({ systemName: 'This name is already in use. Choose a different name.' });
      this.#focusFirstInvalid('systemName');
      return;
    }
    const detail =
      error && 'message' in error && error.message ? error.message : null;
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
