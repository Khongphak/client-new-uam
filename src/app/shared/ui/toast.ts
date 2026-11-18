import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

/**
 * Raise toasts from anywhere: `inject(UToastService).success('Saved', 'System created')`.
 * Text comes from the caller. A single `<u-toast />` must be mounted in the app shell to show them.
 */
@Injectable({ providedIn: 'root' })
export class UToastService {
  /** Owned here so `<u-toast>` can listen without a global MessageService provider. */
  readonly messages = new MessageService();

  success(summary: string, detail?: string): void {
    this.messages.add({ severity: 'success', summary, detail });
  }

  error(summary: string, detail?: string): void {
    this.messages.add({ severity: 'error', summary, detail });
  }

  info(summary: string, detail?: string): void {
    this.messages.add({ severity: 'info', summary, detail });
  }
}

@Component({
  selector: 'u-toast',
  imports: [Toast],
  template: `<p-toast position="bottom-right" [life]="5000" />`,
  providers: [{ provide: MessageService, useFactory: () => inject(UToastService).messages }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UToast {}
