import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { routes } from '../../app.routes';
import { RoleMenuItem, UserRecord, UserRoleDetail } from '../../shared/interfaces';
import { UserApi } from '../api/user-api';
import { TestBed } from '@angular/core/testing';
import { UserViewPage } from './user-view-page';

const record = {
  id: 5,
  username: 'nattaya.p',
  fullname: 'Nattaya Prasert',
  email: 'n@example.test',
  phoneNo: '2241',
  position: 'Claim Officer',
  department: 'Claims',
  isSuperAdmin: false,
  status: 'Active',
  uamRoleName: 'USER',
  manager: '[Somchai Khemthong,Wichai Boonmee]',
  updatedDate: '2026-10-28T09:00:00',
  updatedBy: 'somchai.k',
  systemRoles: [],
} as unknown as UserRecord;

const detail: UserRoleDetail = {
  userId: 5,
  userSystems: [
    {
      id: 1,
      systemId: 's1',
      systemName: 'Claim System',
      roleId: 1,
      roleName: 'Claim Officer',
      menuRoleScreens: [
        {
          roleId: 1, roleMenuId: 1, menuId: 10, parentId: 0, groupName: null, screenName: 'Claim Register',
          sortOrder: 1, permission: '[View,Add]', imageGroupId: 0, groupMenus: [],
        } as RoleMenuItem,
      ],
    },
  ],
};

async function open(url: string, api: Partial<UserApi> = {}) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'setting/users-setting/users/:id', component: UserViewPage }]),
      {
        provide: UserApi,
        useValue: { getById: () => of(record), getRoleDetail: () => of(detail), ...api },
      },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  await harness.fixture.whenStable();
  harness.fixture.detectChanges();
  const el = harness.routeNativeElement as HTMLElement;
  return { el, q: (id: string) => el.querySelector(`[data-testid="${id}"]`) as HTMLElement | null };
}

describe('UserViewPage', () => {
  it('is routed at /setting/users-setting/users/:id', () => {
    const shell = routes.find((r) => r.path === '')!;
    const route = shell.children!.find((r) => r.path === 'setting/users-setting/users/:id')!;
    expect(route.canActivate).toHaveLength(1);
  });

  it('shows header, two-column facts, approvers by name only, and systems with role permissions (TC-USR-005)', async () => {
    const { el, q } = await open('/setting/users-setting/users/5');
    expect(q('user-name')!.textContent).toContain('Nattaya Prasert');
    expect(el.querySelectorAll('u-facts li')).toHaveLength(9);
    expect(el.querySelector('u-facts ul.is-cols')).not.toBeNull();
    const approvers = [...el.querySelectorAll('u-approvers li')].map((li) => li.textContent!.trim());
    expect(approvers).toEqual(['1Somchai Khemthong', '2Wichai Boonmee', '3Not set']);
    expect(el.querySelector('u-approvers input')).toBeNull();
    expect(q('systems')!.textContent).toContain('Claim System');
    expect(q('systems')!.textContent).toContain('Role: Claim Officer · 1 menu');
    expect(q('systems')!.textContent).toContain('Claim Register');
    expect(q('edit-user')!.getAttribute('href')).toBe('/setting/users-setting/users/5/edit');
  });

  it('loads by the id in the URL and keeps the user read-only (no inputs)', async () => {
    const getById = vi.fn(() => of(record));
    const { el } = await open('/setting/users-setting/users/5', { getById });
    expect(getById).toHaveBeenCalledWith(5);
    expect(el.querySelector('input, textarea, select')).toBeNull();
  });

  it('shows not-found for a non-numeric id without calling the API', async () => {
    const getById = vi.fn(() => of(record));
    const { q } = await open('/setting/users-setting/users/abc', { getById });
    expect(q('not-found')).not.toBeNull();
    expect(getById).not.toHaveBeenCalled();
  });

  it('shows an error state with Try again when loading fails, then recovers', async () => {
    let fail = true;
    const { q, el } = await open('/setting/users-setting/users/5', {
      getById: () => (fail ? throwError(() => new Error('x')) : of(record)),
    });
    expect(q('load-error')).not.toBeNull();
    fail = false;
    q('retry-btn')!.click();
    await new Promise((r) => setTimeout(r));
    expect(el.querySelector('[data-testid="user-name"]')).not.toBeNull();
  });
});
