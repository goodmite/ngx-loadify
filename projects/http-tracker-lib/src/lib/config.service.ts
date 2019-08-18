import {Injectable} from '@angular/core';
import {IHttpTrackerLocalConfig} from './typings/interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private static  _config: IHttpTrackerLocalConfig;

  static get config() {
    return this._config;
  }

  static set config(val: IHttpTrackerLocalConfig) {
    this._config = val;
  }
  constructor() {}
}
