import { SystemToSystemRecord } from '../../shared/interfaces';
import { S2SFormValue } from '../api/s2s-mapper';

/** What the drawer edits: the token time is text as typed (parsed on save). */
export interface S2SDraft {
  readonly sourceSystemUUId: string;
  readonly targetSystemUUId: string;
  readonly accessTokenTime: string;
}

export type S2SDraftErrors = Partial<Record<keyof S2SDraft, string>>;

export const EMPTY_S2S_DRAFT: S2SDraft = {
  sourceSystemUUId: '',
  targetSystemUUId: '',
  accessTokenTime: '',
};

const blank = (s: string) => s.trim() === '';

export function validateS2SDraft(d: S2SDraft): S2SDraftErrors {
  const errors: S2SDraftErrors = {};
  if (blank(d.sourceSystemUUId)) errors.sourceSystemUUId = 'Required';
  if (blank(d.targetSystemUUId)) errors.targetSystemUUId = 'Required';
  if (blank(d.accessTokenTime)) errors.accessTokenTime = 'Required';
  else if (!/^\d+$/.test(d.accessTokenTime.trim())) errors.accessTokenTime = 'Enter whole minutes';
  return errors;
}

export function draftFromRecord(r: SystemToSystemRecord): S2SDraft {
  return {
    sourceSystemUUId: r.sourceSystemUUId,
    targetSystemUUId: r.targetSystemUUId,
    accessTokenTime: r.accessTokenTime === null ? '' : String(r.accessTokenTime),
  };
}

/** Call only after `validateS2SDraft` found no errors. */
export function draftToFormValue(d: S2SDraft): S2SFormValue {
  return {
    sourceSystemUUId: d.sourceSystemUUId,
    targetSystemUUId: d.targetSystemUUId,
    accessTokenTime: Number(d.accessTokenTime),
  };
}
