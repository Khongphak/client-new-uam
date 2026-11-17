import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Dialog } from 'primeng/dialog';

export type UDialogKind = 'warn' | 'error' | 'info';

/** One extra line under the message, e.g. `{ label: 'Code', value: '50001' }` (RESULT_CODE). */
export interface UDialogDetail {
  readonly label: string;
  readonly value: string;
}

const DEFAULT_ICON: Record<UDialogKind, string> = {
  warn: 'pi-exclamation-triangle',
  error: 'pi-times-circle',
  info: 'pi-info-circle',
};

/**
 * The single confirm/error dialog: icon, heading, one paragraph, optional detail row, right-aligned buttons.
 * Wraps PrimeNG `p-dialog`. All text is supplied by the caller (message catalog or server).
 *
 * ```html
 * <u-dialog [(visible)]="open" kind="error" heading="..." message="...">
 *   <p-button uDialogActions label="Close" (onClick)="open.set(false)" />
 * </u-dialog>
 * ```
 */
@Component({
  selector: 'u-dialog',
  imports: [Dialog],
  template: `
    <p-dialog
      #dlg
      [(visible)]="visible"
      [modal]="true"
      [showHeader]="false"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      [dismissableMask]="false"
      role="alertdialog"
      [style]="{ width: '100%', 'max-width': '30rem', 'border-radius': '16px', overflow: 'hidden' }"
      [contentStyle]="{ padding: '0' }"
    >
      <div class="body">
        <span class="icon" [class]="'icon is-' + kind()" aria-hidden="true">
          <i class="pi" [class]="iconClass()"></i>
        </span>
        <div class="content">
          <h2 class="heading" [id]="dlg.ariaLabelledBy" data-testid="u-dialog-heading">{{ heading() }}</h2>
          @if (message(); as text) {
            <p class="message" data-testid="u-dialog-message">{{ text }}</p>
          }
          @if (detail(); as d) {
            <div class="detail" data-testid="u-dialog-detail">
              <span>{{ d.label }}</span>
              <b>{{ d.value }}</b>
            </div>
          }
        </div>
      </div>
      <div class="footer"><ng-content select="[uDialogActions]" /></div>
    </p-dialog>
  `,
  styles: `
    .body {
      display: grid;
      grid-template-columns: 2.75rem minmax(0, 1fr);
      gap: var(--sp-4);
      padding: 1.5rem 1.5rem 1.25rem;
    }
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
      background: #fff3df;
      color: var(--uam-warn);
      font-size: 1.25rem;
    }
    .icon.is-error {
      background: #fdecec;
      color: #8a1c1c;
    }
    .icon.is-info {
      background: #eef5ff;
      color: var(--uam-navy);
    }
    .content {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
      min-width: 0;
    }
    .heading {
      margin: 0;
      color: var(--uam-navy);
      font-size: 1.125rem;
      font-weight: 700;
      line-height: 1.35;
    }
    .message {
      margin: 0;
      color: var(--uam-ink-2);
      font-size: 0.9375rem;
      line-height: 1.55;
    }
    .detail {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--sp-1) var(--sp-3);
      margin-top: var(--sp-2);
      padding: 0.625rem 0.75rem;
      border-radius: 0.5rem;
      background: #f6f7f9;
      color: var(--uam-muted);
      font-size: 0.8125rem;
    }
    .detail b {
      color: var(--uam-ink);
      font-weight: 600;
    }
    .footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.625rem;
      padding: 0.875rem 1.5rem;
      border-top: 1px solid var(--uam-rule);
      background: #f8fafc;
    }
    @media (max-width: 480px) {
      .footer {
        flex-direction: column-reverse;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UDialog {
  readonly visible = model(false);
  readonly kind = input<UDialogKind>('warn');
  /** PrimeIcons class; defaults per kind. */
  readonly icon = input<string>();
  readonly heading = input.required<string>();
  readonly message = input<string>();
  readonly detail = input<UDialogDetail | null>(null);

  protected readonly iconClass = computed(() => this.icon() ?? DEFAULT_ICON[this.kind()]);
}
