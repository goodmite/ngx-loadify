import {ModuleWithProviders, NgModule} from '@angular/core';
import {HttpTrackerLibComponent} from './http-tracker-lib.component';
import {HttpMockRequestInterceptor} from './interceptor.mock';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpTrackerDirective} from './http-tracker.directive';
import {ILoadifyLocalConfig, ILoadifyGlobalConfig} from './typings/interface';
import {ConfigService} from './config.service';

@NgModule({
  declarations: [HttpTrackerLibComponent, HttpTrackerDirective],
  imports: [],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: HttpMockRequestInterceptor,
    multi: true
  }],
  exports: [HttpTrackerLibComponent, HttpTrackerDirective]
})
export class HttpTrackerLibModule {
  constructor() {
  }
  static forRoot(config: ILoadifyGlobalConfig): ModuleWithProviders {
    ConfigService.config = config as ILoadifyLocalConfig;
    return {
      ngModule: HttpTrackerLibModule
    };
  }
}
