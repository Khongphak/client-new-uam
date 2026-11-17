import { LocalDateTime } from './api-envelope';

// v1/Consent/* — spec section 3. `title` and `description` are HTML from the server: sanitize before rendering.
export interface Consent {
  readonly id: number;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly version: string;
  readonly effectiveDate: LocalDateTime;
  readonly status: string;
  readonly createdDate: LocalDateTime;
  readonly createdBy: string;
  readonly updatedDate: LocalDateTime;
  readonly updatedBy: string;
}

export interface ConsentAcceptRequest {
  readonly username: string;
  readonly consentId: number;
  readonly acceptedFlag: 'Y';
  /** UTC with `Z` (`new Date().toISOString()`), unlike every other date in the API. */
  readonly acceptedDate: string;
}
