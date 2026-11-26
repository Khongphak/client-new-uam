import { ParamMap } from '@angular/router';

export type DrawerKind = 'system' | 's2s';
export type DrawerMode = 'view' | 'edit' | 'add';

/** Drawer state kept in the URL: `?drawer=system&mode=view&id=SYS-001` (the tab stays in the `#fragment`). */
export interface DrawerState {
  readonly kind: DrawerKind;
  readonly mode: DrawerMode;
  /** `systemId` (the code shown in the table) for `system`, the row id for `s2s`; null for `add`. */
  readonly id: string | null;
}

const KINDS: readonly string[] = ['system', 's2s'];
const MODES: readonly string[] = ['view', 'edit', 'add'];

/** Anything that is not a complete, known drawer URL means "closed" (a bad link just shows the table). */
export function drawerFromParams(params: ParamMap): DrawerState | null {
  const kind = params.get('drawer');
  const mode = params.get('mode');
  const id = params.get('id')?.trim() || null;
  if (!kind || !KINDS.includes(kind) || !mode || !MODES.includes(mode)) return null;
  if (mode !== 'add' && id === null) return null;
  return { kind: kind as DrawerKind, mode: mode as DrawerMode, id: mode === 'add' ? null : id };
}

/** Query params for `Router.navigate`; `id: null` drops the param. */
export function drawerQuery(state: DrawerState) {
  return { drawer: state.kind, mode: state.mode, id: state.id };
}

/** Passing these clears the drawer from the URL. */
export const CLOSED_DRAWER_QUERY = { drawer: null, mode: null, id: null } as const;
