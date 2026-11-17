import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Icon-only back button for detail pages. Use `fragment` to return to a tab (`users`, `roles`).
 * `<u-back link="/setting/users-setting" fragment="users" />`
 */
@Component({
  selector: 'u-back',
  imports: [RouterLink],
  template: `
    <a
      class="back"
      [routerLink]="link()"
      [fragment]="fragment()"
      [attr.aria-label]="label()"
      data-testid="u-back"
    >
      <i class="pi pi-arrow-left" aria-hidden="true"></i>
    </a>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
    .back {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border: 1px solid var(--uam-line);
      border-radius: 0.625rem;
      background: #fff;
      color: var(--uam-navy);
      text-decoration: none;
    }
    .back:hover {
      background: #eef2ff;
    }
    @media (max-width: 767.98px) {
      .back {
        width: 2.75rem;
        height: 2.75rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UBack {
  readonly link = input.required<string | readonly unknown[]>();
  readonly fragment = input<string>();
  readonly label = input('Back');
}
