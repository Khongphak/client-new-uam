import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Session } from '../session';
import { HttpErrorDialogState } from './http-error-dialog';
import { HttpErrorDialogs } from './http-error-dialogs';

describe('HttpErrorDialogs', () => {
  const q = (id: string) => document.body.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  let state: HttpErrorDialogState;
  let session: Session;
  let router: Router;
  let fixture: ReturnType<typeof TestBed.createComponent<HttpErrorDialogs>>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(HttpErrorDialogs);
    state = TestBed.inject(HttpErrorDialogState);
    session = TestBed.inject(Session);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    await fixture.whenStable();
  });
  afterEach(() => fixture.destroy());

  it('renders nothing when there is no error', () => {
    expect(q('u-dialog-heading')).toBeNull();
  });

  it('session expired: dialog, then Log in again clears the session and goes to /login', async () => {
    session.signIn('u', 's');
    session.markExpired();
    await fixture.whenStable();
    expect(q('u-dialog-heading')?.textContent).toContain('Your session has expired');
    q('dlg-login')!.querySelector('button')!.click();
    expect(session.expired()).toBe(false);
    expect(session.userType()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('network: heading, Close dismisses', async () => {
    state.show({ kind: 'network' });
    await fixture.whenStable();
    expect(q('u-dialog-heading')?.textContent).toContain('Can’t reach the server');
    expect(q('u-dialog-detail')?.textContent).toContain('Network error');
    q('dlg-close')!.querySelector('button')!.click();
    await fixture.whenStable();
    expect(state.current()).toBeNull();
    expect(q('u-dialog-heading')).toBeNull();
  });

  it('server: shows code and the message the server sent', async () => {
    state.show({ kind: 'server', code: '50001', message: 'Database error' });
    await fixture.whenStable();
    expect(q('u-dialog-heading')?.textContent).toContain('Something went wrong');
    expect(q('u-dialog-detail')?.textContent).toContain('50001 · Database error');
  });

  it('session dialog wins over a pending network dialog', async () => {
    state.show({ kind: 'network' });
    session.markExpired();
    await fixture.whenStable();
    expect(q('u-dialog-heading')?.textContent).toContain('Your session has expired');
  });
});
