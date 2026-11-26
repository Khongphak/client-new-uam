import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ApiException } from '../../core/api/api-error';
import { SystemToSystemRecord } from '../../shared/interfaces';
import { fixtures } from '../../../testing/fixtures';
import { SystemApi } from '../api/system-api';
import { S2SDrawer, S2SDrawerMode, S2SSystemOption } from './s2s-drawer';

const A = '00000000-0000-4000-8000-000000000001';
const B = '00000000-0000-4000-8000-000000000002';
const SYSTEMS: S2SSystemOption[] = [
  { id: A, name: 'Claim System', active: true },
  { id: B, name: 'Policy Admin', active: true },
  { id: 'OFF', name: 'Old System', active: false },
];
const RECORD: SystemToSystemRecord = {
  sourceSystemUUId: A,
  targetSystemUUId: B,
  sourceSystemName: 'Claim System',
  targetSystemName: 'Policy Admin',
  accessTokenTime: 30,
  status: 'Active',
};

async function render(mode: S2SDrawerMode, id: number | null = 5) {
  const api = {
    getSystemToSystemById: vi.fn(() => of(RECORD)),
    addSystemToSystem: vi.fn(() => of(undefined)),
    updateSystemToSystem: vi.fn(() => of(undefined)),
  };
  TestBed.configureTestingModule({ providers: [{ provide: SystemApi, useValue: api }] });
  const fixture = TestBed.createComponent(S2SDrawer);
  fixture.componentRef.setInput('mode', mode);
  fixture.componentRef.setInput('connectionId', id);
  fixture.componentRef.setInput('systems', SYSTEMS);
  fixture.componentRef.setInput('updated', '28 Oct 2026 by somchai.k');
  const closed = vi.fn();
  const saved = vi.fn();
  const editRequested = vi.fn();
  fixture.componentInstance.closed.subscribe(closed);
  fixture.componentInstance.saved.subscribe(saved);
  fixture.componentInstance.editRequested.subscribe(editRequested);
  await fixture.whenStable();
  const q = <T extends HTMLElement>(sel: string) => document.body.querySelector(sel) as T | null;
  const id$ = (testid: string) => q<HTMLButtonElement>(`[data-testid="${testid}"]`);
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
  return { fixture, api, q, id: id$, fill, click, closed, saved, editRequested };
}

describe('S2SDrawer', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('views a connection: source, target, token time, updated, Close and Edit (TC-SYS-007)', async () => {
    const r = await render('view');
    expect(r.api.getSystemToSystemById).toHaveBeenCalledWith(5);
    const text = r.id('s2s-drawer')!.textContent!;
    expect(text).toContain('Claim System');
    expect(text).toContain('Policy Admin');
    expect(text).toContain('30 min');
    expect(text).toContain('28 Oct 2026 by somchai.k');
    expect(document.body.textContent).toContain('Claim System');
    await r.click(r.id('drawer-edit'));
    expect(r.editRequested).toHaveBeenCalled();
    await r.click(r.id('drawer-close'));
    expect(r.closed).toHaveBeenCalled();
  });

  it('says so when the load fails and retries', async () => {
    const r = await render('view');
    r.api.getSystemToSystemById.mockReturnValue(throwError(() => new Error('boom')) as never);
    r.fixture.componentRef.setInput('connectionId', 6);
    await r.fixture.whenStable();
    expect(r.id('s2s-drawer')!.textContent).toContain('Couldn’t load this record');
    r.api.getSystemToSystemById.mockReturnValue(of(RECORD));
    await r.click(r.id('drawer-retry'));
    expect(r.id('s2s-drawer')!.textContent).toContain('30 min');
  });

  it('adds: offers only active systems, saves the fixture payload and reports the names', async () => {
    const r = await render('add', null);
    expect(r.api.getSystemToSystemById).not.toHaveBeenCalled();
    expect(document.body.querySelectorAll('#x-s option')).toHaveLength(3); // placeholder + 2 active
    await r.fill('#x-s', A);
    await r.fill('#x-t', B);
    await r.fill('#x-k', '30');
    await r.click(r.id('drawer-save'));
    expect(r.api.addSystemToSystem).toHaveBeenCalledWith(fixtures['add-system-to-system.request']);
    expect(r.saved).toHaveBeenCalledWith({
      mode: 'add',
      sourceName: 'Claim System',
      targetName: 'Policy Admin',
      accessTokenTime: 30,
    });
  });

  it('does not save an incomplete form and says what is missing', async () => {
    const r = await render('add', null);
    await r.click(r.id('drawer-save'));
    expect(r.api.addSystemToSystem).not.toHaveBeenCalled();
    expect(r.q('[data-testid="err-sourceSystemUUId"]')!.textContent).toContain('Required');
    expect(r.q('[data-testid="err-targetSystemUUId"]')!.textContent).toContain('Required');
    expect(r.q('[data-testid="err-accessTokenTime"]')!.textContent).toContain('Required');
  });

  it('edits: prefills, keeps an inactive current system selectable, sends id + Active switch (TC-SYS-007)', async () => {
    const r = await render('edit');
    r.api.getSystemToSystemById.mockReturnValue(of({ ...RECORD, targetSystemUUId: 'OFF' }));
    r.fixture.componentRef.setInput('connectionId', 7);
    await r.fixture.whenStable();
    expect((r.q('#x-t') as HTMLSelectElement).value).toBe('OFF');
    r.api.getSystemToSystemById.mockReturnValue(of(RECORD));
    r.fixture.componentRef.setInput('connectionId', 5);
    await r.fixture.whenStable();
    expect((r.q('#x-s') as HTMLSelectElement).value).toBe(A);
    expect((r.q('#x-k') as HTMLInputElement).value).toBe('30');
    await r.fill('#x-k', '45');
    (r.q('input[role="switch"]') as HTMLInputElement).click();
    await r.fixture.whenStable();
    await r.click(r.id('drawer-save'));
    expect(r.api.updateSystemToSystem).toHaveBeenCalledWith({
      ...(fixtures['update-system-to-system.request'] as object),
      accessTokenTime: 45,
    });
    expect(r.saved).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'edit', accessTokenTime: 45 }),
    );
  });

  it('shows a duplicate pair (40301) on the target field and keeps the drawer open', async () => {
    const r = await render('add', null);
    await r.fill('#x-s', A);
    await r.fill('#x-t', B);
    await r.fill('#x-k', '30');
    r.api.addSystemToSystem.mockReturnValue(
      throwError(() => new ApiException({ kind: 'already-existed', message: null })) as never,
    );
    await r.click(r.id('drawer-save'));
    expect(r.q('[data-testid="err-targetSystemUUId"]')!.textContent).toContain('already exists');
    expect(r.saved).not.toHaveBeenCalled();
    await r.fill('#x-t', A);
    expect(r.q('[data-testid="err-targetSystemUUId"]')).toBeNull();
  });

  it('shows a save failure in a banner and keeps what was typed', async () => {
    const r = await render('add', null);
    await r.fill('#x-s', A);
    await r.fill('#x-t', B);
    await r.fill('#x-k', '30');
    r.api.addSystemToSystem.mockReturnValue(
      throwError(
        () => new ApiException({ kind: 'server', code: '50001', message: 'Database error' }),
      ) as never,
    );
    await r.click(r.id('drawer-save'));
    expect(r.id('drawer-banner')!.textContent).toContain('Database error');
    expect((r.q('#x-k') as HTMLInputElement).value).toBe('30');
    expect(r.id('drawer-save')!.disabled).toBe(false);
  });
});
