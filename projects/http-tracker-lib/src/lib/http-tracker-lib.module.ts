import { NgModule } from '@angular/core';
import { HttpTrackerLibComponent } from './http-tracker-lib.component';
import {HttpMockRequestInterceptor} from './interceptor.mock';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import { HttpTrackerDirective } from './http-tracker.directive';

@NgModule({
  declarations: [HttpTrackerLibComponent, HttpTrackerDirective],
  imports: [
  ],
  providers:[   {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpMockRequestInterceptor,
    multi: true
  }],
  exports: [HttpTrackerLibComponent, HttpTrackerDirective]
})
export class HttpTrackerLibModule { }
