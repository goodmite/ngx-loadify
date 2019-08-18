import {HttpEvent} from '@angular/common/http';

export enum ELoadifyResponse {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ILoadifyStatus {
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

export interface ILoadifyGlobalConfig {
  /*classes*/
  loaderClass?: string;
  successClass?: string;
  errorClass?: string;

  makeDisabledDuringLoading?: boolean;

  /*durations*/
  successClassDuration?: number;
  errorClassDuration?: number;
}


export interface ILoadifyLocalConfig extends ILoadifyGlobalConfig {
  verb?: string;
  partialPath: string | RegExp;
}
