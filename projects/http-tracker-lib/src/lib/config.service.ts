import {ILoadifyGlobalConfig, ILoadifyLocalConfig} from './typings/interface';
import {Inject, Injectable, InjectionToken} from '@angular/core';

export const USER_OPTIONS = new InjectionToken<ILoadifyGlobalConfig>('USER_OPTIONS');

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(@Inject(USER_OPTIONS) private _config: ILoadifyGlobalConfig) {

  }

  get config() {
    return this._config;
  }

  set config(val: ILoadifyGlobalConfig) {
    this._config = val;
  }
}
