import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CLIENT_ID } from '../../core/api/api-config';
import { Session } from '../../core/session';
import { Consent, ConsentAcceptRequest, LogoutRequest } from '../../shared/interfaces';
import { AuthApi } from '../api/auth-api';
import { ConsentApi } from '../api/consent-api';
import { ConsentPage } from './consent-page';

const consent: Consent = {
  id: 7,
  name: 'PDPA',
  title: '<p>Personal data <b>notice</b></p>',
  description: '<p>Body text</p><script>window.__xss = 1</script>',
  version: '1.0',
  effectiveDate: '2025-01-01T00:00:00',
  status: 'Active',
  createdDate: '2025-01-01T00:00:00',
  createdBy: 'System',
  updatedDate: '2025-01-01T00:00:00',
  updatedBy: 'System',
};

describe('ConsentPage', () => {
  let getLatestVersion: ReturnType<typeof vi.fn<() => Observable<Consent>>>;
  let accept: ReturnType<typeof vi.fn<(r: ConsentAcceptRequest) => Observable<void>>>;
  let logout: ReturnType<typeof vi.fn<(r: LogoutRequest) => Observable<void>>>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getLatestVersion = vi.fn(() => of(consent));
    accept = vi.fn(() => of(undefined));
    logout = vi.fn(() => of(undefined));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ConsentApi, useValue: { getLatestVersion, accept } },
        { provide: AuthApi, useValue: { logout } },
        { provide: CLIENT_ID, useValue: 'client-1' },
      ],
    });
    TestBed.inject(Session).signIn('AD', 'sess-1', {
      userId: 1,
      userName: 'somchai.k',
      firstName: 'Somchai',
      lastName: 'K',
      position: 'Tester',
      uamRole: 'ADMIN',
      systemAdmin: false,
      userType: 'AD',
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  async function render() {
    const fixture = TestBed.createComponent(ConsentPage);
    await fixture.whenStable();
    const q = <T extends HTMLElement>(id: string) =>
      fixture.nativeElement.querySelector(`[data-testid="${id}"]`) as T;
    const click = async (el: HTMLElement) => {
      el.click();
      await fixture.whenStable();
    };
    return { fixture, q, click };
  }
  const dialogBtn = (id: string) =>
    document.querySelector<HTMLElement>(`[data-testid="${id}"]`) as HTMLElement;

  it('shows the signed-in user, the sanitized server text, and Agree disabled until ticked (TC-AUT-004)', async () => {
    const { q, click, fixture } = await render();
    expect(fixture.nativeElement.textContent).toContain('Somchai K');
    expect(fixture.nativeElement.textContent).toContain('ADMIN');
    expect(q('consent-text').innerHTML).toContain('<b>notice</b>');
    expect(q('consent-text').innerHTML).not.toContain('<script');
    expect(q<HTMLButtonElement>('consent-agree').disabled).toBe(true);
    await click(q('consent-check').querySelector('input') as HTMLElement);
    expect(q<HTMLButtonElement>('consent-agree').disabled).toBe(false);
    await click(q('consent-check').querySelector('input') as HTMLElement);
    expect(q<HTMLButtonElement>('consent-agree').disabled).toBe(true);
    expect(accept).not.toHaveBeenCalled();
  });

  it('sends the unchanged accept payload then goes to /home', async () => {
    const { q, click } = await render();
    await click(q('consent-check').querySelector('input') as HTMLElement);
    await click(q('consent-agree'));
    expect(accept).toHaveBeenCalledTimes(1);
    const body = accept.mock.calls[0][0];
    expect(body).toMatchObject({ username: 'somchai.k', consentId: 7, acceptedFlag: 'Y' });
    expect(body.acceptedDate).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);
    expect(navigate).toHaveBeenCalledWith('/home');
  });

  it('keeps the user on the page with an alert when accepting fails, and allows a retry', async () => {
    accept.mockReturnValueOnce(throwError(() => new Error('boom')));
    const { q, click, fixture } = await render();
    await click(q('consent-check').querySelector('input') as HTMLElement);
    await click(q('consent-agree'));
    expect(navigate).not.toHaveBeenCalled();
    expect(q('consent-error').getAttribute('role')).toBe('alert');
    await click(q('consent-agree'));
    expect(accept).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenCalledWith('/home');
    fixture.destroy();
  });

  it('does not double-submit while the accept call is pending', async () => {
    accept.mockReturnValue(new Subject<void>());
    const { q, click } = await render();
    await click(q('consent-check').querySelector('input') as HTMLElement);
    await click(q('consent-agree'));
    await click(q('consent-agree'));
    expect(accept).toHaveBeenCalledTimes(1);
  });

  it('shows an error state with retry when the text cannot load, and agree stays disabled', async () => {
    getLatestVersion.mockReturnValueOnce(throwError(() => new Error('down')));
    const { q, click, fixture } = await render();
    expect(q('consent-load-error')).not.toBeNull();
    expect(q<HTMLButtonElement>('consent-agree').disabled).toBe(true);
    await click(q('consent-retry'));
    expect(q('consent-text')).not.toBeNull();
    expect(getLatestVersion).toHaveBeenCalledTimes(2);
    fixture.destroy();
  });

  it('Decline asks first; Go back keeps the session (TC-AUT-005)', async () => {
    const { q, click, fixture } = await render();
    await click(q('consent-decline'));
    expect(document.body.textContent).toContain('Decline and sign out?');
    expect(logout).not.toHaveBeenCalled();
    await click(dialogBtn('consent-decline-back'));
    expect(logout).not.toHaveBeenCalled();
    expect(TestBed.inject(Session).profile()).not.toBeNull();
    expect(navigate).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('confirming Decline logs out with the unchanged payload, clears the session and goes to /login', async () => {
    const { q, click, fixture } = await render();
    await click(q('consent-decline'));
    await click(dialogBtn('consent-decline-confirm'));
    expect(logout).toHaveBeenCalledExactlyOnceWith({ Username: 'somchai.k', ClientId: 'client-1' });
    expect(TestBed.inject(Session).profile()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
    fixture.destroy();
  });

  it('still signs out locally when the logout call fails', async () => {
    logout.mockReturnValue(throwError(() => new Error('net')));
    const { q, click, fixture } = await render();
    await click(q('consent-decline'));
    await click(dialogBtn('consent-decline-confirm'));
    expect(TestBed.inject(Session).profile()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
    fixture.destroy();
  });

  it('without a session it sends the user to /login and calls nothing', async () => {
    TestBed.inject(Session).clear();
    await render();
    expect(navigate).toHaveBeenCalledWith('/login');
    expect(getLatestVersion).not.toHaveBeenCalled();
  });
});
