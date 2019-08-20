<img src="https://raw.githubusercontent.com/goodmite/ngx-loadify/master/carbon1.png">

# ngx-loadify

A dead simple library to manage HTTP loading/success/error, so you won't have to.

## Motivation

Managing loaders sucks. It might seem simple at first but its really an elaborate and tedius task. 
 1. You will have a flag to track if the Http call is done or not. 
 2. Another flag if its successful or errored out. 
 3. Another flag for http success/error message, which require a timeout after which button should reset to normalcy.
 4. Now do all of the above for every single API in your project!
 
 All of this doesn't kill you, but it make you unproductive and unnecessarily clutters the main business logic.
 
 **With ngx-loadify it becomes as simple as this:**
 ```
 <button
    *loadify="'todos';    //<-- tracks apis with path containing todo and automatically adds/removes loading/success/error classes
    let status$=status$"  //<-- status$ is an observable for api details. Usage ex: (status$|async).loading or (status$|async).error message
    (click)="getTodos()">
  Get Todos
</button>
```

## Installation

1. Install from npm
    ```npm i ngx-loadify --save```
2. Import in your Root Module:
    ```
    import {HttpTrackerLibModule} from 'ngx-loadify';

    @NgModule({
      ...
      imports: [
        HttpTrackerLibModule.forRoot({
          loaderClass: 'loading',
          errorClass: 'error',
          successClass: 'success',
          makeDisabledDuringLoading: true,
          successClassDuration: 2000,
          errorClassDuration: 2000,
        })
      ],
      ...
    })
    export class AppModule { }
    ```
**3. Add the directive to your code**

  *Basic:*

    ```
    //app.component.html
    <button *loadify="'todos'; let status$=status$"  (click)="getTodos()">
      Get Todos
    </button>
    ```

  *With config:*

    ```
    //app.component.html

    <button
      *loadify="{ partialPath: 'todos', verb: 'POST',}; let statusChanged$=statusChanged$"
      (click)="makeHttpReq('todos', 'get')">
      Get Todos
    </button>
    ```


## Examples:

### 1. Basic 
### 2. Bootstrap 
### 3. Angular material 
