import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { routes } from '../../app.routes';
import { RoleRecord, UamRoleItem, UserListItem } from '../../shared/interfaces';
import { RoleApi } from '../api/role-api';
import { UserApi } from '../api/user-api';
import { UserPermissionPage } from './user-permission-page';

const uamRole = (id: number, name: string) =>
  ({ id, name, status: 'Active', description: null }) as UamRoleItem;
const user = (id: number, over: Partial<UserListItem> = {}) =>
  ({
    id,
    username: `user${id}`,
    fullname: `User ${id}`,
    firstname: 'User',
    lastname: `${id}`,
    email: `user${id}@example.test`,
    department: id % 2 ? 'Claims' : 'IT',
    phoneNo: null,
    status: 'Active',
    uamRoleId: 1,
    updatedDate: '2026-10-28T00:00:00',
    updatedBy: 'admin',
    ...over,
  }) as UserListItem;
const role = (id: number, over: Partial<RoleRecord> = {}) =>
  ({
    id,
    systemId: 's1',
    systemName: 'Claim System',
    roleName: `Role ${id}`,
    description: null,
    status: 'Active',
    updatedDate: '2026-10-27T00:00:00',
    updatedBy: 'admin',
    ...over,
  }) as RoleRecord;

interface Setup {
  roles?: () => ReturnType<RoleApi['getAll']>;
  users?: () => ReturnType<UserApi['getAll']>;
}

async function open(url: string, setup: Setup = {}) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'setting/users-setting', component: UserPermissionPage }]),
      {
        provide: RoleApi,
        useValue: { getAll: setup.roles ?? (() => of([role(1), role(2, { status: 'Inactive' })])) },
      },
      {
        provide: UserApi,
        useValue: {
          getAll: setup.users ?? (() => of([user(1), user(2), user(3, { status: 'Inactive' })])),
          getUamRoles: () => of([uamRole(1, 'ADMIN')]),
        },
      },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  await harness.fixture.whenStable();
  const el = harness.routeNativeElement as HTMLElement;
  const q = <T extends HTMLElement>(id: string) =>
    el.querySelector(`[data-testid="${id}"]`) as T | null;
  return { harness, el, q };
}

const headers = (el: HTMLElement) =>
  [...el.querySelectorAll('th')].map((th) => th.textContent?.trim());

describe('UserPermissionPage', () => {
  it('is routed at /setting/users-setting for ADMIN only', () => {
    const shell = routes.find((r) => r.path === '')!;
    const route = shell.children!.find((r) => r.path === 'setting/users-setting')!;
    expect(route.canActivate).toHaveLength(1);
  });

  it('opens on Roles first, ahead of Users, with a count on each tab', async () => {
    const { el, q } = await open('/setting/users-setting');
    const tabs = [...el.querySelectorAll('[role="tab"]')].map((t) => t.textContent?.trim());
    expect(tabs).toEqual(['Roles 2', 'Users 3']);
    expect(q('tab-roles')!.getAttribute('aria-selected')).toBe('true');
    expect(q('roles-table')).not.toBeNull();
    expect(q('users-table')).toBeNull();
  });

  it('shows the role columns without any menu/user counts', async () => {
    const { el } = await open('/setting/users-setting#roles');
    expect(headers(el)).toEqual(['Role', 'System', 'Description', 'Status', 'Updated']);
  });

  it('shows the user columns, with the UAM role resolved by id and no system count or last login', async () => {
    const { el } = await open('/setting/users-setting#users');
    expect(headers(el)).toEqual([
      'User',
      'Email',
      'Ext. number',
      'Department',
      'UAM role',
      'Status',
      'Updated',
    ]);
    const firstRow = el.querySelector('tbody tr')!.textContent!;
    expect(firstRow).toContain('User 1');
    expect(firstRow).toContain('user1');
    expect(firstRow).toContain('ADMIN');
    expect(firstRow).toContain('28 Oct 2026');
  });

  it('shows status as dot + text, not a chip', async () => {
    const { el } = await open('/setting/users-setting#users');
    expect(el.querySelector('u-status')).not.toBeNull();
    expect(el.querySelector('.p-tag')).toBeNull();
  });

  it('links names to their View page', async () => {
    const { el } = await open('/setting/users-setting#users');
    const link = el.querySelector('tbody a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/setting/users-setting/users/1');
  });

  it('switching tabs writes the fragment to the URL and survives a reload', async () => {
    const { harness, q } = await open('/setting/users-setting');
    q<HTMLAnchorElement>('tab-users')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Location).path(true)).toBe('/setting/users-setting#users');
    expect(q('users-table')).not.toBeNull();

    // "Refresh": the same URL opened from scratch lands on the same tab.
    await TestBed.inject(Router).navigateByUrl('/setting/users-setting#roles');
    await harness.fixture.whenStable();
    expect(q('roles-table')).not.toBeNull();
  });

  it('filters users by Department / UAM role / Status and Reset clears them', async () => {
    const { harness, el, q } = await open('/setting/users-setting#users');
    const rows = () => el.querySelectorAll('tbody tr').length;
    expect(rows()).toBe(3);

    q('filters-btn')!.click();
    await harness.fixture.whenStable();
    const labels = [...el.querySelectorAll('.u-filters label')].map((l) => l.textContent);
    expect(labels).toEqual(['Department', 'UAM role', 'Status']);

    const status = el.querySelector('#f-status') as HTMLSelectElement;
    status.value = 'Inactive';
    status.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(rows()).toBe(1);

    q('reset-btn')!.click();
    await harness.fixture.whenStable();
    expect(rows()).toBe(3);
  });

  it('shows an error state with Try again that reloads', async () => {
    let fail = true;
    const getAll = vi.fn(() => (fail ? throwError(() => new Error('x')) : of([role(1)])));
    const { harness, el, q } = await open('/setting/users-setting', { roles: getAll });
    expect(q('load-error')).not.toBeNull();
    expect(el.textContent).toContain('We couldn’t load roles');

    fail = false;
    q('retry-btn')!.click();
    await harness.fixture.whenStable();
    expect(q('load-error')).toBeNull();
    expect(q('roles-table')).not.toBeNull();
    expect(getAll).toHaveBeenCalledTimes(2);
  });

  it('shows an empty state when there are no roles yet', async () => {
    const { q } = await open('/setting/users-setting', { roles: () => of([]) });
    expect(q('none-yet')).not.toBeNull();
  });
});
