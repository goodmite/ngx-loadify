import { TestBed } from '@angular/core/testing';

import { HttpTrackerLibService } from './http-tracker-lib.service';

describe('HttpTrackerLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HttpTrackerLibService = TestBed.get(HttpTrackerLibService);
    expect(service).toBeTruthy();
  });
});
