export enum EHttpResponse {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface IHttpStatus {
  api: string;
  verb: string;
  loading?: boolean;
  success?: boolean;
  success_message?: object;
  error?: boolean;
  error_message?: object;
}

export interface IHttpTrackerConfig {
  api: string;
  verb?: string;

  /*classes*/
  loaderClass?: string;
  successClass?: string;
  errorClass?: string;

  makeDisabledDuringLoading?: boolean;

  /*durations*/
  successClassDuration?: number;
  errorClassDuration?: number;
  makeDisabledDuringLoadingDuration?: number;
};
