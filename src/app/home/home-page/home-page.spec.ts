import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ErrorHandler, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { HomeApi } from '../../access/api/home-api';
import { routes } from '../../app.routes';
import { errorDialogInterceptor } from '../../core/api/http-error-dialog';
import { HttpErrorDialogs } from '../../core/api/http-error-dialogs';
import { Session } from '../../core/session';
import { UserProfile, UserSystemItem } from '../../shared/interfaces';
import { HomePage } from './home-page';

const profile: UserProfile = {
  userId: 1,
  userName: 'dev.user',
  firstName: 'Somchai',
  lastName: 'T',
  position: 'Dev',
  uamRole: 'DEVELOPER',
  systemAdmin: false,
  userType: 'AD',
};

const item = (over: Partial<UserSystemItem>): UserSystemItem => ({
  id: 1,
  username: 'dev.user',
  systemId: 's1',
  systemName: 'Claim System',
  systemUrl: 'https://claim.example.test/',
  systemType: 'Web',
  description: 'Register claims',
  ownerName: 'Claims Dept.',
  imageId: null,
  data: null,
  image: null,
  status: 'Active',
  ...over,
});

async function render(items: UserSystemItem[]) {
  const getUserSystems = vi.fn(() => of(items));
  TestBed.configureTestingModule({
    providers: [{ provide: HomeApi, useValue: { getUserSystems } }],
  });
  sessionStorage.clear(); // Session persists across reloads (UAM-AUT-03)
  TestBed.inject(Session).signIn('AD', 'sid', profile);
  const fixture = TestBed.createComponent(HomePage);
  await fixture.whenStable();
  return { el: fixture.nativeElement as HTMLElement, getUserSystems };
}

describe('HomePage', () => {
  it('loads the systems of the signed-in user and greets them', async () => {
    const { el, getUserSystems } = await render([item({})]);
    expect(getUserSystems).toHaveBeenCalledWith('dev.user');
    expect(el.querySelector('h1')?.textContent).toContain('Welcome back, Somchai');
  });

  it('renders one card per system with name, description, owner and type', async () => {
    const { el } = await render([
      item({}),
      item({
        id: 2,
        systemId: 's2',
        systemName: 'Field App',
        systemType: 'Mobile',
        description: null,
        ownerName: null,
      }),
    ]);
    const cards = el.querySelectorAll('[uSysCard]');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('Claim System');
    expect(cards[0].textContent).toContain('Register claims');
    expect(cards[0].textContent).toContain('Claims Dept.');
    expect(cards[0].textContent).toContain('Web');
    expect(cards[0].getAttribute('href')).toBe('https://claim.example.test/');
    expect(cards[0].getAttribute('target')).toBe('_blank');
    expect(cards[1].textContent).toContain('Mobile');
  });

  it('shows the base64 image when present, otherwise a fallback icon', async () => {
    const { el } = await render([item({ data: 'AAAA' }), item({ id: 2 })]);
    const cards = el.querySelectorAll('[uSysCard]');
    expect(cards[0].querySelector('img')?.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    expect(cards[1].querySelector('img')).toBeNull();
    expect(cards[1].querySelector('i.pi')).not.toBeNull();
  });

  it('is registered at /home inside the shell', () => {
    const shell = routes.find((r) => r.path === '' && r.children);
    expect(shell?.children?.some((r) => r.path === 'home')).toBe(true);
  });
});

describe('HomePage when the systems request fails (UAM-ERR-09)', () => {
  it('opens the error dialog by itself, without throwing while rendering', async () => {
    sessionStorage.clear();
    const errors: unknown[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorDialogInterceptor])),
        provideHttpClientTesting(),
        { provide: ErrorHandler, useValue: { handleError: (e: unknown) => errors.push(e) } },
        {
          provide: HomeApi,
          useFactory: () => {
            const http = inject(HttpClient);
            return { getUserSystems: () => http.get<UserSystemItem[]>('/systems') };
          },
        },
      ],
    });
    TestBed.inject(Session).signIn('AD', 'sid', profile);
    const page = TestBed.createComponent(HomePage);
    page.detectChanges();
    // Created last: TestBed keeps only the newest root element attached to the document.
    const dialogs = TestBed.createComponent(HttpErrorDialogs);
    TestBed.inject(HttpTestingController)
      .expectOne('/systems')
      .error(new ProgressEvent('error'), { status: 0 });
    await page.whenStable();
    await dialogs.whenStable();

    expect(errors).toEqual([]);
    await vi.waitFor(() =>
      expect(
        document.body.querySelector('[data-testid="u-dialog-heading"]')?.textContent,
      ).toContain('Can’t reach the server'),
    );
    dialogs.destroy();
  });
});
