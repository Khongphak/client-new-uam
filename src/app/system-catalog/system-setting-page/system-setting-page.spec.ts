import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { routes } from '../../app.routes';
import { MenuScreenRecord, SystemRecord, SystemToSystemListItem } from '../../shared/interfaces';
import { MenuScreenApi } from '../api/menu-screen-api';
import { SystemApi } from '../api/system-api';
import { SystemSettingPage } from './system-setting-page';

const sys = (id: number, name: string, owner: string, type: string, status = 'Active') =>
  ({
    id,
    systemId: `SYS-00${id}`,
    systemName: name,
    ownerName: owner,
    type,
    status,
    updatedDate: '2026-10-28T09:00:00',
    icon: null,
  }) as SystemRecord;

const SYSTEMS = [
  sys(1, 'Claim System', 'Claims Dept.', 'Web'),
  sys(2, 'Policy Admin', 'Operations', 'Web'),
  sys(3, 'Field Sales App', 'Agency', 'Mobile'),
  sys(4, 'Legacy Billing', 'Finance', 'Web', 'Inactive'),
];
const MENUS = [
  {
    id: 10,
    systemName: 'Claim System',
    screenName: 'Claim Register',
    functional: '[view,add,edit,delete]',
    status: 'Active',
    updatedDate: '2026-10-28T09:00:00',
    image: null,
  },
  {
    id: 11,
    systemName: 'Policy Admin',
    screenName: 'Policy Search',
    functional: '[view]',
    status: 'Inactive',
    updatedDate: '2026-10-28T09:00:00',
    image: null,
  },
] as MenuScreenRecord[];
const S2S = [
  {
    id: 20,
    sourceSystemName: 'Claim System',
    targetSystemName: 'Policy Admin',
    status: 'Active',
    updatedDate: null,
    updatedBy: null,
  },
] as SystemToSystemListItem[];

async function render(fragment?: string, systemsResult = of(SYSTEMS)) {
  const systemApi = {
    getAll: vi.fn(() => systemsResult),
    getAllSystemToSystem: vi.fn(() => of(S2S)),
  };
  const menuApi = { getAll: vi.fn(() => of(MENUS)) };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: SystemApi, useValue: systemApi },
      { provide: MenuScreenApi, useValue: menuApi },
    ],
  });
  if (fragment) await TestBed.inject(Router).navigate([], { fragment });
  const fixture = TestBed.createComponent(SystemSettingPage);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const q = <T extends HTMLElement>(id: string) =>
    el.querySelector(`[data-testid="${id}"]`) as T | null;
  const click = async (id: string) => {
    q(id)!.click();
    await fixture.whenStable();
  };
  const type = async (value: string) => {
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const rows = () => Array.from(el.querySelectorAll('tbody tr'));
  const heads = () => Array.from(el.querySelectorAll('thead th')).map((h) => h.textContent!.trim());
  return { fixture, el, q, click, type, rows, heads, systemApi, menuApi };
}

describe('SystemSettingPage', () => {
  it('is routed at /setting/system-setting behind the role guard', () => {
    const shell = routes.find((r) => r.path === '')!;
    const route = shell.children!.find((r) => r.path === 'setting/system-setting')!;
    expect(route.canActivate).toHaveLength(1);
  });

  it('shows three tabs with counters taken from the loaded rows', async () => {
    const { q } = await render();
    expect(q('tab-system')!.textContent).toContain('System');
    expect(q('count-system')!.textContent!.trim()).toBe('4');
    expect(q('count-menu')!.textContent!.trim()).toBe('2');
    expect(q('count-system-to-system')!.textContent!.trim()).toBe('1');
  });

  it('shows the System columns and a "Showing 1 to X of Y entries" footer', async () => {
    const { el, heads, rows } = await render();
    expect(heads()).toEqual(['System name', 'Owner', 'Type', 'Status', 'Updated', 'Actions']);
    expect(rows()).toHaveLength(4);
    expect(el.textContent).toContain('Showing 1 to 4 of 4 entries');
    expect(rows()[0].textContent).toContain('SYS-001');
    expect(rows()[0].textContent).toContain('28 Oct 2026');
  });

  it('switches to Menu (with functions) and System to System via the URL fragment', async () => {
    const { q, click, heads, rows } = await render();
    await click('tab-menu');
    expect(heads()).toEqual(['Menu name', 'System', 'Functions', 'Status', 'Updated', 'Actions']);
    expect(rows()[0].textContent).toContain('view, add, edit +1');
    expect(q('tab-menu')!.getAttribute('aria-selected')).toBe('true');

    await click('tab-system-to-system');
    expect(heads()).toEqual(['Source system', 'Target system', 'Status', 'Updated', 'Actions']);
    expect(rows()[0].textContent).toContain('Policy Admin');
  });

  it('opens the tab named by the fragment (deep link)', async () => {
    const { q } = await render('menu');
    expect(q('tab-menu')!.getAttribute('aria-selected')).toBe('true');
  });

  it('searches by name without calling the backend again', async () => {
    const { el, type, rows, systemApi } = await render();
    await type('claim');
    expect(rows()).toHaveLength(1);
    expect(el.textContent).toContain('Showing 1 to 1 of 1 entries');
    expect(systemApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('narrows by two filters, then Reset clears search and filters', async () => {
    const { el, q, click, type, rows } = await render();
    await click('filters-btn');
    const set = async (id: string, value: string) => {
      const s = el.querySelector(`#f-${id}`) as HTMLSelectElement;
      s.value = value;
      s.dispatchEvent(new Event('change'));
    };
    await set('type', 'Web');
    await set('status', 'Active');
    await type('');
    expect(rows().map((r) => r.querySelector('button.link')!.textContent!.trim())).toEqual([
      'Claim System',
      'Policy Admin',
    ]);
    expect(q('filters-btn')!.textContent).toContain('2');

    await click('reset-btn');
    expect(rows()).toHaveLength(4);
  });

  it('lists the distinct owners as filter options', async () => {
    const { el, click } = await render();
    await click('filters-btn');
    const owners = Array.from((el.querySelector('#f-owner') as HTMLSelectElement).options).map(
      (o) => o.text,
    );
    expect(owners).toEqual(['All', 'Agency', 'Claims Dept.', 'Finance', 'Operations']);
  });

  it('explains an empty result and keeps the counters', async () => {
    const { q, type } = await render();
    await type('zzz');
    expect(q('empty-result')!.textContent).toContain('No result matches');
    expect(q('count-system')!.textContent!.trim()).toBe('4');
  });

  it('offers a retry when the list cannot be loaded', async () => {
    const { q, click, systemApi } = await render(
      undefined,
      throwError(() => new Error('boom')),
    );
    expect(q('retry-btn')).not.toBeNull();
    systemApi.getAll.mockReturnValue(of(SYSTEMS) as never);
    await click('retry-btn');
    expect(q('retry-btn')).toBeNull();
    expect(q('count-system')!.textContent!.trim()).toBe('4');
  });

  it('marks the row opened with View, as the drawer stories will build on', async () => {
    const { q, rows, fixture } = await render();
    q('view-btn')!.click();
    await fixture.whenStable();
    expect(rows()[0].classList.contains('sel')).toBe(true);
  });
});
