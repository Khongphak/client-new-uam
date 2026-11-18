import { InjectionToken } from '@angular/core';

import { UserProfile } from '../../shared/interfaces';

/**
 * Read-only seam for the signed-in profile. The shell only displays it; the login story
 * (UAM-AUT-01) provides the real value. Defaults to "nobody" so the shell renders without auth.
 */
export const SHELL_PROFILE = new InjectionToken<() => UserProfile | null>('SHELL_PROFILE', {
  providedIn: 'root',
  factory: () => () => null,
});
