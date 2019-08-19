import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {ServerService} from './server.service';
import {HttpTrackerLibModule} from 'ngx-loadify';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpTrackerLibModule.forRoot({
      loaderClass: 'loading',
      errorClass: 'error',
      successClass: 'success',
      makeDisabledDuringLoading: true,
      successClassDuration: 2000,
      errorClassDuration: 2000,
    })
  ],
  providers: [ServerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
