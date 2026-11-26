import { parseListString } from '../../shared/list-string';
import { MenuScreenRecord, SystemRecord, SystemToSystemListItem } from '../../shared/interfaces';

export type SettingTabId = 'system' | 'menu' | 'system-to-system';

export interface SettingTab {
  readonly id: SettingTabId;
  readonly label: string;
  /** URL fragment that selects the tab (deep link). */
  readonly fragment: string;
  readonly addLabel: string;
  readonly searchPlaceholder: string;
  /** Column headings after the name column and before Status / Updated. */
  readonly headings: readonly string[];
  /** What the name column is called. */
  readonly nameHeading: string;
}

export const TABS: readonly SettingTab[] = [
  {
    id: 'system',
    label: 'System',
    fragment: 'system-setup',
    addLabel: 'Add system',
    searchPlaceholder: 'Search system name',
    nameHeading: 'System name',
    headings: ['Owner', 'Type'],
  },
  {
    id: 'menu',
    label: 'Menu',
    fragment: 'menu',
    addLabel: 'Add menu',
    searchPlaceholder: 'Search menu name',
    nameHeading: 'Menu name',
    headings: ['System', 'Functions'],
  },
  {
    id: 'system-to-system',
    label: 'System to System',
    fragment: 'system-to-system',
    addLabel: 'Add connection',
    searchPlaceholder: 'Search source or target',
    nameHeading: 'Source system',
    headings: ['Target system'],
  },
];

export function tabFromFragment(fragment: string | null | undefined): SettingTab {
  return TABS.find((t) => t.fragment === fragment) ?? TABS[0];
}

/** One table row, already shaped for display. `cells` lines up with the tab's `headings`. */
export interface SettingRow {
  readonly key: string;
  readonly name: string;
  /** Small text under the name (System ID); null when the record has none. */
  readonly code: string | null;
  readonly cells: readonly string[];
  readonly active: boolean;
  readonly updated: string;
  /** `data:` URL of the server icon, or null for the default tile icon. */
  readonly icon: string | null;
}

const NONE = '–';

const isActive = (status: string | null | undefined): boolean =>
  (status ?? '').trim().toLowerCase() === 'active';

const iconUrl = (base64: string | null | undefined): string | null =>
  base64 ? `data:image/svg+xml;base64,${base64}` : null;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `28 Oct 2026`. Backend date-times carry no zone, so the calendar date is read as written. */
export function formatUpdated(value: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '');
  if (!m) return NONE;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${m[3]} ${month} ${m[1]}` : NONE;
}

/** First three functions, then `+n`. */
export function functionSummary(functional: string | null | undefined): string {
  const items = parseListString(functional);
  if (items.length === 0) return NONE;
  return items.length > 3
    ? `${items.slice(0, 3).join(', ')} +${items.length - 3}`
    : items.join(', ');
}

export function systemRow(r: SystemRecord): SettingRow {
  return {
    key: String(r.id),
    name: r.systemName,
    code: r.systemId,
    cells: [r.ownerName, r.type],
    active: isActive(r.status),
    updated: formatUpdated(r.updatedDate),
    icon: iconUrl(r.icon),
  };
}

export function menuRow(r: MenuScreenRecord): SettingRow {
  return {
    key: String(r.id),
    name: r.screenName,
    code: null,
    cells: [r.systemName, functionSummary(r.functional)],
    active: isActive(r.status),
    updated: formatUpdated(r.updatedDate),
    icon: iconUrl(r.image),
  };
}

/** The list answer has no `accessTokenTime`, so it is not a column here (see PR note). */
export function s2sRow(r: SystemToSystemListItem): SettingRow {
  return {
    key: String(r.id),
    name: r.sourceSystemName,
    code: null,
    cells: [r.targetSystemName],
    active: isActive(r.status),
    updated: formatUpdated(r.updatedDate),
    icon: null,
  };
}
