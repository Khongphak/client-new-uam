import { buildShellMenu, ShellMenuItem } from './shell-menu';

const labels = (items: readonly ShellMenuItem[]) => items.map((i) => i.label);

describe('buildShellMenu', () => {
  it('gives ADMIN Home, Setting (both children) and Report', () => {
    const menu = buildShellMenu('ADMIN', false);
    expect(labels(menu)).toEqual(['Home', 'Setting', 'Report']);
    expect(labels(menu[1].children ?? [])).toEqual(['System Setting', 'User & Permission']);
  });

  it('gives a super admin the full menu whatever the role', () => {
    const menu = buildShellMenu('USER', true);
    expect(labels(menu)).toEqual(['Home', 'Setting', 'Report']);
    expect(labels(menu[1].children ?? [])).toEqual(['System Setting', 'User & Permission']);
  });

  it('gives DEVELOPER Home and Setting with System Setting only', () => {
    const menu = buildShellMenu('DEVELOPER', false);
    expect(labels(menu)).toEqual(['Home', 'Setting']);
    expect(labels(menu[1].children ?? [])).toEqual(['System Setting']);
  });

  it('gives AUDIT Home and Report', () => {
    expect(labels(buildShellMenu('AUDIT', false))).toEqual(['Home', 'Report']);
  });

  it('gives USER (and unknown roles) Home only', () => {
    expect(labels(buildShellMenu('USER', false))).toEqual(['Home']);
    expect(labels(buildShellMenu('SOMETHING', false))).toEqual(['Home']);
  });

  it('points items at the documented routes', () => {
    const menu = buildShellMenu('ADMIN', false);
    expect(menu[0].route).toBe('/home');
    expect(menu[2].route).toBe('/report');
    expect((menu[1].children ?? []).map((c) => c.route)).toEqual([
      '/setting/system-setting',
      '/setting/users-setting',
    ]);
  });
});
