import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, Observable } from 'rxjs';

import { SystemApi } from '../../system-catalog/api/system-api';
import { ReportApi } from '../api/report-api';
import {
  auditPayload,
  dateRangeFor,
  departmentOptions,
  matrixPayload,
  RANGE_CHOICES,
  RangeChoice,
  ReportType,
} from './report-form';

const TYPES = [
  {
    id: 'matrix',
    name: 'Authorization Matrix Report',
    description:
      'Who has which role and menu rights in a system. Leave Department empty to include every department. Downloads an Excel file.',
    file: 'authorization-matrix-report.xlsx',
  },
  {
    id: 'audit',
    name: 'Audit Trails Report',
    description:
      'Who opened a system from UAM, and when, within the dates you pick. Downloads an Excel file.',
    file: 'audit-trails-report.xlsx',
  },
] as const;

const DEFAULT_RANGE: RangeChoice = 'This month';

/** Report page: pick a report type, a system and (department | dates), then download the Excel file. */
@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.html',
  styleUrl: './report-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportPage {
  readonly #reports = inject(ReportApi);
  readonly #systemApi = inject(SystemApi);

  protected readonly types = TYPES;
  protected readonly rangeChoices = RANGE_CHOICES;

  protected readonly type = signal<ReportType>('matrix');
  protected readonly current = computed(() => TYPES.find((t) => t.id === this.type())!);
  protected readonly systemId = signal('');
  protected readonly range = signal<RangeChoice>(DEFAULT_RANGE);
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly exporting = signal(false);

  protected readonly systems = rxResource({
    stream: () => this.#systemApi.getAll(),
    defaultValue: [],
  });

  // Resetting to "all departments" whenever the system changes keeps a stale pick from being sent.
  protected readonly department = linkedSignal<string, string>({
    source: this.systemId,
    computation: () => '',
  });

  /** The API wants dates that carry no meaning here (spec), so a fixed pair is sent. */
  protected readonly departmentList = rxResource({
    params: () => this.systemId() || undefined,
    stream: ({ params }) =>
      params
        ? this.#reports.getDepartments({
            systemId: params,
            dateFrom: new Date().toISOString(),
            dateTo: new Date().toISOString(),
          })
        : EMPTY,
    defaultValue: [],
  });
  protected readonly departments = computed(() => departmentOptions(this.departmentList.value()));

  protected readonly canExport = computed(
    () => !!this.systemId() && (this.type() === 'matrix' || (!!this.from() && !!this.to())),
  );

  constructor() {
    this.#applyRange(DEFAULT_RANGE);
  }

  protected selectType(t: ReportType): void {
    this.type.set(t);
  }

  protected selectSystem(id: string): void {
    this.systemId.set(id);
  }

  protected selectRange(r: RangeChoice): void {
    this.range.set(r);
    this.#applyRange(r);
  }

  protected editDate(which: 'from' | 'to', value: string): void {
    (which === 'from' ? this.from : this.to).set(value);
    this.range.set('Custom');
  }

  protected reset(): void {
    this.systemId.set('');
    this.range.set(DEFAULT_RANGE);
    this.#applyRange(DEFAULT_RANGE);
  }

  protected exportReport(): void {
    if (!this.canExport() || this.exporting()) return;
    const id = this.systemId();
    const request$: Observable<Blob> =
      this.type() === 'matrix'
        ? this.#reports.generateAuthorizationMatrix(matrixPayload(id, this.department()))
        : this.#reports.generateAuditTrails(auditPayload(id, this.from(), this.to()));
    const file = this.current().file;
    this.exporting.set(true);
    // Telling the user a download failed is UAM-RPT-02; here only the busy state is released.
    request$.subscribe({
      next: (blob) => {
        this.#save(blob, file);
        this.exporting.set(false);
      },
      error: () => this.exporting.set(false),
    });
  }

  #applyRange(choice: RangeChoice): void {
    const r = dateRangeFor(choice, new Date());
    if (r) {
      this.from.set(r.from);
      this.to.set(r.to);
    }
  }

  #save(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
