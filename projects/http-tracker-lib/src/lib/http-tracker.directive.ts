import {Directive, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, TemplateRef, ViewContainerRef} from '@angular/core';
import {TrackerService} from './tracker.service';
import {ELoadifyResponse, ILoadifyStatus, ILoadifyLocalConfig} from './typings/interface';
import {HelperService} from './helper.service';
import {DomService} from './dom.service';
import {ConfigService} from './config.service';
import {ErrorService} from './error.service';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[loadify]'
})
export class HttpTrackerDirective implements OnInit {

  /**
   * nativeElement: the element on which the directive sits
   * */
  nativeElement: HTMLElement;

  /**
   * config: the config provided by the user. This configuration object is superset of
   * global config provided to root module while instantiating the library
   * */
  config: ILoadifyLocalConfig;

  /**
   * httpTracker acts as interface between user and lib and used as follows:
   * <button httpTracker="config; let statusChanged$=statusChanged$"> My button</button>
   * In this way user will provide the local config object. Upon getting the local config object
   * we will merge it with global config object unless user has provided: {avoidGlobalConfig: true}
   * */
  @Input('loadify') set _config(val: ILoadifyLocalConfig | string) {
    debugger;
    let config: ILoadifyLocalConfig;
    if (typeof val === 'string') {
      config = {
        partialPath: val
      };
    } else if (ErrorService.checkIfConfigIsValid(val)) {
      config = val;
    }

    this.config = {
      ...(this.configService.config || {}),
      ...config,
    };
  }

  /**
   * statusChanged$: a simple observable, triggered when status of API(relevant to this instance) is changed.
   * There are two ways to use this:
   * 1. <button *httpTracker="config; let statusChanged$=statusChanged$"> My button {{(statusChanged$|async).loading}}</button>
   * 2. <button *httpTracker="config;" (statusChanged$)="statusChangedHandler($event)"> My button}}</button>
   * */
  @Output() statusChanged$ = new EventEmitter<ILoadifyStatus>();

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              private tpl: TemplateRef<any>,
              private vcr: ViewContainerRef,
              private configService: ConfigService,
              private domService: DomService) {
  }

  ngOnInit(): void {
    const context = {
      statusChanged$: this.statusChanged$
    };
    const viewRef = this.vcr.createEmbeddedView(this.tpl, context);
    this.nativeElement = viewRef.rootNodes[0];

    TrackerService.httpAction$.subscribe((httpStatus: ILoadifyStatus) => {
      this.httpStatusChangedHandler(httpStatus);
    });
  }

  /**
   *httpStatusChangedHandler: This method is called whenever any API status changed to loading or success or error
   *@param httpStatus: details of the api called made by user and its status
   * */
  httpStatusChangedHandler(httpStatus: ILoadifyStatus) {
    if (HelperService.doesApiMatch(this.config, httpStatus)) {
      this.statusChanged$.emit(httpStatus);
      if (httpStatus.loading) {
        if (this.config.makeDisabledDuringLoading) {
          this.domService.toggleDisable(this.nativeElement, true);
        }
        this.addLoader(this.config.loaderClass);
      } else {
        if (this.config.makeDisabledDuringLoading) {
          this.domService.toggleDisable(this.nativeElement, false);
        }
        if (httpStatus.success) {
          this.removeLoader(ELoadifyResponse.SUCCESS);
        }
        if (httpStatus.error) {
          this.removeLoader(ELoadifyResponse.ERROR);
        }
      }
    }
  }

  addLoader(htmlClass: string) {
    this.domService.removeClass(this.nativeElement, this.config.errorClass);
    this.domService.removeClass(this.nativeElement, this.config.successClass);
    this.domService.addClass(this.nativeElement, htmlClass);
  }


  /**
   * removeLoader: When status of an API is changed from loading to success/error, this method is called to
   * remove the loader of the host element
   * @param status: details of the api called made by user and its status
   * */
  removeLoader(status: ELoadifyResponse) {
    let timeoutDuration = 2000;
    let appendClass: string;
    this.domService.removeClass(this.nativeElement, this.config.loaderClass);

    if (status === ELoadifyResponse.SUCCESS) {
      appendClass = this.config.successClass;
      timeoutDuration = this.config.successClassDuration;
    }
    if (status === ELoadifyResponse.ERROR) {
      appendClass = this.config.loaderClass;
      timeoutDuration = this.config.errorClassDuration;
    }
    this.nativeElement.classList.add(appendClass);
    setTimeout(() => {
      this.nativeElement.classList.remove(appendClass);
    }, timeoutDuration);

  }
}
