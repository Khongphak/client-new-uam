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
import { SystemToSystemRecord } from '../../shared/interfaces';
import { UDrawer } from '../../shared/ui/drawer';
import { UState } from '../../shared/ui/state';
import { UStatus } from '../../shared/ui/status';
import { USwitchRow } from '../../shared/ui/switch-row';
import { SystemApi } from '../api/system-api';
import { toAddS2SRequest, toUpdateS2SRequest } from '../api/s2s-mapper';
import {
  draftFromRecord,
  draftToFormValue,
  EMPTY_S2S_DRAFT,
  S2SDraft,
  validateS2SDraft,
} from './s2s-form';

export type S2SDrawerMode = 'view' | 'edit' | 'add';

/** A system the connection can point at: `id` is its `systemId`, sent as the UUId. */
export interface S2SSystemOption {
  readonly id: string;
  readonly name: string;
  readonly active: boolean;
}

/** What the page needs after a successful save. */
export interface S2SSaved {
  readonly mode: 'edit' | 'add';
  readonly sourceName: string;
  readonly targetName: string;
  readonly accessTokenTime: number;
}

/** System to System drawer: view / edit / add (UAM-SYS-04). Opening, closing and the URL belong to the page. */
@Component({
  selector: 'app-s2s-drawer',
  imports: [UDrawer, UFacts, UState, UStatus, USwitchRow],
  templateUrl: './s2s-drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class S2SDrawer {
  readonly #api = inject(SystemApi);

  readonly mode = input.required<S2SDrawerMode>();
  /** Row `id` of the connection to view/edit; null when adding. */
  readonly connectionId = input<number | null>(null);
  /** Systems seen in the table: the list the source/target pickers draw from. */
  readonly systems = input<readonly S2SSystemOption[]>([]);
  /** "28 Oct 2026 by somchai.k": the by-id answer has no audit fields, so the page passes the list row's. */
  readonly updated = input<string | null>(null);

  readonly closed = output<void>();
  readonly saved = output<S2SSaved>();
  readonly editRequested = output<void>();

  readonly #record = rxResource({
    params: () => (this.mode() === 'add' ? undefined : this.connectionId()),
    stream: ({ params }) => this.#api.getSystemToSystemById(params!),
  });

  protected readonly record = computed<SystemToSystemRecord | null>(
    () => (this.#record.hasValue() ? this.#record.value() : undefined) ?? null,
  );
  protected readonly loading = computed(() => this.#record.isLoading());
  protected readonly loadFailed = computed(() => this.#record.error() !== undefined);
  protected readonly showForm = computed(
    () => this.mode() === 'add' || (this.record() !== null && !this.loading()),
  );

  protected readonly draft = linkedSignal<S2SDraft>(() => {
    const record = this.mode() === 'add' ? null : this.record();
    return record ? draftFromRecord(record) : EMPTY_S2S_DRAFT;
  });
  protected readonly active = linkedSignal(
    () => this.mode() === 'add' || (this.record()?.status ?? '').toLowerCase() === 'active',
  );
  protected readonly tried = signal(false);
  protected readonly saving = signal(false);
  protected readonly banner = signal<string | null>(null);
  readonly #serverErrors = signal<Partial<Record<keyof S2SDraft, string>>>({});

  protected readonly errors = computed(() =>
    this.tried() ? { ...validateS2SDraft(this.draft()), ...this.#serverErrors() } : {},
  );

  protected readonly heading = computed(() => {
    const name = this.record()?.sourceSystemName ?? '';
    return {
      view: name || 'Connection',
      edit: name ? `Edit ${name}` : 'Edit connection',
      add: 'Add connection',
    }[this.mode()];
  });

  /** Active systems, plus whatever the record already points at (even if it has since gone inactive). */
  protected readonly sourceOptions = computed(() => this.#pick(this.draft().sourceSystemUUId));
  protected readonly targetOptions = computed(() => this.#pick(this.draft().targetSystemUUId));

  protected readonly facts = computed<FactItem[]>(() => {
    const r = this.record();
    if (!r) return [];
    return [
      { icon: 'pi-server', label: 'Source system', value: r.sourceSystemName },
      { icon: 'pi-arrow-right', label: 'Target system', value: r.targetSystemName },
      {
        icon: 'pi-clock',
        label: 'Token time',
        value: r.accessTokenTime === null ? null : `${r.accessTokenTime} min`,
      },
      { icon: 'pi-clock', label: 'Updated', value: this.updated() },
    ];
  });

  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  #pick(current: string): readonly S2SSystemOption[] {
    return this.systems().filter((s) => s.active || s.id === current);
  }

  protected set<K extends keyof S2SDraft>(key: K, value: S2SDraft[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
    this.#serverErrors.update(({ [key]: _gone, ...rest }) => rest);
    // The duplicate-pair error sits on the target; changing the source also invalidates it.
    if (key === 'sourceSystemUUId') {
      this.#serverErrors.update(({ targetSystemUUId: _t, ...rest }) => rest);
    }
  }

  protected retry(): void {
    this.#record.reload();
  }

  protected save(): void {
    this.tried.set(true);
    this.banner.set(null);
    const errors = validateS2SDraft(this.draft());
    if (Object.keys(errors).length > 0) {
      this.#focusFirstInvalid(Object.keys(errors)[0]);
      return;
    }
    const form = draftToFormValue(this.draft());
    const id = this.connectionId();
    const edit = this.mode() === 'edit' && id !== null;
    this.saving.set(true);
    const call = edit
      ? this.#api.updateSystemToSystem(toUpdateS2SRequest(id, form, this.active()))
      : this.#api.addSystemToSystem(toAddS2SRequest(form));
    call.subscribe({
      next: () => {
        this.saving.set(false);
        const name = (uuid: string) => this.systems().find((s) => s.id === uuid)?.name ?? uuid;
        this.saved.emit({
          mode: edit ? 'edit' : 'add',
          sourceName: name(form.sourceSystemUUId),
          targetName: name(form.targetSystemUUId),
          accessTokenTime: form.accessTokenTime,
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
      // 40301 does not say which field; for S2S the likely clash is the source+target pair.
      this.#serverErrors.set({
        targetSystemUUId: 'This connection already exists. Choose a different source or target.',
      });
      this.#focusFirstInvalid('targetSystemUUId');
      return;
    }
    const detail = error && 'message' in error && error.message ? error.message : null;
    this.banner.set(
      error?.kind === 'network'
        ? 'We couldn’t reach the server. Your changes are still here — try again.'
        : (detail ??
            'The server couldn’t finish your request. Your changes are still here — try again.'),
    );
  }

  #focusFirstInvalid(key: string): void {
    queueMicrotask(() => {
      this.body()?.nativeElement.querySelector<HTMLElement>(`[data-field="${key}"]`)?.focus();
    });
  }
}
