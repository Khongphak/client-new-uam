import { MenuTreeNode } from '../api/role-menu-tree';

/**
 * Pure domain model of the Role editor's "Menus & groups" step (no Angular).
 * Every place is one ordered list of keys (menus and groups): `items['root']` is the top level, `items[groupKey]`
 * a group. Menu keys are `m<menuId>` (so a menu can only exist once), group keys `g<n>`.
 * Groups nest at most 2 levels. All functions return a new structure (or the same one when nothing changes).
 */
export const ROOT = 'root';
export const MAX_GROUP_DEPTH = 2;

export interface GroupMeta {
  readonly name: string;
  /** Icon id from `get-icons` (category Menu); sent as `imageGroupId`. */
  readonly imageGroupId: number;
}

export interface MenuStructure {
  readonly groups: Readonly<Record<string, GroupMeta>>;
  readonly items: Readonly<Record<string, readonly string[]>>;
  /** Next group number. */
  readonly seq: number;
}

/** A menu the role may use (item of `get-menuScreens-bySystemId`). */
export interface MenuOption {
  readonly menuId: number;
  readonly screenName: string;
  readonly functional: readonly string[];
  readonly imageId: number;
}

export interface Destination {
  readonly key: string;
  readonly label: string;
}

export interface StructureRow {
  readonly kind: 'item' | 'hole';
  readonly key: string;
  readonly isGroup: boolean;
  /** Place the row sits in (for a hole: the empty group it stands in). */
  readonly parent: string;
  readonly index: number;
  readonly siblings: number;
  readonly depth: number;
}

export const menuKey = (menuId: number): string => `m${menuId}`;
export const isGroupKey = (key: string): boolean => key.startsWith('g');
export const menuIdOf = (key: string): number => Number(key.slice(1));

export function emptyStructure(): MenuStructure {
  return { groups: {}, items: { [ROOT]: [] }, seq: 1 };
}

export function parentOf(s: MenuStructure, key: string): string | undefined {
  return Object.keys(s.items).find((place) => s.items[place].includes(key));
}

/** 1 = top-level group, 2 = group inside a top-level group. */
export function depthOf(s: MenuStructure, groupKey: string): number {
  return parentOf(s, groupKey) === ROOT ? 1 : 2;
}

const placeDepth = (s: MenuStructure, place: string): number => (place === ROOT ? 0 : depthOf(s, place));
const hasSubGroups = (s: MenuStructure, groupKey: string): boolean => (s.items[groupKey] ?? []).some(isGroupKey);

/** Can `key` be put inside `place`? Menus: anywhere. Groups: top level, or a top-level group when it has no sub groups. */
export function canPlace(s: MenuStructure, key: string, place: string): boolean {
  if (!(place in s.items)) return false;
  if (!isGroupKey(key)) return true;
  if (place === key || descendantGroups(s, key).includes(place)) return false;
  const depth = placeDepth(s, place);
  return depth === 0 || (depth === 1 && !hasSubGroups(s, key));
}

function descendantGroups(s: MenuStructure, groupKey: string): string[] {
  return (s.items[groupKey] ?? []).filter(isGroupKey).flatMap((g) => [g, ...descendantGroups(s, g)]);
}

/** Put `key` into `place` at `index` (moves it when already used). No-op when not allowed. */
export function place(s: MenuStructure, key: string, into: string, index: number): MenuStructure {
  if (!canPlace(s, key, into)) return s;
  const items: Record<string, string[]> = {};
  for (const k of Object.keys(s.items)) items[k] = [...s.items[k]];
  let at = Math.min(Math.max(index, 0), items[into].length);
  const from = parentOf(s, key);
  if (from) {
    const old = items[from].indexOf(key);
    items[from].splice(old, 1);
    if (from === into && old < at) at--;
  }
  items[into].splice(at, 0, key);
  return { ...s, items };
}

/** Move one step up (-1) or down (+1) inside its own list. */
export function moveBy(s: MenuStructure, key: string, delta: -1 | 1): MenuStructure {
  const from = parentOf(s, key);
  if (!from) return s;
  const list = s.items[from];
  const i = list.indexOf(key);
  const j = i + delta;
  if (j < 0 || j >= list.length) return s;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return { ...s, items: { ...s.items, [from]: next } };
}

export function removeMenu(s: MenuStructure, key: string): MenuStructure {
  const from = parentOf(s, key);
  if (!from || isGroupKey(key)) return s;
  return { ...s, items: { ...s.items, [from]: s.items[from].filter((k) => k !== key) } };
}

/** Add a group at the end of `parent` (top level or a top-level group). `key` is null when it would be a third level. */
export function addGroup(
  s: MenuStructure,
  parent: string,
  meta: GroupMeta,
): { structure: MenuStructure; key: string | null } {
  if (!(parent in s.items) || placeDepth(s, parent) >= MAX_GROUP_DEPTH) return { structure: s, key: null };
  const key = `g${s.seq}`;
  return {
    key,
    structure: {
      groups: { ...s.groups, [key]: meta },
      items: { ...s.items, [parent]: [...s.items[parent], key], [key]: [] },
      seq: s.seq + 1,
    },
  };
}

export function renameGroup(s: MenuStructure, key: string, name: string): MenuStructure {
  return key in s.groups ? { ...s, groups: { ...s.groups, [key]: { ...s.groups[key], name } } } : s;
}

export function setGroupIcon(s: MenuStructure, key: string, imageGroupId: number): MenuStructure {
  return key in s.groups ? { ...s, groups: { ...s.groups, [key]: { ...s.groups[key], imageGroupId } } } : s;
}

/** Delete a group with its sub groups; their menus are simply no longer used. */
export function deleteGroup(s: MenuStructure, key: string): MenuStructure {
  if (!(key in s.groups)) return s;
  const gone = new Set([key, ...descendantGroups(s, key)]);
  const items: Record<string, readonly string[]> = {};
  for (const k of Object.keys(s.items)) if (!gone.has(k)) items[k] = s.items[k].filter((x) => !gone.has(x));
  const groups: Record<string, GroupMeta> = {};
  for (const k of Object.keys(s.groups)) if (!gone.has(k)) groups[k] = s.groups[k];
  return { ...s, groups, items };
}

export function usedMenuIds(s: MenuStructure): Set<number> {
  const used = new Set<number>();
  for (const place of Object.keys(s.items)) {
    for (const k of s.items[place]) if (!isGroupKey(k)) used.add(menuIdOf(k));
  }
  return used;
}

/** Menus inside a group, sub groups included. */
export function menuCount(s: MenuStructure, groupKey: string): number {
  return (s.items[groupKey] ?? []).reduce((n, k) => n + (isGroupKey(k) ? menuCount(s, k) : 1), 0);
}

export const groupCount = (s: MenuStructure): number => Object.keys(s.groups).length;

/** "Top level" / "Claims" / "Claims › Approval". */
export function placeLabel(s: MenuStructure, place: string): string {
  if (place === ROOT) return 'Top level';
  const name = s.groups[place]?.name ?? '';
  return depthOf(s, place) === 2 ? `${s.groups[parentOf(s, place) ?? ''].name} › ${name}` : name;
}

/** Everywhere `key` could be put in the "Move to" list, in tree order. Omits where it already is. */
export function destinations(s: MenuStructure, key: string): Destination[] {
  const here = parentOf(s, key);
  return allPlaces(s)
    .filter((p) => p !== here && canPlace(s, key, p))
    .map((p) => ({ key: p, label: placeLabel(s, p) }));
}

/** Where a menu from the pool can be added: top level and every group, in tree order. */
export function allPlaces(s: MenuStructure): string[] {
  const out = [ROOT];
  const walk = (place: string): void => {
    for (const k of s.items[place]) {
      if (isGroupKey(k)) {
        out.push(k);
        walk(k);
      }
    }
  };
  walk(ROOT);
  return out;
}

/** Rows of the tree in display order; an empty group gets a "hole" row under it. */
export function structureRows(s: MenuStructure): StructureRow[] {
  const rows: StructureRow[] = [];
  const walk = (place: string, depth: number): void => {
    s.items[place].forEach((key, index, list) => {
      const isGroup = isGroupKey(key);
      rows.push({ kind: 'item', key, isGroup, parent: place, index, siblings: list.length, depth });
      if (isGroup) {
        if (s.items[key].length === 0) {
          rows.push({ kind: 'hole', key, isGroup: true, parent: key, index: 0, siblings: 0, depth: depth + 1 });
        }
        walk(key, depth + 1);
      }
    });
  };
  walk(ROOT, 0);
  return rows;
}

/** → the editor tree of `role-menu-tree` (then `toMenusPayload`). Menus no longer offered are skipped. */
export function toTree(s: MenuStructure, menus: readonly MenuOption[]): MenuTreeNode[] {
  const byId = new Map(menus.map((m) => [m.menuId, m]));
  const build = (place: string): MenuTreeNode[] =>
    s.items[place].flatMap((key): MenuTreeNode[] => {
      if (isGroupKey(key)) {
        const g = s.groups[key];
        return [{ kind: 'group', imageGroupId: g.imageGroupId, groupName: g.name, children: build(key) }];
      }
      const menu = byId.get(menuIdOf(key));
      return menu
        ? [
            {
              kind: 'menu',
              imageGroupId: menu.imageId,
              menuId: menu.menuId,
              screenName: menu.screenName,
              permission: [],
              functional: menu.functional,
            },
          ]
        : [];
    });
  return build(ROOT);
}

export interface DropTarget {
  readonly pos: 'before' | 'after' | 'into';
  readonly parent: string;
  readonly index: number;
}

/**
 * Where a dragged `dragKey` lands when dropped on a row (or on the "top level" end zone when `row` is 'end').
 * Top half of a row = before it; bottom half of a menu = after it; bottom half of a group = inside it (at the end).
 * Null when the drop is not allowed.
 */
export function dropTarget(
  s: MenuStructure,
  dragKey: string,
  row: StructureRow | 'end',
  half: 'top' | 'bottom',
): DropTarget | null {
  let target: DropTarget;
  if (row === 'end') target = { pos: 'into', parent: ROOT, index: s.items[ROOT].length };
  else if (row.kind === 'hole') target = { pos: 'into', parent: row.parent, index: 0 };
  else if (row.key === dragKey) return null;
  else if (half === 'top') target = { pos: 'before', parent: row.parent, index: row.index };
  else if (row.isGroup) target = { pos: 'into', parent: row.key, index: s.items[row.key].length };
  else target = { pos: 'after', parent: row.parent, index: row.index + 1 };
  return canPlace(s, dragKey, target.parent) ? target : null;
}
