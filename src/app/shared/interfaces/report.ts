// v1/Reports/* — spec section 11. Report files are `.xlsx` blobs.
export interface GetDepartmentsRequest {
  readonly systemId: string;
  /** ISO UTC (`toISOString()`); the values carry no meaning but must be present. */
  readonly dateFrom: string;
  readonly dateTo: string;
}

export interface DepartmentItem {
  readonly systemId: string;
  readonly systemName: string;
  /** Rows with a null department are dropped by the UI. */
  readonly department: string | null;
}

export interface AuthorizationMatrixReportRequest {
  readonly systemId: string;
  /** Empty string = all departments. */
  readonly department: string;
  readonly dateFrom: null;
  readonly dateTo: null;
}

export interface AuditTrailsReportRequest {
  readonly systemId: string;
  readonly department: null;
  /** `YYYY-MM-DDT00:00:00`, no zone: start of day. `dateTo` is also start of day (see risk in the PR). */
  readonly dateFrom: string;
  readonly dateTo: string;
}
