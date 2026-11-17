import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { expectContractRequest } from '../../../testing/contract/http-contract';
import { fixtures } from '../../../testing/fixtures';
import { setupApiTest } from '../../core/api/api-test-setup';
import { ReportApi } from './report-api';

describe('report API contract', () => {
  let ctrl: HttpTestingController;
  beforeEach(() => (ctrl = setupApiTest()));
  afterEach(() => ctrl.verify());

  it('audit-trails request matches the fixture and the answer is a blob', async () => {
    const done = firstValueFrom(
      TestBed.inject(ReportApi).generateAuditTrails(fixtures['audit-trails-report.request']),
    );
    const req = expectContractRequest(ctrl, {
      method: 'POST',
      url: 'v1/Reports/generate-audit-trails-report',
      fixture: 'audit-trails-report.request',
    });
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['xlsx']));
    expect((await done).size).toBe(4);
  });

  it('authorization-matrix sends empty-string department for "all" and null dates; departments is a normal envelope call', async () => {
    const api = TestBed.inject(ReportApi);
    api
      .generateAuthorizationMatrix({ systemId: 's', department: '', dateFrom: null, dateTo: null })
      .subscribe();
    const req = ctrl.expectOne('v1/Reports/generate-authorization-matrix-report');
    expect(req.request.body).toEqual({
      systemId: 's',
      department: '',
      dateFrom: null,
      dateTo: null,
    });
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob([]));

    const deps = firstValueFrom(api.getDepartments({ systemId: 's', dateFrom: 'x', dateTo: 'y' }));
    ctrl.expectOne('v1/Reports/get-departments').flush({
      status: 's',
      statusCode: '20000',
      message: null,
      data: [{ systemId: 's', systemName: 'n', department: 'D' }],
    });
    expect((await deps)[0].department).toBe('D');
  });
});
