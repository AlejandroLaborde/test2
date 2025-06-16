import { TestBed } from '@angular/core/testing';

import { PreceptorService } from './preceptor.service';

describe('PreceptorService', () => {
  let service: PreceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
