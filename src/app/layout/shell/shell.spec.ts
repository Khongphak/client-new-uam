import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { UserProfile } from '../../shared/interfaces';
import { Shell } from './shell';
import { SHELL_PROFILE } from './shell-profile';

@Component({ template: '<p data-testid="page">page</p>' })
class Page {}

type Handler = (e: { matches: boolean }) => void;

class FakeMediaQuery {
  private readonly handlers = new Set<Handler>();
  constructor(
    readonly media: string,
    public matches: boolean,
  ) {}
  addListener(h: Handler) {
    this.handlers.add(h);
  }
  removeListener(h: Handler) {
    this.handlers.delete(h);
  }
  addEventListener(_: string, h: Handler) {
    this.handlers.add(h);
  }
  removeEventListener(_: string, h: Handler) {
    this.handlers.delete(h);
  }
  set(matches: boolean) {
    this.matches = matches;
    this.handlers.forEach((h) => h({ matches }));
  }
}

const profile: UserProfile = {
  userId: 1,
  userName: 'somchai.j',
  firstName: 'Somchai',
  lastName: 'Jaidee',
  position: 'Manager',
  uamRole: 'ADMIN',
  systemAdmin: false,
  userType: 'AD',
};

describe('Shell', () => {
  let queries: FakeMediaQuery[];
  let phone: boolean;
  const original = window.matchMedia;

  async function setup(p: UserProfile | null = profile) {
    queries = [];
    window.matchMedia = ((q: string) => {
      const mq = new FakeMediaQuery(q, phone);
      queries.push(mq);
      return mq;
    }) as unknown as typeof window.matchMedia;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            component: Shell,
            children: [
              { path: 'home', component: Page },
              { path: 'setting/system-setting', component: Page },
            ],
          },
        ]),
        { provide: SHELL_PROFILE, useValue: () => p },
      ],
    });
    const harness = await RouterTestingHarness.create('/home');
    const fixture = harness.fixture as ComponentFixture<unknown>;
    await fixture.whenStable();
    return { harness, fixture, el: fixture.nativeElement as HTMLElement };
  }

  const q = (el: HTMLElement, id: string) =>
    el.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  const flush = async (f: ComponentFixture<unknown>) => {
    f.detectChanges();
    await f.whenStable();
  };
  // BreakpointObserver debounces changes by a macrotask.
  const settle = (f: ComponentFixture<unknown>) =>
    new Promise<void>((r) => setTimeout(r, 5)).then(() => flush(f));

  beforeEach(() => {
    phone = false;
  });
  afterEach(() => {
    window.matchMedia = original;
  });

  it('renders the topbar title, user name/role and routed content', async () => {
    const { el } = await setup();
    expect(q(el, 'shell-title')?.textContent).toContain('User Access Management');
    expect(q(el, 'shell-user-name')?.textContent).toContain('Somchai');
    expect(q(el, 'shell-user-role')?.textContent).toContain('ADMIN');
    expect(q(el, 'page')).not.toBeNull();
  });

  it('shows "System Admin" as the role of a super admin', async () => {
    const { el } = await setup({ ...profile, systemAdmin: true });
    expect(q(el, 'shell-user-role')?.textContent).toContain('System Admin');
  });

  it('lists menu items for the role and marks the open route', async () => {
    const { el } = await setup();
    expect(q(el, 'menu-report')).not.toBeNull();
    const home = q(el, 'menu-home') as HTMLElement;
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(home.classList).toContain('is-active');
  });

  it('hides Report for a DEVELOPER', async () => {
    const { el } = await setup({ ...profile, uamRole: 'DEVELOPER' });
    expect(q(el, 'menu-report')).toBeNull();
    expect(q(el, 'menu-setting')).not.toBeNull();
  });

  it('expands and collapses the Setting group', async () => {
    const { el, fixture } = await setup();
    const btn = q(el, 'menu-setting') as HTMLButtonElement;
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(q(el, 'menu-system-setting')).toBeNull();
    btn.click();
    await flush(fixture);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(q(el, 'menu-system-setting')).not.toBeNull();
    btn.click();
    await flush(fixture);
    expect(q(el, 'menu-system-setting')).toBeNull();
  });

  it('opens the Setting group when a child route is active', async () => {
    const { harness, el, fixture } = await setup();
    await harness.navigateByUrl('/setting/system-setting');
    await flush(fixture);
    expect(q(el, 'menu-setting')?.getAttribute('aria-expanded')).toBe('true');
    expect(q(el, 'menu-system-setting')?.getAttribute('aria-current')).toBe('page');
  });

  describe('desktop (>= 768px)', () => {
    it('shows the sidebar and toggles it with the menu button', async () => {
      const { el, fixture } = await setup();
      const sidebar = q(el, 'shell-sidebar') as HTMLElement;
      const toggle = q(el, 'shell-menu-toggle') as HTMLButtonElement;
      expect(sidebar.hasAttribute('inert')).toBe(false);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(q(el, 'shell-scrim')).toBeNull();

      toggle.click();
      await flush(fixture);
      expect(sidebar.hasAttribute('inert')).toBe(true);
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      toggle.click();
      await flush(fixture);
      expect(sidebar.hasAttribute('inert')).toBe(false);
    });

    it('watches the 768px breakpoint', async () => {
      await setup();
      expect(queries.some((m) => m.media.includes('767.98px'))).toBe(true);
    });
  });

  describe('phone (< 768px)', () => {
    beforeEach(() => {
      phone = true;
    });

    it('starts with a closed drawer; the button opens it with a scrim', async () => {
      const { el, fixture } = await setup();
      const sidebar = q(el, 'shell-sidebar') as HTMLElement;
      expect(sidebar.hasAttribute('inert')).toBe(true);
      expect(q(el, 'shell-scrim')).toBeNull();

      (q(el, 'shell-menu-toggle') as HTMLButtonElement).click();
      await flush(fixture);
      expect(sidebar.hasAttribute('inert')).toBe(false);
      expect(q(el, 'shell-scrim')).not.toBeNull();
    });

    it('closes the drawer from the scrim, Escape and a menu link', async () => {
      const { el, fixture } = await setup();
      const toggle = q(el, 'shell-menu-toggle') as HTMLButtonElement;
      const sidebar = q(el, 'shell-sidebar') as HTMLElement;

      toggle.click();
      await flush(fixture);
      (q(el, 'shell-scrim') as HTMLElement).click();
      await flush(fixture);
      expect(sidebar.hasAttribute('inert')).toBe(true);

      toggle.click();
      await flush(fixture);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await flush(fixture);
      expect(sidebar.hasAttribute('inert')).toBe(true);

      toggle.click();
      await flush(fixture);
      (q(el, 'menu-home') as HTMLElement).click();
      await flush(fixture);
      expect(sidebar.hasAttribute('inert')).toBe(true);
    });
  });

  it('resets the sidebar when the viewport crosses 768px', async () => {
    const { el, fixture } = await setup();
    const sidebar = q(el, 'shell-sidebar') as HTMLElement;
    expect(sidebar.hasAttribute('inert')).toBe(false);

    queries.forEach((m) => m.set(true));
    await settle(fixture);
    expect(sidebar.hasAttribute('inert')).toBe(true);

    queries.forEach((m) => m.set(false));
    await settle(fixture);
    expect(sidebar.hasAttribute('inert')).toBe(false);
  });

  it('offers Logout in the account menu', async () => {
    const { el, fixture } = await setup();
    expect(el.textContent).not.toContain('Logout');
    (q(el, 'shell-user-toggle') as HTMLButtonElement).click();
    await flush(fixture);
    const logout = q(el, 'shell-logout') as HTMLAnchorElement;
    expect(logout.textContent).toContain('Logout');
    expect(logout.getAttribute('href')).toBe('/login');
  });
});
