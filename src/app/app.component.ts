import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ILoadifyLocalConfig} from '../../projects/http-tracker-lib/src/lib/typings/interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'http-tracker';
  className = true;
  data;
;

  code = `
    //api : http://www.mocky.io/v2/5d5ac0062f00006e0036f88d
    
    <button
      *loadify="'v2/5d5ac0062f00006e0036f88d'; let statusChanged$=statusChanged$"
      (click)="makeHttpReq()">
      Get Todo: {{(statusChanged$|async)?.body?.title}}     <--- You can access entire Http Response like this
    </button>
  `;

  constructor(
    private httpClient: HttpClient) {
  }

  config: ILoadifyLocalConfig = {
    partialPath: 'todos',
    verb: 'get',
    loaderClass: 'loading',
    errorClass: 'error',
    successClass: 'success',
    makeDisabledDuringLoading: true,
    successClassDuration: 2000,
    errorClassDuration: 2000,
  };


  makeHttpReq() {
    const url = `https://www.mocky.io/v2/5d5ac0062f00006e0036f88d?mocky-delay=3000ms`;
    return this.httpClient.get(url)
      .subscribe((data) => {
        this.data = data;
      });
  }

  test(message) {
    alert(message);
  }
}
