import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';

import { ApiError } from '../../core/api/api-error';
import { UDialog, UDialogDetail } from './dialog';

/** The one extra line shown under the paragraph: the server's own `message`, else its result code. */
export function inactiveFailDetail(error: ApiError): UDialogDetail | null {
  if ('message' in error && error.message) return { label: 'Message', value: error.message };
  if ('code' in error && error.code) return { label: 'Code', value: error.code };
  return null;
}

/** "Set to Inactive?" confirm (artboard DlgSetInactive; the API has no delete endpoint — gap-spec B.5). */
@Component({
  selector: 'u-inactive-confirm',
  imports: [UDialog, Button],
  template: `
    <u-dialog
      [(visible)]="visible"
      kind="warn"
      icon="pi-ban"
      [heading]="heading()"
      [message]="message()"
    >
      <p-button
        uDialogActions
        data-testid="inactive-cancel"
        label="Cancel"
        severity="secondary"
        (onClick)="visible.set(false)"
      />
      <p-button
        uDialogActions
        data-testid="inactive-confirm"
        label="Set to Inactive"
        (onClick)="confirm()"
      />
    </u-dialog>
  `,
  styles: `
    @media (max-width: 480px) {
      p-button {
        display: block;
        width: 100%;
      }
      p-button ::ng-deep .p-button {
        width: 100%;
        min-height: 2.75rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UInactiveConfirm {
  readonly visible = model(false);
  /** Record name for the heading; omit for the generic wording. */
  readonly name = input<string>();
  readonly message = input('Roles and users won’t be able to use it. You can set it back to Active later.');
  readonly confirmed = output<void>();

  protected readonly heading = computed(() => {
    const n = this.name();
    return n ? `Set “${n}” to Inactive?` : 'Set this record to Inactive?';
  });

  protected confirm(): void {
    this.visible.set(false);
    this.confirmed.emit();
  }
}

/** Server refused the status change (artboard DlgSetInactiveFail): shows the server's message, not sample text. */
@Component({
  selector: 'u-inactive-fail',
  imports: [UDialog, Button],
  template: `
    <u-dialog
      [(visible)]="visible"
      kind="error"
      icon="pi-exclamation-triangle"
      heading="Couldn’t change the status"
      message="The server didn’t change the status. Try again in a moment."
      [detail]="detail()"
    >
      <p-button
        uDialogActions
        data-testid="inactive-close"
        label="Close"
        severity="secondary"
        (onClick)="visible.set(false)"
      />
      <p-button uDialogActions data-testid="inactive-retry" label="Try again" (onClick)="tryAgain()" />
    </u-dialog>
  `,
  styles: `
    @media (max-width: 480px) {
      p-button {
        display: block;
        width: 100%;
      }
      p-button ::ng-deep .p-button {
        width: 100%;
        min-height: 2.75rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UInactiveFail {
  readonly visible = model(false);
  readonly error = input.required<ApiError>();
  readonly retry = output<void>();

  protected readonly detail = computed(() => inactiveFailDetail(this.error()));

  protected tryAgain(): void {
    this.visible.set(false);
    this.retry.emit();
  }
}
