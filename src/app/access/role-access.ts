/** UAM roles the backend assigns (`UserProfile.uamRole`). */
export type UamRole = 'ADMIN' | 'DEVELOPER' | 'AUDIT' | 'USER';

/**
 * The one rule for "may this user see/enter this?": the role is listed, or the user is a super admin.
 * Shared by the sidebar and (later) the route guard so the two can never disagree.
 */
export function canAccess(
  allowedRoles: readonly string[],
  uamRole: string,
  systemAdmin: boolean,
): boolean {
  return systemAdmin || allowedRoles.includes(uamRole);
}

const ALL_ROLES: readonly UamRole[] = ['ADMIN', 'DEVELOPER', 'AUDIT', 'USER'];

/** Roles allowed per destination (docs/design-spec/README.md, "สิทธิ์ตาม route"). */
export const ACCESS_POLICY = {
  home: ALL_ROLES,
  'system-setting': ['ADMIN', 'DEVELOPER'],
  'user-permission': ['ADMIN'],
  report: ['ADMIN', 'AUDIT'],
} as const satisfies Record<string, readonly UamRole[]>;
