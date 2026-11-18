import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Role name in a table cell or row: `<u-role>ADMIN</u-role>`. */
@Component({
  selector: 'u-role',
  template: '<ng-content />',
  styles: ':host { font-size: 0.9375rem; color: var(--uam-ink); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class URole {}

/** Right-aligned number cell. */
@Component({
  selector: 'u-num',
  template: '<ng-content />',
  styles: ':host { display: block; text-align: right; font-variant-numeric: tabular-nums; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UNum {}

/** Card heading text. A block element; wrap it in the heading level the page needs. */
@Component({
  selector: 'u-section-title',
  template: '<ng-content />',
  styles: ':host { display: block; font-size: 1.0625rem; font-weight: 700; color: var(--uam-navy); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class USectionTitle {}

@Component({
  selector: 'u-subtitle',
  template: '<ng-content />',
  styles: ':host { display: block; font-size: 1rem; font-weight: 700; color: var(--uam-navy); }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class USubtitle {}
