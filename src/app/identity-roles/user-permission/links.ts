/**
 * Where a name in the lists leads. The View pages themselves arrive with UAM-USR-02 / UAM-USR-03,
 * which own these URLs and should adopt (or replace) them there.
 */
export const ROLE_VIEW_LINK = (id: number): string[] => ['/setting/users-setting/roles', String(id)];
export const USER_VIEW_LINK = (id: number): string[] => ['/setting/users-setting/users', String(id)];
