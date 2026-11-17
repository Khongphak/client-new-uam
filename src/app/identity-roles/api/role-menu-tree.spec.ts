import { RoleMenuItem } from '../../shared/interfaces';
import { fromRoleMenuItems, GroupNode, MenuTreeNode, toMenusPayload } from './role-menu-tree';

const menu = (menuId: number, permission: string[]): MenuTreeNode => ({
  kind: 'menu',
  menuId,
  screenName: `S${menuId}`,
  imageGroupId: menuId,
  permission,
  functional: ['add', 'view'],
});

describe('role menu tree', () => {
  it('numbers sortOrder 1,2,3… depth-first over the whole tree (not per level)', () => {
    const tree: MenuTreeNode[] = [
      {
        kind: 'group',
        groupName: 'G1',
        imageGroupId: 9,
        children: [menu(1, ['view']), menu(2, [])],
      },
      menu(3, ['add']),
    ];
    const payload = toMenusPayload(tree);
    expect(payload.map((n) => n.sortOrder)).toEqual([1, 4]);
    expect(payload[0].groupMenus?.map((n) => n.sortOrder)).toEqual([2, 3]);
  });

  it('omits unset keys instead of sending null/undefined, and formats permission as a list string', () => {
    const [group, leaf] = toMenusPayload([
      { kind: 'group', groupName: 'G', imageGroupId: 1, children: [] },
      menu(5, ['add', 'view']),
    ]);
    expect(JSON.parse(JSON.stringify(group))).toEqual({
      sortOrder: 1,
      imageGroupId: 1,
      groupName: 'G',
      groupMenus: [],
    });
    expect(JSON.parse(JSON.stringify(leaf))).toEqual({
      sortOrder: 2,
      imageGroupId: 5,
      menuId: 5,
      permission: '[add,view]',
    });
  });

  it('keeps server ids on loaded nodes so update can echo them', () => {
    const items: RoleMenuItem[] = [
      {
        roleId: 108,
        roleMenuId: 1,
        menuId: 122,
        parentId: 0,
        groupName: null,
        screenName: 'Screen',
        sortOrder: 1,
        permission: '[view]',
        functional: '[add,view]',
        imageGroupId: 161,
        groupMenus: [],
      },
    ];
    const tree = fromRoleMenuItems(items);
    expect(toMenusPayload(tree)[0]).toEqual({
      sortOrder: 1,
      imageGroupId: 161,
      roleId: 108,
      roleMenuId: 1,
      parentId: 0,
      menuId: 122,
      permission: '[view]',
    });
  });

  it('reads menuId 0 with children as a group and null permission/functional as empty', () => {
    const tree = fromRoleMenuItems([
      {
        roleId: 1,
        roleMenuId: 2,
        menuId: 0,
        parentId: 0,
        groupName: 'Group A',
        screenName: null,
        sortOrder: 2,
        permission: null,
        imageGroupId: 69,
        groupMenus: [
          {
            roleId: 1,
            roleMenuId: 3,
            menuId: 1,
            parentId: 2,
            groupName: null,
            screenName: 'X',
            sortOrder: 3,
            permission: null,
            functional: null,
            imageGroupId: 2,
            groupMenus: [],
          },
        ],
      },
    ]);
    expect(tree[0]).toMatchObject({ kind: 'group', groupName: 'Group A' });
    expect((tree[0] as GroupNode).children[0]).toMatchObject({
      kind: 'menu',
      permission: [],
      functional: [],
    });
  });

  it('treats a null response as an empty tree', () => {
    expect(fromRoleMenuItems(null)).toEqual([]);
  });
});
