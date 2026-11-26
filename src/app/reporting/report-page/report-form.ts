import {
  AuditTrailsReportRequest,
  AuthorizationMatrixReportRequest,
  DepartmentItem,
} from '../../shared/interfaces';

export type ReportType = 'matrix' | 'audit';
export type RangeChoice = 'Custom' | 'Last 7 days' | 'This month' | 'Last month';
export const RANGE_CHOICES: readonly RangeChoice[] = [
  'Custom',
  'Last 7 days',
  'This month',
  'Last month',
];

export interface DateRange {
  readonly from: string;
  readonly to: string;
}

/** Local calendar date as `YYYY-MM-DD` (never via toISOString, which shifts by the UTC offset). */
export function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Dates for a quick range, or null for "Custom". */
export function dateRangeFor(choice: RangeChoice, today: Date): DateRange | null {
  const y = today.getFullYear();
  const m = today.getMonth();
  switch (choice) {
    case 'Last 7 days':
      return { from: toIsoDate(new Date(y, m, today.getDate() - 6)), to: toIsoDate(today) };
    case 'This month':
      return { from: toIsoDate(new Date(y, m, 1)), to: toIsoDate(new Date(y, m + 1, 0)) };
    case 'Last month':
      return { from: toIsoDate(new Date(y, m - 1, 1)), to: toIsoDate(new Date(y, m, 0)) };
    default:
      return null;
  }
}

/** Empty department string means "all departments"; dates stay null. */
export function matrixPayload(
  systemId: string,
  department: string,
): AuthorizationMatrixReportRequest {
  return { systemId, department, dateFrom: null, dateTo: null };
}

/** Start-of-day timestamps without a zone; department stays null. */
export function auditPayload(systemId: string, from: string, to: string): AuditTrailsReportRequest {
  return { systemId, department: null, dateFrom: `${from}T00:00:00`, dateTo: `${to}T00:00:00` };
}

/** Department dropdown values: null/empty rows dropped, duplicates removed. */
export function departmentOptions(items: readonly DepartmentItem[]): string[] {
  const seen = new Set<string>();
  for (const { department } of items) if (department) seen.add(department);
  return [...seen];
}
