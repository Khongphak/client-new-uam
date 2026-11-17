// v1/Home/get-userSystems, v1/UserAccesses/add-useraccess-history — spec section 5.
export interface UserSystemItem {
  readonly id: number;
  readonly username: string;
  readonly systemId: string;
  /** Must not be null (card search lower-cases it). */
  readonly systemName: string;
  readonly systemUrl: string;
  readonly systemType: string;
  readonly description: string | null;
  readonly ownerName: string | null;
  readonly imageId: number | null;
  /** Base64 image (PNG in practice). */
  readonly data: string | null;
  readonly image: string | null;
  readonly status: string;
}

export interface AccessHistoryRequest {
  /** `UserSystemItem.id` of the clicked card. */
  readonly id: number;
  readonly username: string;
  readonly systemId: string;
  /** Current time + 7 hours, serialised with `toISOString()` (ends in `Z` but holds Thai local time). */
  readonly accessTime: string;
  readonly status: 'Success';
}
