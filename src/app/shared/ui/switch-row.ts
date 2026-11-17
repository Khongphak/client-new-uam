import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';

let nextId = 0;

/**
 * Label + optional hint + toggle on one line. Clicking the text toggles the switch.
 * `<u-switch-row label="Active" hint="Inactive users cannot log in" [(checked)]="active" />`
 */
@Component({
  selector: 'u-switch-row',
  imports: [FormsModule, ToggleSwitch],
  template: `
    <label class="text" [for]="inputId">
      <span class="label">{{ label() }}</span>
      @if (hint(); as text) {
        <span class="hint">{{ text }}</span>
      }
    </label>
    <p-toggleswitch
      [inputId]="inputId"
      [ngModel]="checked()"
      [disabled]="disabled()"
      (onChange)="checked.set($event.checked)"
    />
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 3.5rem;
      padding: 0.75rem 0;
      border-top: 1px solid var(--uam-rule);
    }
    .text {
      display: flex;
      flex: 1;
      flex-direction: column;
      cursor: pointer;
    }
    .hint {
      font-size: 0.875rem;
      color: var(--uam-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class USwitchRow {
  protected readonly inputId = `u-switch-${nextId++}`;

  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly disabled = input(false);
  readonly checked = model(false);
}
