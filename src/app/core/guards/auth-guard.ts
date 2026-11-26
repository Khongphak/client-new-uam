import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';

import { Session } from '../session';

export const LOGIN_URL = '/login';
export const CONSENT_URL = '/pdpaconsent';
export const HOME_URL = '/home';

/** Only same-origin paths ("/x", not "//host" or "/\host") may be used as a post-login target. */
export function safeReturnUrl(url: string | null | undefined): string | null {
  return url && /^\/(?![/\\])/.test(url) ? url : null;
}

function toLogin(router: Router, returnUrl: string): UrlTree {
  const target = safeReturnUrl(returnUrl);
  const isRoot = target === null || target === '/' || target.startsWith(`${LOGIN_URL}`);
  return router.createUrlTree([LOGIN_URL], isRoot ? {} : { queryParams: { returnUrl: target } });
}

/**
 * Guards the whole shell (put on the parent route, so routes added under it are covered):
 * not signed in → /login?returnUrl=…; signed in but consent not accepted → /pdpaconsent.
 * Role checks stay with `roleGuard`.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(Session);
  const router = inject(Router);
  if (!session.profile()) return toLogin(router, state.url);
  if (!session.consented()) {
    const target = safeReturnUrl(state.url);
    return router.createUrlTree([CONSENT_URL], {
      queryParams: target && target !== '/' ? { returnUrl: target } : {},
    });
  }
  return true;
};

export const authChildGuard: CanActivateChildFn = (route, state) => authGuard(route, state);

/** /pdpaconsent: needs a signed-in user who has not accepted yet. */
export const consentGuard: CanActivateFn = (route, state) => {
  const session = inject(Session);
  const router = inject(Router);
  if (!session.profile()) return toLogin(router, state.url);
  if (session.consented()) {
    const returnUrl = safeReturnUrl(route.queryParamMap.get('returnUrl'));
    return router.parseUrl(returnUrl ?? HOME_URL);
  }
  return true;
};
