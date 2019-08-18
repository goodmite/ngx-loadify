import {Component} from '@angular/core';
import {ServerService} from './server.service';
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


  makeHttpReq(path, verb, id = '1') {
    let url = `https://jsonplaceholder.typicode.com/${path}/${id}`;
    return this.httpClient[verb](url)
      .subscribe((data) => {
        this.data = data;
      });
  }
  test(message){
    alert(message);
  }
}
