import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { validatePermissionGuard } from './validate-permission.guard';

describe('validatePermissionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => validatePermissionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
