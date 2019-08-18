import {ElementRef, Injectable, Renderer2, RendererFactory2} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DomService {

  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }
  addClass(nativeElement: HTMLElement, cssClass: string) {
    this.renderer.addClass(nativeElement, cssClass);
  }

  removeClass(nativeElement: HTMLElement, cssClass: string) {
    this.renderer.removeClass(nativeElement, cssClass);
  }

  toggleDisable(nativeElement: HTMLElement, disable: boolean) {
    if (disable) {
      this.renderer.setAttribute(nativeElement, 'disabled', `${disable}`);
    } else {
      this.renderer.removeAttribute(nativeElement, 'disabled');
    }
  }
}
