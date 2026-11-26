import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const SLOTS = [1, 2, 3] as const;

/** Approvers 1–3, names only and read-only (`managers[].name`). Missing ones read "Not set"; more than three are ignored. */
@Component({
  selector: 'u-approvers',
  template: `
    <ol aria-label="Approvers">
      @for (slot of slots(); track slot.n) {
        <li [class.is-empty]="!slot.name">
          <span class="n">{{ slot.n }}</span>
          @if (slot.name) {
            <b>{{ slot.name }}</b>
          } @else {
            <span>Not set</span>
          }
        </li>
      }
    </ol>
  `,
  styles: `
    :host {
      display: block;
    }
    ol {
      list-style: none;
      margin: 0;
      padding: 0;
      border: 1px solid var(--uam-line);
      border-radius: 0.75rem;
      overflow: hidden;
      max-width: 34rem;
    }
    li {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      min-height: 3.5rem;
      padding: 0.625rem 1rem;
      border-bottom: 1px solid var(--uam-rule);
    }
    li:last-child {
      border-bottom: 0;
    }
    .n {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: var(--uam-tile);
      color: var(--uam-navy);
      font-size: 0.8125rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
    }
    li.is-empty {
      background: #fafafa;
      color: var(--uam-muted);
    }
    li.is-empty .n {
      background: #eceef2;
      color: var(--uam-muted);
    }
    b {
      min-width: 0;
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UApprovers {
  readonly names = input.required<readonly string[]>();
  protected readonly slots = computed(() =>
    SLOTS.map((n) => ({ n, name: this.names()[n - 1]?.trim() || null })),
  );
}
