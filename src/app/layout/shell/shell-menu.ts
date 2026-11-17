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

/** Sidebar entries per role (docs/design-spec/README.md, "สิทธิ์ตาม route"). A super admin sees everything. */
export function buildShellMenu(role: string, systemAdmin: boolean): readonly ShellMenuItem[] {
  if (systemAdmin || role === 'ADMIN') {
    return [HOME, setting([SYSTEM_SETTING, USER_PERMISSION]), REPORT];
  }
  switch (role) {
    case 'DEVELOPER':
      return [HOME, setting([SYSTEM_SETTING])];
    case 'AUDIT':
      return [HOME, REPORT];
    default:
      return [HOME];
  }
}
