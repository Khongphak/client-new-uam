import { convertToParamMap } from '@angular/router';

import { drawerFromParams, drawerQuery } from './drawer-url';

const params = (o: Record<string, string>) => convertToParamMap(o);

describe('drawer URL', () => {
  it('reads /setting/system-setting?drawer=system&mode=view&id=SYS-001', () => {
    expect(drawerFromParams(params({ drawer: 'system', mode: 'view', id: 'SYS-001' }))).toEqual({
      kind: 'system',
      mode: 'view',
      id: 'SYS-001',
    });
  });

  it('reads add without an id', () => {
    expect(drawerFromParams(params({ drawer: 'system', mode: 'add' }))).toEqual({
      kind: 'system',
      mode: 'add',
      id: null,
    });
  });

  it('is closed when the drawer is unknown, the mode is wrong or view/edit have no id', () => {
    expect(drawerFromParams(params({}))).toBeNull();
    expect(drawerFromParams(params({ drawer: 'role', mode: 'view', id: '1' }))).toBeNull();
    expect(drawerFromParams(params({ drawer: 'system', mode: 'delete', id: '1' }))).toBeNull();
    expect(drawerFromParams(params({ drawer: 'system', mode: 'edit' }))).toBeNull();
    expect(drawerFromParams(params({ drawer: 'system', mode: 'view', id: ' ' }))).toBeNull();
  });

  it('builds the query and round-trips it', () => {
    const state = { kind: 'system', mode: 'edit', id: 'SYS-002' } as const;
    expect(drawerQuery(state)).toEqual({ drawer: 'system', mode: 'edit', id: 'SYS-002' });
    expect(drawerFromParams(params(drawerQuery(state) as Record<string, string>))).toEqual(state);
    expect(drawerQuery({ kind: 'system', mode: 'add', id: null })).toEqual({
      drawer: 'system',
      mode: 'add',
      id: null,
    });
  });
});
