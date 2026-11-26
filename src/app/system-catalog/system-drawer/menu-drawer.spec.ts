import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ApiException } from '../../core/api/api-error';
import { MenuScreenRecord } from '../../shared/interfaces';
import { fixtures } from '../../../testing/fixtures';
import { MasterDataApi } from '../api/master-data-api';
import { MenuScreenApi } from '../api/menu-screen-api';
import { SystemApi } from '../api/system-api';
import { MenuDrawer } from './menu-drawer';
import type { SystemDrawerMode } from './system-drawer';

const SYSTEM_ID = (fixtures['add-menu-screen.request'] as { systemId: string }).systemId;
const RECORD = {
  ...(fixtures['update-menu-screen.request'] as object),
  status: 'Active',
  systemName: 'Example System A',
  image: null,
} as unknown as MenuScreenRecord;

async function render(mode: SystemDrawerMode, menuId: number | null = RECORD.id) {
  const api = {
    getById: vi.fn(() => of(RECORD)),
    add: vi.fn(() => of(undefined)),
    update: vi.fn(() => of(undefined)),
  };
  const systems = {
    getAll: vi.fn(() => of([{ systemId: SYSTEM_ID, systemName: 'Example System A' }])),
  };
  const master = {
    getGeneralData: vi.fn(() =>
      of([{ value: 'add' }, { value: 'view' }, { value: 'edit' }, { value: 'report' }]),
    ),
    getIcons: vi.fn(() =>
      of([
        { id: 1, category: 'Systems', name: 'Shield', data: 'PHN2Zy8+' },
        { id: 2, category: 'Menu', name: 'Doc', data: 'PHN2Zy8+' },
      ]),
    ),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: MenuScreenApi, useValue: api },
      { provide: SystemApi, useValue: systems },
      { provide: MasterDataApi, useValue: master },
    ],
  });
  const fixture = TestBed.createComponent(MenuDrawer);
  fixture.componentRef.setInput('mode', mode);
  fixture.componentRef.setInput('menuId', menuId);
  const closed = vi.fn();
  const saved = vi.fn();
  const editRequested = vi.fn();
  fixture.componentInstance.closed.subscribe(closed);
  fixture.componentInstance.saved.subscribe(saved);
  fixture.componentInstance.editRequested.subscribe(editRequested);
  await fixture.whenStable();
  const q = <T extends HTMLElement>(sel: string) => document.body.querySelector(sel) as T | null;
  const id = (testid: string) => q<HTMLButtonElement>(`[data-testid="${testid}"]`);
  const fill = async (sel: string, value: string) => {
    const el = q<HTMLInputElement>(sel)!;
    el.value = value;
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
    await fixture.whenStable();
  };
  const click = async (el: HTMLElement | null) => {
    el!.click();
    await fixture.whenStable();
  };
  const fn = (name: string) => q<HTMLButtonElement>(`[data-fn="${name}"]`);
  return { fixture, api, systems, master, q, id, fill, click, fn, closed, saved, editRequested };
}

async function fillAll(r: Awaited<ReturnType<typeof render>>) {
  await r.fill('#m-s', SYSTEM_ID);
  await r.fill('#m-n', '  Example Screen  ');
  await r.fill('#m-u', '/screen-1');
  await r.fill('#m-d', 'Example');
  await r.click(r.q('.ic-opt'));
  await r.click(r.fn('add'));
  await r.click(r.fn('view'));
  await r.click(r.fn('edit'));
}

describe('MenuDrawer', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('views a record: title, facts incl. functions, Close and Edit', async () => {
    const r = await render('view');
    expect(r.api.getById).toHaveBeenCalledWith(RECORD.id);
    const text = r.id('menu-drawer')!.textContent!;
    expect(text).toContain('Example System A');
    expect(text).toContain('/screen-1');
    expect(text).toContain('add, view');
    expect(document.body.textContent).toContain('Example Screen');
    await r.click(r.id('drawer-edit'));
    expect(r.editRequested).toHaveBeenCalled();
    await r.click(r.id('drawer-close'));
    expect(r.closed).toHaveBeenCalled();
  });

  it('says so when the record does not exist', async () => {
    const r = await render('view', 1);
    r.api.getById.mockReturnValue(of(null) as never);
    r.fixture.componentRef.setInput('menuId', 2);
    await r.fixture.whenStable();
    expect(r.id('menu-drawer')!.textContent).toContain('This record doesn’t exist');
  });

  it('shows a load error with Try again', async () => {
    const r = await render('edit', 1);
    r.api.getById.mockReturnValue(throwError(() => new Error('boom')));
    r.fixture.componentRef.setInput('menuId', 2);
    await r.fixture.whenStable();
    expect(r.id('menu-drawer')!.textContent).toContain('Couldn’t load this record');
    expect(r.id('drawer-save')).toBeNull();
    r.api.getById.mockReturnValue(of(RECORD));
    await r.click(r.id('drawer-retry'));
    expect(r.id('drawer-save')).not.toBeNull();
  });

  it('adds a menu: only Menu icons, functions from the master list, fixture payload sent', async () => {
    const r = await render('add', null);
    expect(r.q('#m-id')).toBeNull();
    expect(document.body.querySelectorAll('.ic-opt')).toHaveLength(1);
    expect(document.body.querySelectorAll('[data-fn]')).toHaveLength(4);
    expect(document.body.textContent).toContain('4 functions from the database');
    await fillAll(r);
    expect(r.fn('add')!.getAttribute('aria-pressed')).toBe('true');
    await r.click(r.id('drawer-save'));
    expect(r.api.add).toHaveBeenCalledWith(fixtures['add-menu-screen.request']);
    expect(r.saved).toHaveBeenCalledWith({ mode: 'add', screenName: 'Example Screen' });
  });

  it('toggles a function off again; none selected is sent as []', async () => {
    const r = await render('add', null);
    await fillAll(r);
    for (const f of ['add', 'view', 'edit']) await r.click(r.fn(f));
    expect(r.fn('view')!.getAttribute('aria-pressed')).toBe('false');
    await r.click(r.id('drawer-save'));
    expect(r.api.add).toHaveBeenCalledWith(expect.objectContaining({ functional: '[]' }));
  });

  it('does not save an incomplete form and explains what is missing', async () => {
    const r = await render('add', null);
    await r.click(r.id('drawer-save'));
    expect(r.api.add).not.toHaveBeenCalled();
    expect(r.q('[data-testid="err-screenName"]')!.textContent).toContain('Required');
    expect(document.body.textContent).toContain('Pick an icon to save.');
    expect(document.body.textContent).toContain('Select a system');
  });

  it('edits: system is locked, functions preselected, id echoed, Active switch → status', async () => {
    const r = await render('edit');
    expect((r.q('#m-id') as HTMLInputElement).value).toBe(String(RECORD.id));
    expect((r.q('#m-s') as HTMLSelectElement).disabled).toBe(true);
    expect(document.body.textContent).toContain('The system can’t change after the menu is saved.');
    expect(r.fn('add')!.getAttribute('aria-pressed')).toBe('true');
    expect(r.fn('edit')!.getAttribute('aria-pressed')).toBe('false');
    await r.click(r.fn('add'));
    (r.q('input[role="switch"]') as HTMLInputElement).click();
    await r.fixture.whenStable();
    await r.click(r.id('drawer-save'));
    expect(r.api.update).toHaveBeenCalledWith({
      ...(fixtures['update-menu-screen.request'] as object),
      functional: '[view]',
      status: 'Inactive',
    });
    expect(r.saved).toHaveBeenCalledWith({ mode: 'edit', screenName: 'Example Screen' });
  });

  it('shows a duplicate name (40301) on the name field and keeps the drawer open', async () => {
    const r = await render('add', null);
    await fillAll(r);
    r.api.add.mockReturnValue(
      throwError(() => new ApiException({ kind: 'already-existed', message: null })),
    );
    await r.click(r.id('drawer-save'));
    expect(r.q('[data-testid="err-screenName"]')!.textContent).toContain('already in use');
    expect(r.saved).not.toHaveBeenCalled();
    await r.fill('#m-n', 'Another');
    expect(r.q('[data-testid="err-screenName"]')).toBeNull();
  });

  it('shows a save failure in a banner and keeps what was typed', async () => {
    const r = await render('add', null);
    await fillAll(r);
    r.api.add.mockReturnValue(
      throwError(() => new ApiException({ kind: 'server', code: '50001', message: 'Database error' })),
    );
    await r.click(r.id('drawer-save'));
    expect(r.id('drawer-banner')!.textContent).toContain('Database error');
    expect((r.q('#m-u') as HTMLInputElement).value).toBe('/screen-1');
    expect(r.id('drawer-save')!.disabled).toBe(false);
  });
});
