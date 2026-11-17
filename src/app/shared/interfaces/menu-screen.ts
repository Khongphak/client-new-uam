import { LocalDateTime, RecordStatus } from './api-envelope';

// v1/Menus/*, v2/Menus/* — spec section 8.
export interface MenuScreenRecord {
  readonly id: number;
  readonly systemId: string;
  readonly systemName: string;
  readonly screenName: string;
  readonly url: string;
  /** List string, e.g. `[add,view,edit]`; must not be null. See shared/list-string. */
  readonly functional: string;
  readonly description: string | null;
  readonly imageId: number;
  readonly status: string;
  readonly createdDate: LocalDateTime;
  readonly createdBy: string | null;
  /** Must not be null. */
  readonly updatedDate: LocalDateTime;
  readonly updatedBy: string | null;
  /** Base64 SVG; must not be null on `get-menuScreen-byId`. */
  readonly image: string | null;
}

/** Item of the "Menu list" box in the Role editor (`get-menuScreens-bySystemId`). Same shape as {@link MenuScreenRecord}. */
export type MenuScreenBySystemItem = MenuScreenRecord;

export interface AddMenuScreenRequest {
  readonly systemId: string;
  readonly functional: string;
  readonly screenName: string;
  readonly description: string;
  readonly url: string;
  readonly imageId: number;
  readonly status: RecordStatus;
}

export interface UpdateMenuScreenRequest extends AddMenuScreenRequest {
  readonly id: number;
}
