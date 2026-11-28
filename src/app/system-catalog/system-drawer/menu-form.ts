import { MenuScreenRecord } from '../../shared/interfaces';
import { parseListString } from '../../shared/list-string';
import { MenuScreenFormValue } from '../api/menu-screen-mapper';

/** What the menu drawer edits. `imageId` 0 = no icon picked yet. */
export interface MenuDraft {
  readonly systemId: string;
  readonly screenName: string;
  readonly url: string;
  readonly description: string;
  readonly imageId: number;
  /** Function values as the master list spells them (e.g. `add`). */
  readonly functional: readonly string[];
}

export type MenuDraftErrors = Partial<Record<keyof MenuDraft, string>>;

export const EMPTY_MENU_DRAFT: MenuDraft = {
  systemId: '',
  screenName: '',
  url: '',
  description: '',
  imageId: 0,
  functional: [],
};

export const MAX_MENU_DESCRIPTION = 250;

const blank = (s: string) => s.trim() === '';

export function validateMenuDraft(d: MenuDraft): MenuDraftErrors {
  const errors: Record<string, string | undefined> = {
    systemId: blank(d.systemId) ? 'Select a system' : undefined,
    screenName: blank(d.screenName) ? 'Required' : undefined,
    url: blank(d.url) ? 'Required' : undefined,
    description:
      d.description.length > MAX_MENU_DESCRIPTION
        ? `At most ${MAX_MENU_DESCRIPTION} characters`
        : undefined,
    imageId: d.imageId > 0 ? undefined : 'Pick an icon to save.',
  };
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v !== undefined));
}

/**
 * The case of function names in the database is not confirmed (API contract A), so the record's names are matched to the
 * master list ignoring case and the master spelling wins. A name the master list lacks is kept as it is.
 */
export function draftFromMenuRecord(
  r: MenuScreenRecord,
  masterFunctions: readonly string[],
): MenuDraft {
  const functional = parseListString(r.functional).map(
    (f) => masterFunctions.find((m) => m.toLowerCase() === f.toLowerCase()) ?? f,
  );
  return {
    systemId: r.systemId,
    screenName: r.screenName,
    url: r.url,
    description: r.description ?? '',
    imageId: r.imageId,
    functional,
  };
}

/** Call only after `validateMenuDraft` found no errors. Name trimming happens in the request mapper. */
export function draftToMenuFormValue(d: MenuDraft): MenuScreenFormValue {
  return {
    systemId: d.systemId,
    screenName: d.screenName,
    description: d.description,
    url: d.url,
    imageId: d.imageId,
    functional: d.functional,
  };
}
