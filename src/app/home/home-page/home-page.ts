import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';

import { HomeApi } from '../../access/api/home-api';
import { Session } from '../../core/session';
import { USysCard, USysGrid } from '../../shared/detail';

/** Landing page: one card per system the signed-in user can open. */
@Component({
  selector: 'app-home-page',
  imports: [USysGrid, USysCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly #profile = inject(Session).profile;
  readonly #api = inject(HomeApi);

  protected readonly firstName = computed(() => this.#profile()?.firstName ?? '');

  // Loading / empty / error presentation is UAM-HOM-02; until then a failed or pending load shows no cards.
  protected readonly systems = rxResource({
    params: () => this.#profile()?.userName,
    stream: ({ params }) => (params ? this.#api.getUserSystems(params) : EMPTY),
    defaultValue: [],
  });

  /** `value()` throws while the resource is in error state; the error dialog (UAM-ERR-03) reports that failure. */
  protected readonly items = computed(() => (this.systems.hasValue() ? this.systems.value() : []));

  protected readonly summary = computed(() => {
    const n = this.items().length;
    return n === 0 ? '' : `${n} ${n === 1 ? 'system' : 'systems'} you can open`;
  });
}
