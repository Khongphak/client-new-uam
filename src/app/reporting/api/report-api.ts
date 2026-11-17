import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttp } from '../../core/api/api-http';
import {
  AuditTrailsReportRequest,
  AuthorizationMatrixReportRequest,
  DepartmentItem,
  GetDepartmentsRequest,
} from '../../shared/interfaces';

/** v1/Reports/* (spec section 11). The two report calls answer an `.xlsx` file as a blob. */
@Injectable({ providedIn: 'root' })
export class ReportApi {
  readonly #api = inject(ApiHttp);

  getDepartments(request: GetDepartmentsRequest): Observable<DepartmentItem[]> {
    return this.#api.send<DepartmentItem[]>('POST', 'v1/Reports/get-departments', request);
  }

  generateAuthorizationMatrix(request: AuthorizationMatrixReportRequest): Observable<Blob> {
    return this.#api.postBlob('v1/Reports/generate-authorization-matrix-report', request);
  }

  generateAuditTrails(request: AuditTrailsReportRequest): Observable<Blob> {
    return this.#api.postBlob('v1/Reports/generate-audit-trails-report', request);
  }
}
