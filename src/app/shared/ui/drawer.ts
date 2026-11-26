import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Drawer } from 'primeng/drawer';

/**
 * Right-hand drawer shell shared by the System / Menu / System-to-System stories (480 px on desktop, full screen
 * on a phone). The caller owns the open state (usually the URL) and listens to `closed`, which fires for the X
 * button, Esc and a click on the mask. Body goes in the default slot, buttons in `[uDrawerFooter]`.
 *
 * Styles live in `src/styles/_overrides.scss` (`.u-drawer`): a `styles` block next to `p-drawer` made `ng test` hang
 * (UAM-ERR-04 / #103).
 *
 * ```html
 * <u-drawer [visible]="true" heading="Edit system" (closed)="close()">
 *   ...body...
 *   <div uDrawerFooter><p-button label="Save" /></div>
 * </u-drawer>
 * ```
 */
@Component({
  selector: 'u-drawer',
  imports: [Drawer],
  template: `
    <p-drawer
      [visible]="visible()"
      (visibleChange)="$event || closed.emit()"
      position="right"
      [modal]="true"
      [dismissible]="true"
      [closeOnEscape]="true"
      [header]="heading()"
      ariaCloseLabel="Close"
      styleClass="u-drawer"
    >
      <ng-content />
      <ng-template #footer>
        <div class="u-drawer__footer"><ng-content select="[uDrawerFooter]" /></div>
      </ng-template>
    </p-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UDrawer {
  readonly visible = input(true);
  readonly heading = input.required<string>();
  readonly closed = output<void>();
}
