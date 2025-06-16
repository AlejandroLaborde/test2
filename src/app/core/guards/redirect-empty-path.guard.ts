import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AppStatusService } from '../../app-status.service';

export const redirectEmptyPathGuard: CanActivateFn = (route, state) => {
  const authService = inject(AppStatusService);
  const router = inject(Router);

  if(authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);

    return false;
  }
};
