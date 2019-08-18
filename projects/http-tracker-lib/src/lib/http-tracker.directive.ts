import {Directive, ElementRef, EventEmitter, Input, Output, Renderer2} from '@angular/core';
import {TrackerService} from './tracker.service';
import {EHttpResponse, IHttpStatus, IHttpTrackerConfig} from './typings/interface';
import {HelperService} from './helper.service';
import {DomService} from './dom.service';


@Directive({
  selector: '[libHttpTracker]'
})
export class HttpTrackerDirective {
  @Input() config: IHttpTrackerConfig;
  @Output() test = new EventEmitter();
  constructor(private el: ElementRef, private renderer: Renderer2, private domService: DomService) {
    const nativeElement = el.nativeElement;
    TrackerService.httpAction$.subscribe((status: IHttpStatus) => {
      debugger;
      if (HelperService.doesApiMatch(this.config, status)) {
        if (status.loading) {
          if (this.config.makeDisabledDuringLoading) {
            this.domService.toggleDisable(nativeElement, true);
          }
          this.addLoader(this.config.loaderClass);
        } else {
          if (this.config.makeDisabledDuringLoading) {
            this.domService.toggleDisable(nativeElement, false);
          }
          if (status.success) {
            this.test.emit('hello');
            this.removeLoader(EHttpResponse.SUCCESS);
          }
          if (status.error) {
            this.removeLoader(EHttpResponse.ERROR);
          }
        }
      }
    });
  }

  addLoader(htmlClass: string) {
    this.domService.addClass(this.el.nativeElement, htmlClass);
  }


  removeLoader(status: EHttpResponse) {
    const nativeElement = this.el.nativeElement;
    let timeoutDuration = 2000;
    let appendClass: string;
    this.domService.removeClass(nativeElement, this.config.loaderClass);
    if (status === EHttpResponse.SUCCESS) {
      appendClass = this.config.successClass;
      timeoutDuration = this.config.successClassDuration;
    }
    if (status === EHttpResponse.ERROR) {
      appendClass = this.config.loaderClass;
      timeoutDuration = this.config.errorClassDuration;
    }
    this.el.nativeElement.classList.add(appendClass);
    setTimeout(() => {
      this.el.nativeElement.classList.remove(appendClass);
    }, timeoutDuration);
  }
}
