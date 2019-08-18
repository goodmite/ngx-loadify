import {Injectable, Injector} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {HttpTrackerLibService} from './http-tracker-lib.service';
import {TrackerService} from './tracker.service';
import {HelperService} from './helper.service';
import {IHttpStatus} from './typings/interface';

@Injectable()
export class HttpMockRequestInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = request.url;
    const path = HelperService.getPathFromUrl(request.url);
    let statusObj: IHttpStatus = {partialPath: path, url, loading: true, verb: request.method};
    TrackerService.httpAction$.emit(statusObj);
    return next.handle(request).pipe(tap((httpResult: HttpEvent<any>) => {
      statusObj = {
        ...statusObj,
        loading: false,
        full_response: httpResult
      };
      if (httpResult instanceof HttpResponse) {
        TrackerService.httpAction$.emit({...statusObj,
          success: true,
          body: httpResult.body
        });
      }
      if (httpResult instanceof HttpErrorResponse) {
        TrackerService.httpAction$.emit({
          ...statusObj,
          error: true,
          status: httpResult.status,
          error_message: httpResult.message,
        });
      }
    }));
  }
}
