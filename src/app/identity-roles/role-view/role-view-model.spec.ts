import { RoleMenuItem } from '../../shared/interfaces';
import { buildRoleMenuView } from './role-view-model';

const node = (over: Partial<RoleMenuItem>): RoleMenuItem => ({
  roleId: 1,
  roleMenuId: 0,
  menuId: 0,
  parentId: 0,
  groupName: null,
  screenName: null,
  sortOrder: 0,
  permission: null,
  functional: null,
  imageGroupId: 0,
  groupMenus: [],
  ...over,
});
const menu = (name: string, permission: string, functional: string, sortOrder = 0) =>
  node({ menuId: sortOrder + 100, screenName: name, permission, functional, sortOrder });
const group = (name: string, children: RoleMenuItem[], sortOrder = 0) =>
  node({ groupName: name, groupMenus: children, sortOrder });

// Same shape as the RoleView artboard: 2 top-level menus, Claims (2) › Approval (1), Reports (1).
const tree = [
  menu('Payment Status', '[view]', '[view,export]', 1),
  menu('Claim Audit Log', '[view]', '[view,export,download]', 2),
  group(
    'Claims',
    [
      menu('Claim Register', '[view,add]', '[view,add,edit]', 4),
      menu('Claim Search', '[view]', '[view]', 5),
      group('Approval', [menu('Claim Approval', '[view]', '[view,approve]', 7)], 6),
    ],
    3,
  ),
  group('Reports', [menu('Daily Claims Report', '[view]', '[view,report]', 9)], 8),
];

describe('buildRoleMenuView', () => {
  it('counts menus, groups and top-level menus like the artboard (6 / 3 / 2)', () => {
    expect(buildRoleMenuView(tree).stats).toEqual({ menus: 6, groups: 3, topLevel: 2 });
  });

  it('lists top-level menus first, then groups with their path and depth', () => {
    const { sections } = buildRoleMenuView(tree);
    expect(sections.map((s) => [s.path, s.depth, s.menus.length])).toEqual([
      [null, 0, 2],
      ['Claims', 0, 2],
      ['Claims › Approval', 1, 1],
      ['Reports', 0, 1],
    ]);
  });

  it('parses functional and permission list strings per menu', () => {
    const row = buildRoleMenuView(tree).sections[1].menus[0];
    expect(row).toEqual({
      name: 'Claim Register',
      functional: ['View', 'Add', 'Edit'],
      granted: ['View', 'Add'],
    });
  });

  it('orders siblings by sortOrder and skips groups that hold only sub-groups', () => {
    const { sections, stats } = buildRoleMenuView([
      group('Outer', [group('Inner', [menu('B', '[]', '[view]', 3), menu('A', '[view]', '[view]', 2)], 1)], 0),
    ]);
    expect(sections.map((s) => s.path)).toEqual(['Outer › Inner']);
    expect(sections[0].menus.map((m) => m.name)).toEqual(['A', 'B']);
    expect(stats).toEqual({ menus: 2, groups: 2, topLevel: 0 });
  });

  it('copes with an empty tree', () => {
    expect(buildRoleMenuView([])).toEqual({
      stats: { menus: 0, groups: 0, topLevel: 0 },
      sections: [],
    });
  });
});
