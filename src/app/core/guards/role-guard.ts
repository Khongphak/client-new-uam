import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SHELL_PROFILE } from '../../layout/shell/shell-profile';

export const FORBIDDEN_URL = '/forbidden';

/**
 * Route guard: allows the route when the signed-in role is listed or the user is a super admin
 * (docs/design-spec/README.md, "สิทธิ์ตาม route"). Anyone else is sent to the 403 page, not 404.
 * Unknown URLs stay with the wildcard 404 route.
 */
export function roleGuard(allowedRoles: readonly string[]): CanActivateFn {
  return () => {
    const profile = inject(SHELL_PROFILE)();
    if (profile && (profile.systemAdmin || allowedRoles.includes(profile.uamRole))) return true;
    return inject(Router).parseUrl(FORBIDDEN_URL);
  };
}
