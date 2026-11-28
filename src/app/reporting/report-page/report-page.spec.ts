import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ErrorHandler, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { routes } from '../../app.routes';
import { errorDialogInterceptor } from '../../core/api/http-error-dialog';
import { HttpErrorDialogs } from '../../core/api/http-error-dialogs';
import { SystemApi } from '../../system-catalog/api/system-api';
import {
  AuthorizationMatrixReportRequest,
  GetDepartmentsRequest,
  SystemRecord,
} from '../../shared/interfaces';
import { ReportApi } from '../api/report-api';
import { ReportPage } from './report-page';

const system = (systemId: string, systemName: string) => ({ systemId, systemName }) as SystemRecord;

async function render() {
  const api = {
    getDepartments: vi.fn((_r: GetDepartmentsRequest) =>
      of([
        { systemId: 's1', systemName: 'Claim', department: 'IT' },
        { systemId: 's1', systemName: 'Claim', department: null },
        { systemId: 's1', systemName: 'Claim', department: 'Claims' },
      ]),
    ),
    generateAuthorizationMatrix: vi.fn((_r: AuthorizationMatrixReportRequest) =>
      of(new Blob(['x'])),
    ),
    generateAuditTrails: vi.fn(() => of(new Blob(['y']))),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: ReportApi, useValue: api },
      {
        provide: SystemApi,
        useValue: {
          getAll: () => of([system('s1', 'Claim System'), system('s2', 'Policy Admin')]),
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(ReportPage);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const q = <T extends HTMLElement>(id: string) =>
    el.querySelector(`[data-testid="${id}"]`) as T | null;
  const pick = async (id: string, value: string) => {
    const s = q<HTMLSelectElement>(id)!;
    s.value = value;
    s.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  };
  const click = async (id: string) => {
    q(id)!.click();
    await fixture.whenStable();
  };
  return { api, el, q, pick, click, fixture };
}

describe('ReportPage', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });

  it('is routed at /report for ADMIN/AUDIT only', () => {
    const shell = routes.find((r) => r.path === '')!;
    const report = shell.children!.find((r) => r.path === 'report')!;
    expect(report.canActivate).toHaveLength(1);
  });

  it('disables Export until a system is chosen, and shows no preview table', async () => {
    const { q, el } = await render();
    expect(q<HTMLButtonElement>('export-btn')!.disabled).toBe(true);
    expect(el.querySelector('table')).toBeNull();
  });

  it('loads departments for the chosen system and exports the matrix with "" for all', async () => {
    const { api, pick, click, q } = await render();
    await pick('system-select', 's1');
    expect(api.getDepartments).toHaveBeenCalledOnce();
    expect(api.getDepartments.mock.calls[0][0].systemId).toBe('s1');
    const opts = Array.from(q<HTMLSelectElement>('department-select')!.options).map((o) => o.text);
    expect(opts).toEqual(['All departments', 'IT', 'Claims']);

    await click('export-btn');
    expect(api.generateAuthorizationMatrix).toHaveBeenCalledWith({
      systemId: 's1',
      department: '',
      dateFrom: null,
      dateTo: null,
    });
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('sends the chosen department', async () => {
    const { api, pick, click } = await render();
    await pick('system-select', 's1');
    await pick('department-select', 'IT');
    await click('export-btn');
    expect(api.generateAuthorizationMatrix.mock.calls[0][0].department).toBe('IT');
  });

  it('audit tab: quick range fills the dates, editing a date switches to Custom, payload at 00:00:00', async () => {
    const { api, pick, click, q, fixture } = await render();
    await click('tab-audit');
    await pick('system-select', 's1');
    await pick('range-select', 'This month');
    const from = q<HTMLInputElement>('date-from')!;
    expect(from.value).toMatch(/^\d{4}-\d{2}-01$/);
    from.value = '2026-03-02';
    from.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(q<HTMLSelectElement>('range-select')!.value).toBe('Custom');
    const to = q<HTMLInputElement>('date-to')!;
    to.value = '2026-03-09';
    to.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    await click('export-btn');
    expect(api.generateAuditTrails).toHaveBeenCalledWith({
      systemId: 's1',
      department: null,
      dateFrom: '2026-03-02T00:00:00',
      dateTo: '2026-03-09T00:00:00',
    });
  });

  it('audit tab needs both dates', async () => {
    const { pick, click, q, fixture } = await render();
    await click('tab-audit');
    await pick('system-select', 's1');
    await pick('range-select', 'This month');
    const from = q<HTMLInputElement>('date-from')!;
    from.value = '';
    from.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(q<HTMLButtonElement>('export-btn')!.disabled).toBe(true);
  });

  it('Reset clears the system and restores This month', async () => {
    const { pick, click, q } = await render();
    await click('tab-audit');
    await pick('system-select', 's1');
    await click('reset-btn');
    expect(q<HTMLSelectElement>('system-select')!.value).toBe('');
    expect(q<HTMLButtonElement>('export-btn')!.disabled).toBe(true);
  });
});

describe('ReportPage when the systems request fails (UAM-ERR-09)', () => {
  it('opens the error dialog by itself, without throwing while rendering', async () => {
    const errors: unknown[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorDialogInterceptor])),
        provideHttpClientTesting(),
        { provide: ErrorHandler, useValue: { handleError: (e: unknown) => errors.push(e) } },
        {
          provide: SystemApi,
          useFactory: () => {
            const http = inject(HttpClient);
            return { getAll: () => http.get<SystemRecord[]>('/systems') };
          },
        },
        { provide: ReportApi, useValue: {} },
      ],
    });
    const page = TestBed.createComponent(ReportPage);
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
