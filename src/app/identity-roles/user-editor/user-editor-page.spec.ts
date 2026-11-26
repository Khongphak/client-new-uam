import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { RoleRecord, UamRoleItem, UserRecord } from '../../shared/interfaces';
import { RoleApi } from '../api/role-api';
import { UserApi } from '../api/user-api';
import { UserEditorPage } from './user-editor-page';

const user = {
  id: 7,
  username: 'nattaya.p',
  fullname: 'Nattaya Prasert',
  firstname: 'Nattaya',
  lastname: 'Prasert',
  email: 'n@example.test',
  department: 'Claims',
  position: 'Officer',
  phoneNo: '2241',
  isSuperAdmin: false,
  status: 'Active',
  uamRoleId: 1,
  uamRoleName: 'USER',
  manager: '[Somchai K]',
  systemRoles: [
    { userSystemId: 11, systemId: 's1', systemName: 'Claim System', roleId: 5, roleName: 'Officer' },
  ],
} as unknown as UserRecord;
const uamRoles = [
  { id: 1, name: 'USER', status: 'Active', description: 'Opens systems' },
  { id: 2, name: 'ADMIN', status: 'Active', description: null },
] as UamRoleItem[];
const roles = [
  { id: 5, systemId: 's1', systemName: 'Claim System', roleName: 'Officer', status: 'Active' },
  { id: 6, systemId: 's1', systemName: 'Claim System', roleName: 'Approver', status: 'Active' },
] as RoleRecord[];

async function open() {
  const update = vi.fn(() => of(undefined));
  const search = vi.fn(() =>
    of([
      {
        username: 'nattaya.p',
        fullName: 'Nattaya P',
        firstName: 'Nat',
        lastName: 'P',
        email: 'ad@example.test',
        phoneNo: null,
        department: 'IT',
        position: 'Dev',
        managers: [{ name: 'M One' }, { name: 'M Two' }],
      },
    ]),
  );
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'setting/users-setting/users/:id/edit', component: UserEditorPage },
        { path: 'setting/users-setting', children: [] },
      ]),
      {
        provide: UserApi,
        useValue: {
          getById: () => of(user),
          getUamRoles: () => of(uamRoles),
          searchActiveDirectory: search,
          update,
        },
      },
      {
        provide: RoleApi,
        useValue: { getAll: () => of(roles), getRoleMenus: () => of([]) },
      },
    ],
  });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl('/setting/users-setting/users/7/edit', UserEditorPage);
  const el = harness.routeNativeElement as HTMLElement;
  const q = <T extends HTMLElement>(id: string) => el.querySelector<T>(`[data-testid="${id}"]`)!;
  const flush = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  return { el, q, flush, update, search, harness };
}

describe('UserEditorPage', () => {
  it('shows three tabs and keeps Save closed until something changes (TC-USR-007)', async () => {
    const { q, flush } = await open();
    await flush();
    expect(q('tab-profile').textContent).toContain('Profile & access');
    expect(q('tab-systems').textContent).toContain('Systems & roles');
    expect(q('tab-preview').textContent).toContain('Permission preview');
    expect(q<HTMLButtonElement>('save').disabled).toBe(true);
    expect(q('changes-text').textContent).toContain('No changes yet');

    q<HTMLInputElement>('switch-active').querySelector('input')!.click();
    await flush();
    expect(q<HTMLButtonElement>('save').disabled).toBe(false);
    expect(q('changes-text').textContent).toContain('1 unsaved change');

    q<HTMLInputElement>('switch-active').querySelector('input')!.click();
    await flush();
    expect(q<HTMLButtonElement>('save').disabled).toBe(true);
  });

  it('fills the profile from the first AD hit, read-only, with up to three approvers (TC-USR-008)', async () => {
    const { el, q, flush, search } = await open();
    await flush();
    q<HTMLButtonElement>('ad-lookup').click();
    await flush();
    expect(search).toHaveBeenCalledWith('nattaya.p');
    expect(q('ad-found')).toBeTruthy();
    const email = el.querySelector<HTMLInputElement>('#p5')!;
    expect(email.value).toBe('ad@example.test');
    expect(email.readOnly).toBe(true);
    expect(el.querySelectorAll('u-approvers li b').length).toBe(2);
    expect(q<HTMLButtonElement>('save').disabled).toBe(false);
  });

  it('sends the update body in the existing shape and returns to #users on success', async () => {
    const { q, flush, update, harness } = await open();
    await flush();
    q<HTMLInputElement>('uam-ADMIN').click();
    await flush();
    q<HTMLButtonElement>('save').click();
    await flush();
    const [id, body] = update.mock.calls[0] as unknown as [number, Record<string, unknown>];
    expect(id).toBe(7);
    expect(body).toMatchObject({
      username: 'nattaya.p',
      fullName: 'Nattaya Prasert',
      uamRoleId: 2,
      isSuperAdmin: false,
      status: 'Active',
      manager: '[Somchai K]',
      systemRoles: [
        { userSystemId: 11, systemId: 's1', systemName: 'Claim System', roleId: 5, roleName: 'Officer' },
      ],
    });
    expect(TestBed.inject(Router).url).toBe('/setting/users-setting#users');
    expect(harness).toBeTruthy();
  });

  it('blocks Save while a system row is incomplete', async () => {
    const { q, flush } = await open();
    await flush();
    q('tab-systems').click();
    await flush();
    q('add-system').click();
    await flush();
    expect(q<HTMLButtonElement>('save').disabled).toBe(true);
    expect(q('changes-text').textContent).toContain('Complete or remove');
  });
});
