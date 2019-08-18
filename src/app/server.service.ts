import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, switchMap, tap} from 'rxjs/operators';

export interface IHeaderData {
  'auth-token'?: string;
  'content-length'?: string;
  'content-type'?: string;
  'cookie'?: string;
  'origin'?: string;
  'referer'?: string;
  'user-agent'?: string;
  'user-access-token'?: string;
  'api-key'?: string;
  'bot-access-token'?: string;

}


export enum EHttpVerbs {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}


@Injectable()
export class ServerService {

  constructor(
    private httpClient: HttpClient) {
  }

  makeGetReq(url) {
  }
}
