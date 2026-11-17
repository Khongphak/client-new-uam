import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttp } from '../../core/api/api-http';
import { GeneralDataItem, GeneralDataType, IconItem } from '../../shared/interfaces';

/** v1/Master/* (spec section 4). */
@Injectable({ providedIn: 'root' })
export class MasterDataApi {
  readonly #api = inject(ApiHttp);

  getGeneralData(type: GeneralDataType): Observable<GeneralDataItem[]> {
    return this.#api.get<GeneralDataItem[]>('v1/Master/get-generalData', { type });
  }

  getIcons(): Observable<IconItem[]> {
    return this.#api.get<IconItem[]>('v1/Master/get-icons');
  }
}
