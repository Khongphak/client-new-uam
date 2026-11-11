import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Temporary landing route; replaced when the real app shell and pages land. */
@Component({
  selector: 'app-placeholder-page',
  templateUrl: './placeholder-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderPage {}
