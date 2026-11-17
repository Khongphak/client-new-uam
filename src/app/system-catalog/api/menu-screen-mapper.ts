import { toListString } from '../../shared/list-string';
import { AddMenuScreenRequest, UpdateMenuScreenRequest } from '../../shared/interfaces';

export interface MenuScreenFormValue {
  readonly systemId: string;
  /** Selected function values, e.g. `['add', 'view']`. */
  readonly functional: readonly string[];
  readonly screenName: string;
  readonly description: string;
  readonly url: string;
  readonly imageId: number;
}

// DEV-2: screenName is trimmed. Nothing selected → `[]`.
export function toAddMenuScreenRequest(form: MenuScreenFormValue): AddMenuScreenRequest {
  return {
    systemId: form.systemId,
    functional: toListString(form.functional),
    screenName: form.screenName.trim(),
    description: form.description,
    url: form.url,
    imageId: form.imageId,
    status: 'Active',
  };
}

export function toUpdateMenuScreenRequest(
  id: number,
  form: MenuScreenFormValue,
  active: boolean,
): UpdateMenuScreenRequest {
  return { id, ...toAddMenuScreenRequest(form), status: active ? 'Active' : 'Inactive' };
}
