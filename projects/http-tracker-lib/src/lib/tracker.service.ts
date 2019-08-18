import {EventEmitter, Injectable} from '@angular/core';
import {IHttpStatus} from './typings/interface';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {

  static httpAction$ = new EventEmitter<IHttpStatus>();
  constructor() {
  }


}
