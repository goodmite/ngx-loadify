import {Injectable, Injector} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {HttpTrackerLibService} from './http-tracker-lib.service';
import {TrackerService} from './tracker.service';

@Injectable()
export class HttpMockRequestInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const api = request.url;
    TrackerService.httpAction$.emit({api, loading: true, verb: request.method});
    return next.handle(request).pipe(tap((x) => {
      if (x instanceof HttpResponse) {
        TrackerService.httpAction$.emit({api, success: true, verb: request.method});
      }
      if (x instanceof HttpErrorResponse) {
        TrackerService.httpAction$.emit({api, error: true, verb: request.method});
      }
    }));
  }
}
