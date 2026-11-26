import { ACCESS_POLICY, canAccess } from '../../access/role-access';

export interface ShellMenuItem {
  readonly id: string;
  readonly label: string;
  /** PrimeIcons class; only on top-level items. */
  readonly icon?: string;
  /** Absent on a group that only expands. */
  readonly route?: string;
  readonly children?: readonly ShellMenuItem[];
}

const HOME: ShellMenuItem = { id: 'home', label: 'Home', icon: 'pi-home', route: '/home' };
const REPORT: ShellMenuItem = { id: 'report', label: 'Report', icon: 'pi-file', route: '/report' };
const SYSTEM_SETTING: ShellMenuItem = {
  id: 'system-setting',
  label: 'System Setting',
  route: '/setting/system-setting',
};
const USER_PERMISSION: ShellMenuItem = {
  id: 'user-permission',
  label: 'User & Permission',
  route: '/setting/users-setting',
};

const setting = (children: readonly ShellMenuItem[]): ShellMenuItem => ({
  id: 'setting',
  label: 'Setting',
  icon: 'pi-cog',
  children,
});

/** Sidebar entries for a user: each destination is kept only if the shared access policy allows it (Home is for any signed-in user). */
export function buildShellMenu(role: string, systemAdmin: boolean): readonly ShellMenuItem[] {
  const allowed = (item: ShellMenuItem): boolean =>
    canAccess(ACCESS_POLICY[item.id as keyof typeof ACCESS_POLICY] ?? [], role, systemAdmin);
  const settingChildren = [SYSTEM_SETTING, USER_PERMISSION].filter(allowed);
  return [HOME, ...(settingChildren.length ? [setting(settingChildren)] : []), REPORT].filter(
    (item) => item.id === 'home' || item.id === 'setting' || allowed(item),
  );
}
