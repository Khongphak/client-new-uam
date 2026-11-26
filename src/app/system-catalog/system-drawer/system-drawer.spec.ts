import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ApiException } from '../../core/api/api-error';
import { SystemRecord } from '../../shared/interfaces';
import { fixtures } from '../../../testing/fixtures';
import { MasterDataApi } from '../api/master-data-api';
import { SystemApi } from '../api/system-api';
import { SystemDrawer, SystemDrawerMode } from './system-drawer';

const RECORD = {
  ...(fixtures['update-system.request'] as object),
  status: 'Active',
  authenrizationType: null,
  icon: null,
} as unknown as SystemRecord;

async function render(mode: SystemDrawerMode, systemId: string | null = RECORD.systemId) {
  const api = {
    getById: vi.fn(() => of([RECORD])),
    add: vi.fn(() => of(undefined)),
    update: vi.fn(() => of(undefined)),
  };
  const master = {
    getGeneralData: vi.fn(() => of([{ value: 'Web Application' }, { value: 'Mobile Application' }])),
    getIcons: vi.fn(() =>
      of([
        { id: 1, category: 'Systems', name: 'Shield', data: 'PHN2Zy8+' },
        { id: 2, category: 'Menu', name: 'Doc', data: 'PHN2Zy8+' },
      ]),
    ),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: SystemApi, useValue: api },
      { provide: MasterDataApi, useValue: master },
    ],
  });
  const fixture = TestBed.createComponent(SystemDrawer);
  fixture.componentRef.setInput('mode', mode);
  fixture.componentRef.setInput('systemId', systemId);
  fixture.componentRef.setInput('owners', ['Test Owner', 'Agency']);
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
  return { fixture, api, master, q, id, fill, click, closed, saved, editRequested };
}

async function fillAll(r: Awaited<ReturnType<typeof render>>) {
  await r.fill('#f-n', '  Example System A  ');
  await r.fill('#f-t', 'Web Application');
  await r.fill('#f-o', 'Test Owner');
  await r.fill('#f-d', 'Example');
  await r.fill('#f-u', 'https://system-a.example.test/');
  await r.fill('#f-k', '30');
  await r.fill('#f-r', '60');
  await r.click(r.q('.ic-opt'));
}

describe('SystemDrawer', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('views a record: title, facts, Close and Edit', async () => {
    const r = await render('view');
    expect(r.api.getById).toHaveBeenCalledWith(RECORD.systemId);
    const text = r.id('system-drawer')!.textContent!;
    expect(text).toContain(RECORD.systemId);
    expect(text).toContain('Test Owner');
    expect(text).toContain('30 min');
    expect(text).toContain('60 min');
    expect(document.body.textContent).toContain('Example System A');
    await r.click(r.id('drawer-edit'));
    expect(r.editRequested).toHaveBeenCalled();
    await r.click(r.id('drawer-close'));
    expect(r.closed).toHaveBeenCalled();
  });

  it('says so when the record does not exist (no full-page 404)', async () => {
    const r = await render('view', 'nope');
    r.api.getById.mockReturnValue(of([]));
    r.fixture.componentRef.setInput('systemId', 'nope2');
    await r.fixture.whenStable();
    expect(r.id('system-drawer')!.textContent).toContain('This record doesn’t exist');
    expect(r.id('drawer-edit')).toBeNull();
  });

  it('shows a load error with Try again instead of an empty form', async () => {
    const r = await render('edit', 'x');
    r.api.getById.mockReturnValue(throwError(() => new Error('boom')));
    r.fixture.componentRef.setInput('systemId', 'y');
    await r.fixture.whenStable();
    expect(r.id('system-drawer')!.textContent).toContain('Couldn’t load this record');
    expect(r.id('drawer-save')).toBeNull();
    r.api.getById.mockReturnValue(of([RECORD]));
    await r.click(r.id('drawer-retry'));
    expect(r.id('drawer-save')).not.toBeNull();
  });

  it('adds a system with the token times and trims the name; the fixture payload is sent', async () => {
    const r = await render('add', null);
    expect(r.q('#f-id')).toBeNull();
    // only icons of category "Systems"
    expect(document.body.querySelectorAll('.ic-opt')).toHaveLength(1);
    await fillAll(r);
    await r.click(r.id('drawer-save'));
    expect(r.api.add).toHaveBeenCalledWith(fixtures['add-system.request']);
    expect(r.saved).toHaveBeenCalledWith({
      mode: 'add',
      systemName: 'Example System A',
      accessTokenTime: 30,
      refreshTokenTime: 60,
    });
  });

  it('does not save an incomplete form and explains what is missing', async () => {
    const r = await render('add', null);
    await r.click(r.id('drawer-save'));
    expect(r.api.add).not.toHaveBeenCalled();
    expect(r.q('[data-testid="err-systemName"]')!.textContent).toContain('Required');
    expect(r.q('.icongrid + .err, .field .err')).not.toBeNull();
    expect(document.body.textContent).toContain('Pick an icon to save.');
    await r.fill('#f-k', '10000');
    expect(document.body.textContent).toContain('At most 9999 minutes');
  });

  it('edits: echoes id / systemId / audit fields and sends the Active switch as status', async () => {
    const r = await render('edit');
    expect((r.q('#f-n') as HTMLInputElement).value).toBe('Example System A');
    expect((r.q('#f-id') as HTMLInputElement).disabled).toBe(true);
    await r.fill('#f-k', '45');
    (r.q('input[role="switch"]') as HTMLInputElement).click();
    await r.fixture.whenStable();
    await r.click(r.id('drawer-save'));
    expect(r.api.update).toHaveBeenCalledWith({
      ...(fixtures['update-system.request'] as object),
      accessTokenTime: 45,
      status: 'Inactive',
    });
    expect(r.saved).toHaveBeenCalledWith(expect.objectContaining({ mode: 'edit' }));
  });

  it('shows a duplicate name (40301) on the name field and keeps the drawer open', async () => {
    const r = await render('add', null);
    await fillAll(r);
    r.api.add.mockReturnValue(
      throwError(() => new ApiException({ kind: 'already-existed', message: null })),
    );
    await r.click(r.id('drawer-save'));
    expect(r.q('[data-testid="err-systemName"]')!.textContent).toContain('already in use');
    expect(r.saved).not.toHaveBeenCalled();
    expect(r.id('drawer-banner')).toBeNull();
    await r.fill('#f-n', 'Another');
    expect(r.q('[data-testid="err-systemName"]')).toBeNull();
  });

  it('shows a save failure in a banner and keeps what was typed', async () => {
    const r = await render('add', null);
    await fillAll(r);
    r.api.add.mockReturnValue(
      throwError(() => new ApiException({ kind: 'server', code: '50001', message: 'Database error' })),
    );
    await r.click(r.id('drawer-save'));
    expect(r.id('drawer-banner')!.textContent).toContain('Database error');
    expect((r.q('#f-u') as HTMLInputElement).value).toBe('https://system-a.example.test/');
    expect(r.id('drawer-save')!.disabled).toBe(false);
  });
});
