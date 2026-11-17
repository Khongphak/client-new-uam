import { LocalDateTime, RecordStatus } from './api-envelope';

// v1/Systems/* — spec section 6.
export interface SystemRecord {
  readonly id: number;
  readonly systemId: string;
  readonly systemName: string;
  readonly type: string;
  readonly description: string | null;
  readonly url: string;
  readonly ownerName: string;
  readonly imageId: number;
  /** Read-only; NOT part of the update body. */
  readonly authenrizationType: string | null;
  readonly accessTokenTime: number | null;
  readonly refreshTokenTime: number | null;
  /** Must not be null. Compare case-insensitively. */
  readonly status: string;
  readonly createdDate: LocalDateTime;
  readonly createdBy: string | null;
  readonly updatedDate: LocalDateTime;
  readonly updatedBy: string | null;
  /** Base64 icon. */
  readonly icon: string | null;
}

export interface AddSystemRequest {
  readonly type: string;
  readonly systemName: string;
  readonly description: string;
  readonly url: string;
  readonly ownerName: string;
  readonly imageId: number;
  readonly status: RecordStatus;
  /** Intentional deviation DEV-1 (see src/testing/fixtures/deviations.ts): the old client did not send these. */
  readonly accessTokenTime: number;
  readonly refreshTokenTime: number;
}

/** Audit fields are echoed back exactly as loaded. */
export interface UpdateSystemRequest extends AddSystemRequest {
  readonly id: number;
  readonly systemId: string;
  readonly createdDate: LocalDateTime;
  readonly createdBy: string | null;
  readonly updatedDate: LocalDateTime;
  readonly updatedBy: string | null;
}
