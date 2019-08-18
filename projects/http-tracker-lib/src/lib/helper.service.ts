import {IHttpTrackerConfig} from './typings/interface';

export class HelperService {
  static doesApiMatch(configObj: IHttpTrackerConfig, httpObj: IHttpTrackerConfig) {
    if (httpObj.api.includes(configObj.api)) {
      if (configObj.verb) {
        return configObj.verb.toLocaleLowerCase() === httpObj.verb.toLocaleLowerCase();
      }
      return true;
    }
    return false;
  }
}
