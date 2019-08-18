import {EventEmitter, Injectable} from '@angular/core';
import {ILoadifyStatus} from './typings/interface';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {

  static httpAction$ = new EventEmitter<ILoadifyStatus>();
  constructor() {
  }


}
