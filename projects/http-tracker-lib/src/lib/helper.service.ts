import {IHttpStatus, IHttpTrackerLocalConfig} from './typings/interface';

export class HelperService {

  /**
   * doesApiMatch: Test if paths and http verb (if provided in config by user) of config and ajax call match
   * @param configObj: configuration object provided by the user from the directive
   * @param httpStatus: details of the ajax call
   * */
  static doesApiMatch(configObj: IHttpTrackerLocalConfig, httpStatus: IHttpStatus) {
    if (this.checkIfPartialPathsMatch(configObj, httpStatus)) {

      /*skip this check, if no http verb provided by user*/
      if (configObj.verb) {
        return this.checkIfHttpMethodsMatch(configObj, httpStatus);
      }
      return true;
    }
    return false;
  }

  /**
   * checkIfPartialPathsMatch: Test if paths of config and ajax call match
   * @param configObj: configuration object provided by the user from the directive
   * @param httpStatus: details of the ajax call
   * */
  static checkIfPartialPathsMatch(configObj: IHttpTrackerLocalConfig, httpStatus: IHttpStatus) {
    const config_partialPath = configObj.partialPath;
    const http_partialPath = httpStatus.partialPath;

    /*
    * If both are string, config path should include http path
    * */
    if (typeof config_partialPath === 'string' && typeof http_partialPath === 'string') {
      return http_partialPath.includes(config_partialPath as string);
    }

    /*
    * If config_partialPath is regex
    * */
    if (config_partialPath instanceof RegExp && typeof http_partialPath === 'string') {
      return config_partialPath.test(http_partialPath);
    }
  }


  /**
   * checkIfHttpMethodsMatch: Test if Http methods of config and ajax call match
   * @param configObj: configuration object provided by the user from the directive
   * @param httpStatus: details of the ajax call
   * */
  static checkIfHttpMethodsMatch(configObj: IHttpTrackerLocalConfig, httpStatus: IHttpStatus) {
    const config_method: string = configObj.verb;
    const http_method: string = httpStatus.verb;
    return config_method && http_method && config_method.toLocaleLowerCase() === http_method.toLocaleLowerCase();
  }


  static getPathFromUrl(url: string): string {
    return new URL(url).pathname;
  }
}
