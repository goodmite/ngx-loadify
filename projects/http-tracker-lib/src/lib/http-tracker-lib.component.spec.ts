import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpTrackerLibComponent } from './http-tracker-lib.component';

describe('HttpTrackerLibComponent', () => {
  let component: HttpTrackerLibComponent;
  let fixture: ComponentFixture<HttpTrackerLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HttpTrackerLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpTrackerLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
