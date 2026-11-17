import { LocalDateTime, RecordStatus } from './api-envelope';

// v1/SystemToSystem/* — spec section 7.
export interface SystemToSystemListItem {
  readonly id: number;
  readonly sourceSystemName: string;
  readonly targetSystemName: string;
  readonly status: string;
  readonly updatedDate: LocalDateTime | null;
  readonly updatedBy: string | null;
  /** Only used to build filter options; there is no column for it. */
  readonly mode?: string | null;
}

export interface SystemToSystemRecord {
  readonly sourceSystemUUId: string;
  readonly targetSystemUUId: string;
  readonly sourceSystemName: string;
  readonly targetSystemName: string;
  readonly accessTokenTime: number | null;
  /** Must not be null. */
  readonly status: string;
}

export interface AddSystemToSystemRequest {
  readonly sourceSystemUUId: string;
  readonly targetSystemUUId: string;
  readonly accessTokenTime: number | null;
  readonly status: RecordStatus;
}

export interface UpdateSystemToSystemRequest extends AddSystemToSystemRequest {
  readonly id: number;
}
