import {Injectable} from '@angular/core';
import {ILoadifyLocalConfig} from './typings/interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private static  _config: ILoadifyLocalConfig;

  static get config() {
    return this._config;
  }

  static set config(val: ILoadifyLocalConfig) {
    this._config = val;
  }
  constructor() {}
}
