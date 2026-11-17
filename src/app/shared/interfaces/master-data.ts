import { LocalDateTime } from './api-envelope';

// v1/Master/* — spec section 4.

/** Values of the `type` query parameter of `get-generalData` (lower-case `function` is intentional). */
export type GeneralDataType = 'status' | 'systemType' | 'function';

export interface GeneralDataItem {
  readonly id: number;
  /** `Status` | `SystemType` | `Function` (capitalised in responses). */
  readonly type: string;
  /** The only field the UI uses, e.g. `Active`, `Web Application`, `add`. */
  readonly value: string;
  readonly remark: string | null;
  readonly createdDate: LocalDateTime;
  readonly createdBy: string;
  readonly updatedDate: LocalDateTime;
  readonly updatedBy: string;
}

export interface IconItem {
  readonly id: number;
  /** `Systems` for system icons, `Menu` for menu/role/user icons. */
  readonly category: string;
  readonly name: string;
  /** Base64 of an SVG, with no `data:` prefix. Server content: never inject as raw HTML. */
  readonly data: string;
  readonly createdDate: LocalDateTime;
  readonly createdBy: string;
  /** Must not be null (the screens call string functions on it). */
  readonly updatedDate: LocalDateTime;
  readonly updatedBy: string;
}
