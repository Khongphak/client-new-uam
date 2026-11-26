import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { UErrPage } from '../../shared/ui/errpage';

/** 404 "page doesn't exist" (artboard Err404 / Err404Phone) — unknown URLs only. */
@Component({
  selector: 'app-not-found-page',
  imports: [UErrPage, RouterLink, ButtonModule],
  template: `
    <u-errpage
      icon="pi-compass"
      code="404"
      heading="This page doesn’t exist"
      message="The link may be old, or the address may have a typo. Go back to Home and start from there."
    >
      <a pButton uErrpageActions routerLink="/home" icon="pi pi-home" data-testid="notfound-home">Back to Home</a>
    </u-errpage>
  `,
  styles: `
    a[pButton] {
      color: #fff;
      text-decoration: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
