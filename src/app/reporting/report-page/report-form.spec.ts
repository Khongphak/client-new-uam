import {
  auditPayload,
  dateRangeFor,
  departmentOptions,
  matrixPayload,
  toIsoDate,
} from './report-form';

const today = new Date(2026, 9, 15); // 15 Oct 2026, local

describe('report form logic', () => {
  it('formats local dates as YYYY-MM-DD without shifting by timezone', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('computes the quick ranges from today', () => {
    expect(dateRangeFor('Last 7 days', today)).toEqual({ from: '2026-10-09', to: '2026-10-15' });
    expect(dateRangeFor('This month', today)).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(dateRangeFor('Last month', today)).toEqual({ from: '2026-09-01', to: '2026-09-30' });
    expect(dateRangeFor('Last month', new Date(2026, 0, 10))).toEqual({
      from: '2025-12-01',
      to: '2025-12-31',
    });
    expect(dateRangeFor('Custom', today)).toBeNull();
  });

  it('builds the matrix payload: empty department = all, dates null', () => {
    expect(matrixPayload('s1', '')).toEqual({
      systemId: 's1',
      department: '',
      dateFrom: null,
      dateTo: null,
    });
    expect(matrixPayload('s1', 'IT').department).toBe('IT');
  });

  it('builds the audit payload at start of day with a null department', () => {
    expect(auditPayload('s1', '2026-10-01', '2026-10-31')).toEqual({
      systemId: 's1',
      department: null,
      dateFrom: '2026-10-01T00:00:00',
      dateTo: '2026-10-31T00:00:00',
    });
  });

  it('drops null departments and duplicates, keeping order', () => {
    const rows = ['IT', null, 'Claims', 'IT', ''].map((department) => ({
      systemId: 's',
      systemName: 'n',
      department,
    }));
    expect(departmentOptions(rows)).toEqual(['IT', 'Claims']);
  });
});
