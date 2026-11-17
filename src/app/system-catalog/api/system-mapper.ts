import { AddSystemRequest, SystemRecord, UpdateSystemRequest } from '../../shared/interfaces';

/** What the system form edits. */
export interface SystemFormValue {
  readonly type: string;
  readonly systemName: string;
  readonly description: string;
  readonly url: string;
  readonly ownerName: string;
  readonly imageId: number;
  readonly accessTokenTime: number;
  readonly refreshTokenTime: number;
}

// DEV-2: names are trimmed before sending; description / url are sent as typed.
export function toAddSystemRequest(form: SystemFormValue): AddSystemRequest {
  return {
    type: form.type,
    systemName: form.systemName.trim(),
    description: form.description,
    url: form.url,
    ownerName: form.ownerName,
    imageId: form.imageId,
    status: 'Active',
    accessTokenTime: form.accessTokenTime,
    refreshTokenTime: form.refreshTokenTime,
  };
}

/** `current` is the record as loaded: `id`, `systemId` and the audit fields are echoed back unchanged. */
export function toUpdateSystemRequest(
  current: SystemRecord,
  form: SystemFormValue,
  active: boolean,
): UpdateSystemRequest {
  return {
    id: current.id,
    systemId: current.systemId,
    type: form.type,
    systemName: form.systemName.trim(),
    description: form.description,
    url: form.url,
    ownerName: form.ownerName,
    imageId: form.imageId,
    status: active ? 'Active' : 'Inactive',
    accessTokenTime: form.accessTokenTime,
    refreshTokenTime: form.refreshTokenTime,
    createdDate: current.createdDate,
    createdBy: current.createdBy,
    updatedDate: current.updatedDate,
    updatedBy: current.updatedBy,
  };
}
