import {HttpEvent} from '@angular/common/http';

export enum EHttpResponse {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface IHttpStatus {
  url: string;
  partialPath: string;
  verb: string;
  loading?: boolean;
  success?: boolean;
  success_message?: object;
  body?: any;
  error?: boolean;
  error_message?: string;
  status?: number;
  full_response?: HttpEvent<any>;
}

export interface IHttpTrackerGlobalConfig {
  /*classes*/
  loaderClass?: string;
  successClass?: string;
  errorClass?: string;

  makeDisabledDuringLoading?: boolean;

  /*durations*/
  successClassDuration?: number;
  errorClassDuration?: number;
}


export interface IHttpTrackerLocalConfig extends IHttpTrackerGlobalConfig {
  verb?: string;
  partialPath: string | RegExp;
}
