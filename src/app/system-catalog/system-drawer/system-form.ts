import { SystemRecord } from '../../shared/interfaces';
import { SystemFormValue } from '../api/system-mapper';

/** What the drawer edits: text as typed (token times are parsed on save). `imageId` 0 = no icon picked yet. */
export interface SystemDraft {
  readonly systemName: string;
  readonly type: string;
  readonly description: string;
  readonly url: string;
  readonly ownerName: string;
  readonly imageId: number;
  readonly accessTokenTime: string;
  readonly refreshTokenTime: string;
}

export type SystemDraftErrors = Partial<Record<keyof SystemDraft, string>>;

export const EMPTY_DRAFT: SystemDraft = {
  systemName: '',
  type: '',
  description: '',
  url: '',
  ownerName: '',
  imageId: 0,
  accessTokenTime: '',
  refreshTokenTime: '',
};

export const MAX_DESCRIPTION = 250;
export const MAX_TOKEN_MINUTES = 9999;

const blank = (s: string) => s.trim() === '';

function tokenError(value: string): string | undefined {
  if (blank(value)) return 'Required';
  if (!/^\d+$/.test(value.trim())) return 'Enter whole minutes';
  return Number(value) > MAX_TOKEN_MINUTES ? `At most ${MAX_TOKEN_MINUTES} minutes` : undefined;
}

export function validateSystemDraft(d: SystemDraft): SystemDraftErrors {
  const errors: Record<string, string | undefined> = {
    systemName: blank(d.systemName) ? 'Required' : undefined,
    type: blank(d.type) ? 'Required' : undefined,
    ownerName: blank(d.ownerName) ? 'Required' : undefined,
    url: blank(d.url) ? 'Required' : undefined,
    description:
      d.description.length > MAX_DESCRIPTION ? `At most ${MAX_DESCRIPTION} characters` : undefined,
    imageId: d.imageId > 0 ? undefined : 'Pick an icon to save.',
    accessTokenTime: tokenError(d.accessTokenTime),
    refreshTokenTime: tokenError(d.refreshTokenTime),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v !== undefined));
}

export function draftFromRecord(r: SystemRecord): SystemDraft {
  const minutes = (n: number | null) => (n === null || n === undefined ? '' : String(n));
  return {
    systemName: r.systemName,
    type: r.type,
    description: r.description ?? '',
    url: r.url,
    ownerName: r.ownerName,
    imageId: r.imageId,
    accessTokenTime: minutes(r.accessTokenTime),
    refreshTokenTime: minutes(r.refreshTokenTime),
  };
}

/** Call only after `validateSystemDraft` found no errors. Name trimming happens in the request mapper (DEV-2). */
export function draftToFormValue(d: SystemDraft): SystemFormValue {
  return {
    type: d.type,
    systemName: d.systemName,
    description: d.description,
    url: d.url,
    ownerName: d.ownerName,
    imageId: d.imageId,
    accessTokenTime: Number(d.accessTokenTime),
    refreshTokenTime: Number(d.refreshTokenTime),
  };
}
