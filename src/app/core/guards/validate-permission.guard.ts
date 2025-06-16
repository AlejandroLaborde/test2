import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import ls from 'localstorage-slim';
import { LoginData } from '../../interfaces/session.interface';

export const validatePermissionGuard: CanActivateFn = (route, state) => {
  const currentRoute = route.routeConfig?.path;
  const router = inject(Router);

  if (currentRoute == 'welcome') return true;

  const modules: LoginData['modules'] = ls.get('modules', { decrypt: true }) || [];

  const hasPermission = modules.some((m: {
    id: number;
    name?: string;
    permission?: "E" | "L";
    description: string;
    children?: {
      id: number;
      name: string;
      permission: "E" | "L";
      description: string;
    }[];
  }) => {
    if (m.children && m.children.length > 0) {
      return m.children.some(c => c.name === currentRoute);
    }
    return m.name === currentRoute;
  });

  if(!hasPermission) {
    router.navigate(['/login']);
  }

  return hasPermission;
};
