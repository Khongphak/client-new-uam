import { toMenusPayload } from '../api/role-menu-tree';
import {
  addGroup,
  canPlace,
  deleteGroup,
  depthOf,
  destinations,
  dropTarget,
  emptyStructure,
  menuCount,
  menuKey,
  MenuOption,
  MenuStructure,
  moveBy,
  parentOf,
  place,
  removeMenu,
  renameGroup,
  ROOT,
  setGroupIcon,
  structureRows,
  toTree,
  usedMenuIds,
} from './menu-structure';

const menus: MenuOption[] = [1, 2, 3, 4].map((id) => ({
  menuId: id,
  screenName: `Menu ${id}`,
  functional: ['view', 'add'],
  imageId: 100 + id,
}));
const m = menuKey;

/** root: [m1, G1[m2, G2[m3]], m4]  (G1 = key g1, G2 = g2) */
function sample(): MenuStructure {
  let s = emptyStructure();
  const a = addGroup(s, ROOT, { name: 'Claims', imageGroupId: 5 });
  s = a.structure;
  const b = addGroup(s, 'g1', { name: 'Approval', imageGroupId: 6 });
  s = b.structure;
  s = place(s, m(1), ROOT, 0);
  s = place(s, m(2), 'g1', 0);
  s = place(s, m(3), 'g2', 0);
  s = place(s, m(4), ROOT, 99);
  return s;
}
const keysOf = (s: MenuStructure, parent: string) => [...(s.items[parent] ?? [])];

describe('menu-structure: placing (UAM-ROL-02 / TC-ROL-002, TC-ROL-004)', () => {
  it('starts empty with nothing used', () => {
    const s = emptyStructure();
    expect(keysOf(s, ROOT)).toEqual([]);
    expect(usedMenuIds(s).size).toBe(0);
  });

  it('a menu can be used once: placing it again moves it, never duplicates', () => {
    let s = sample();
    s = place(s, m(1), 'g1', 0);
    expect(keysOf(s, ROOT)).not.toContain(m(1));
    expect(keysOf(s, 'g1')).toEqual([m(1), m(2), 'g2']);
    expect([...usedMenuIds(s)].sort()).toEqual([1, 2, 3, 4]);
  });

  it('removing a menu frees it for the pool again', () => {
    const s = removeMenu(sample(), m(4));
    expect(usedMenuIds(s).has(4)).toBe(false);
    expect(keysOf(s, ROOT)).not.toContain(m(4));
  });

  it('a menu can be put at the top level', () => {
    const s = place(sample(), m(3), ROOT, 0);
    expect(keysOf(s, ROOT)[0]).toBe(m(3));
    expect(parentOf(s, m(3))).toBe(ROOT);
  });

  it('keeps the index right when moving inside the same list', () => {
    const s = place(sample(), m(1), ROOT, 3); // after m4, but m1 leaves first
    expect(keysOf(s, ROOT)).toEqual(['g1', m(4), m(1)]);
  });

  it('moveBy swaps with the neighbour and stops at the ends', () => {
    let s = sample();
    expect(keysOf(s, ROOT)).toEqual([m(1), 'g1', m(4)]);
    s = moveBy(s, 'g1', 1);
    expect(keysOf(s, ROOT)).toEqual([m(1), m(4), 'g1']);
    expect(moveBy(s, 'g1', 1)).toBe(s);
    expect(moveBy(s, m(1), -1)).toBe(s);
  });
});

describe('menu-structure: groups nest at most 2 levels (TC-ROL-003)', () => {
  it('depth: top-level group = 1, group inside it = 2', () => {
    const s = sample();
    expect(depthOf(s, 'g1')).toBe(1);
    expect(depthOf(s, 'g2')).toBe(2);
  });

  it('refuses a third level when adding a group', () => {
    const s = sample();
    const r = addGroup(s, 'g2', { name: 'Too deep', imageGroupId: 1 });
    expect(r.key).toBeNull();
    expect(r.structure).toBe(s);
  });

  it('refuses to drop a group into a level-2 group', () => {
    let s = sample();
    const extra = addGroup(s, ROOT, { name: 'Other', imageGroupId: 1 });
    s = extra.structure;
    expect(canPlace(s, extra.key!, 'g2')).toBe(false);
    expect(place(s, extra.key!, 'g2', 0)).toBe(s);
  });

  it('refuses to drop a group that has sub groups into another group', () => {
    let s = sample();
    const other = addGroup(s, ROOT, { name: 'Other', imageGroupId: 1 });
    s = other.structure;
    expect(canPlace(s, 'g1', other.key!)).toBe(false); // g1 holds g2
    expect(canPlace(s, 'g2', other.key!)).toBe(true); // g2 has none
  });

  it('never places a group inside itself', () => {
    const s = sample();
    expect(canPlace(s, 'g1', 'g1')).toBe(false);
    expect(canPlace(s, 'g1', 'g2')).toBe(false);
  });

  it('menus may go into any group', () => {
    const s = sample();
    expect(canPlace(s, m(1), 'g2')).toBe(true);
  });

  it('rename and icon change only that group', () => {
    let s = renameGroup(sample(), 'g1', 'Claims 2');
    s = setGroupIcon(s, 'g1', 9);
    expect(s.groups['g1']).toEqual({ name: 'Claims 2', imageGroupId: 9 });
    expect(s.groups['g2']).toEqual({ name: 'Approval', imageGroupId: 6 });
  });

  it('deleting a group deletes its sub groups and frees their menus', () => {
    const s = deleteGroup(sample(), 'g1');
    expect(s.groups['g1']).toBeUndefined();
    expect(s.groups['g2']).toBeUndefined();
    expect(keysOf(s, ROOT)).toEqual([m(1), m(4)]);
    expect([...usedMenuIds(s)].sort()).toEqual([1, 4]);
  });

  it('counts menus inside a group, sub groups included', () => {
    expect(menuCount(sample(), 'g1')).toBe(2);
    expect(menuCount(sample(), 'g2')).toBe(1);
  });
});

describe('menu-structure: Move to… destinations (keyboard path, TC-ROL-004)', () => {
  it('a menu can go to the top level and to every group except where it is now', () => {
    const d = destinations(sample(), m(2)); // lives in g1
    expect(d.map((x) => x.key)).toEqual([ROOT, 'g2']);
    expect(d.map((x) => x.label)).toEqual(['Top level', 'Claims › Approval']);
  });

  it('a group with sub groups can only go to the top level', () => {
    expect(destinations(sample(), 'g1').map((x) => x.key)).toEqual([]); // already at top level
    const s = place(sample(), 'g1', ROOT, 0);
    expect(destinations(s, 'g1')).toEqual([]);
  });

  it('a level-2 group may go to the top level or into another top-level group', () => {
    let s = sample();
    const other = addGroup(s, ROOT, { name: 'Other', imageGroupId: 1 });
    s = other.structure;
    expect(destinations(s, 'g2').map((x) => x.key)).toEqual([ROOT, other.key]);
  });
});

describe('menu-structure: rows for the tree', () => {
  it('lists rows in display order with depth, and a hole row for an empty group', () => {
    let s = sample();
    const e = addGroup(s, ROOT, { name: 'Empty', imageGroupId: 1 });
    s = e.structure;
    const rows = structureRows(s);
    expect(rows.map((r) => `${r.kind}:${r.key}:${r.depth}`)).toEqual([
      'item:m1:0',
      'item:g1:0',
      'item:m2:1',
      'item:g2:1',
      'item:m3:2',
      'item:m4:0',
      `item:${e.key}:0`,
      `hole:${e.key}:1`,
    ]);
    const m4 = rows.find((r) => r.key === m(4))!;
    expect(m4).toMatchObject({ parent: ROOT, index: 2, siblings: 4 });
  });
});

describe('menu-structure: toTree → payload (existing shape only)', () => {
  it('maps to the editor tree, ready for toMenusPayload', () => {
    const payload = toMenusPayload(toTree(sample(), menus));
    expect(payload).toEqual([
      { sortOrder: 1, imageGroupId: 101, menuId: 1, permission: '[]' },
      {
        sortOrder: 2,
        imageGroupId: 5,
        groupName: 'Claims',
        groupMenus: [
          { sortOrder: 3, imageGroupId: 102, menuId: 2, permission: '[]' },
          {
            sortOrder: 4,
            imageGroupId: 6,
            groupName: 'Approval',
            groupMenus: [{ sortOrder: 5, imageGroupId: 103, menuId: 3, permission: '[]' }],
          },
        ],
      },
      { sortOrder: 6, imageGroupId: 104, menuId: 4, permission: '[]' },
    ]);
  });

  it('skips a menu id that is no longer offered', () => {
    const s = sample();
    expect(toTree(s, menus.filter((x) => x.menuId !== 4))).toHaveLength(2);
  });
});

describe('menu-structure: dropTarget (drag and drop)', () => {
  const rowOf = (s: MenuStructure, key: string) => structureRows(s).find((r) => r.key === key && r.kind === 'item')!;

  it('top half = before the row; bottom half of a menu = after it', () => {
    const s = sample();
    expect(dropTarget(s, m(2), rowOf(s, m(4)), 'top')).toEqual({ pos: 'before', parent: ROOT, index: 2 });
    expect(dropTarget(s, m(2), rowOf(s, m(4)), 'bottom')).toEqual({ pos: 'after', parent: ROOT, index: 3 });
  });

  it('bottom half of a group = inside it, at the end (a menu dragged into a group)', () => {
    const s = sample();
    expect(dropTarget(s, m(1), rowOf(s, 'g1'), 'bottom')).toEqual({ pos: 'into', parent: 'g1', index: 2 });
  });

  it('the end zone puts it at the top level', () => {
    const s = sample();
    expect(dropTarget(s, m(3), 'end', 'top')).toEqual({ pos: 'into', parent: ROOT, index: 3 });
  });

  it('an empty group accepts a drop through its hole row', () => {
    const e = addGroup(sample(), ROOT, { name: 'Empty', imageGroupId: 1 });
    const hole = structureRows(e.structure).find((r) => r.kind === 'hole')!;
    expect(dropTarget(e.structure, m(1), hole, 'top')).toEqual({ pos: 'into', parent: e.key, index: 0 });
  });

  it('refuses dropping on itself and any drop that breaks the 2-level rule', () => {
    const s = sample();
    expect(dropTarget(s, m(1), rowOf(s, m(1)), 'top')).toBeNull();
    const o = addGroup(s, ROOT, { name: 'Other', imageGroupId: 1 });
    expect(dropTarget(o.structure, o.key!, rowOf(o.structure, 'g2'), 'bottom')).toBeNull();
    expect(dropTarget(o.structure, o.key!, rowOf(o.structure, m(3)), 'top')).toBeNull(); // m3 sits inside level-2 g2
  });
});
