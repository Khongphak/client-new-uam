import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { routes } from '../../app.routes';
import { RoleMenuItem, RoleRecord } from '../../shared/interfaces';
import { RoleApi } from '../api/role-api';
import { RoleViewPage } from './role-view-page';

const role = (over: Partial<RoleRecord> = {}) =>
  ({
    id: 7,
    systemId: 's1',
    systemName: 'Claim System',
    roleName: 'Claim Officer',
    description: 'Register and update claims',
    status: 'Active',
    updatedDate: '2026-10-27T10:00:00',
    updatedBy: 'somchai.k',
    ...over,
  }) as RoleRecord;

const leaf = (name: string, permission: string, functional: string, order: number): RoleMenuItem =>
  ({
    roleId: 7,
    roleMenuId: order,
    menuId: order + 100,
    parentId: 0,
    groupName: null,
    screenName: name,
    sortOrder: order,
    permission,
    functional,
    imageGroupId: 0,
    groupMenus: [],
  }) as RoleMenuItem;
const folder = (name: string, kids: RoleMenuItem[], order: number): RoleMenuItem =>
  ({ ...leaf('', '', '', order), menuId: 0, groupName: name, screenName: null, groupMenus: kids });

const TREE = [
  leaf('Payment Status', '[view]', '[view,export]', 1),
  folder('Claims', [leaf('Claim Register', '[view,add]', '[view,add,edit]', 3)], 2),
];

async function open(url: string, api: Partial<RoleApi> = {}) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'setting/users-setting/roles/:id', component: RoleViewPage }]),
      {
        provide: RoleApi,
        useValue: {
          getById: () => of([role()]),
          getRoleMenus: () => of(TREE),
          ...api,
        },
      },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  await harness.fixture.whenStable();
  const el = harness.routeNativeElement as HTMLElement;
  return { el, text: () => el.textContent?.replace(/\s+/g, ' ') ?? '' };
}

describe('RoleViewPage', () => {
  it('is routed at /setting/users-setting/roles/:id for ADMIN only', () => {
    const shell = routes.find((r) => r.path === '')!;
    const route = shell.children!.find((r) => r.path === 'setting/users-setting/roles/:id')!;
    expect(route).toBeDefined();
    expect(route.canActivate?.length).toBe(1);
  });

  it('shows name, status, system, stats and facts of the role', async () => {
    const { el, text } = await open('/setting/users-setting/roles/7');
    expect(el.querySelector('h1')?.textContent).toBe('Claim Officer');
    expect(text()).toContain('Active');
    expect(text()).toContain('Claim System');
    expect([...el.querySelectorAll('u-stats b')].map((b) => b.textContent)).toEqual(['2', '1', '1']);
    expect(text()).toContain('27 Oct 2026 by somchai.k');
    expect(text()).toContain('Register and update claims');
  });

  it('renders menus read-only with ungranted functions crossed out and no edit control', async () => {
    const { el, text } = await open('/setting/users-setting/roles/7');
    expect(text()).toContain('Top level (no group)');
    expect(text()).toContain('Claims');
    const off = [...el.querySelectorAll('u-chip.is-off')].map((c) => c.textContent?.trim());
    expect(off).toEqual(['Export', 'Edit']);
    expect(el.querySelectorAll('input, button, textarea, select').length).toBe(0);
  });

  it('links back to the Roles tab', async () => {
    const { el } = await open('/setting/users-setting/roles/7');
    const href = el.querySelector<HTMLAnchorElement>('[data-testid="u-back"]')!.getAttribute('href');
    expect(href).toBe('/setting/users-setting#roles');
  });

  it('shows not found for an unknown role or a bad id', async () => {
    const empty = await open('/setting/users-setting/roles/9', { getById: () => of([]) });
    expect(empty.el.querySelector('[data-testid="role-not-found"]')).not.toBeNull();
    TestBed.resetTestingModule();
    const bad = await open('/setting/users-setting/roles/abc');
    expect(bad.el.querySelector('[data-testid="role-not-found"]')).not.toBeNull();
  });

  it('shows a retryable error when loading fails', async () => {
    const { el } = await open('/setting/users-setting/roles/7', {
      getRoleMenus: () => throwError(() => new Error('down')),
    });
    expect(el.querySelector('[data-testid="load-error"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="retry-btn"]')).not.toBeNull();
  });
});
