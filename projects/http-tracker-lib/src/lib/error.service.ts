import {Injectable} from '@angular/core';
import {ILoadifyLocalConfig} from './typings/interface';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() {
  }

  static checkIfConfigIsValid(config: ILoadifyLocalConfig) {
    let strigifiedConfig;
    if (typeof config === 'object') {
      strigifiedConfig = JSON.stringify(config);
    } else {
      strigifiedConfig = config;
    }
    const message = `
        Error:: HttpTracker
        Message: Your configurations: ${strigifiedConfig} are not valid. Please provide configurations follows:
        *libHttpTracker="{partialPath:'your_path_here'}"
        Go to this link for more information:
      `;
    /*todo: updated above error message with links*/
    if (!config || config && (!config.partialPath)) {
      throw new Error(message);
    }

    return true;
  }
}
