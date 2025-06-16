import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { redirectEmptyPathGuard } from './redirect-empty-path.guard';

describe('redirectEmptyPathGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => redirectEmptyPathGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
