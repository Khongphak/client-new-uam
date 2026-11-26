import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { UErrPage } from '../../shared/ui/errpage';

/** 403 "No access" (artboard Err403 / Err403Phone). */
@Component({
  selector: 'app-forbidden-page',
  imports: [UErrPage, RouterLink, ButtonModule],
  template: `
    <u-errpage
      icon="pi-lock"
      code="403"
      heading="You don’t have access to this page"
      message="Your UAM role can’t open this page. If you need it, ask a UAM admin to change your role."
    >
      <a pButton uErrpageActions routerLink="/home" icon="pi pi-home" data-testid="forbidden-home">Back to Home</a>
      <a
        pButton
        uErrpageActions
        severity="secondary"
        href="mailto:ITSupport@philliplife.com"
        data-testid="forbidden-support"
        >Contact IT Support</a
      >
    </u-errpage>
  `,
  styles: `
    a[pButton] {
      text-decoration: none;
    }
    a[pButton]:not(.p-button-secondary) {
      color: #fff;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenPage {}
