import { AddSystemToSystemRequest, UpdateSystemToSystemRequest } from '../../shared/interfaces';

/** What the System to System form edits. UUIds are the `systemId` of the chosen systems. */
export interface S2SFormValue {
  readonly sourceSystemUUId: string;
  readonly targetSystemUUId: string;
  readonly accessTokenTime: number;
}

export function toAddS2SRequest(form: S2SFormValue): AddSystemToSystemRequest {
  return {
    sourceSystemUUId: form.sourceSystemUUId,
    targetSystemUUId: form.targetSystemUUId,
    accessTokenTime: form.accessTokenTime,
    status: 'Active',
  };
}

/** The body has no audit fields to echo, only the record `id`. */
export function toUpdateS2SRequest(
  id: number,
  form: S2SFormValue,
  active: boolean,
): UpdateSystemToSystemRequest {
  return { id, ...toAddS2SRequest(form), status: active ? 'Active' : 'Inactive' };
}
