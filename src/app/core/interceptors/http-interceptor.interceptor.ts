import { HttpInterceptorFn } from '@angular/common/http';

export const httpInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const userToken = localStorage.getItem('token');
  if (userToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${userToken}`,
      },
    });
  }
  return next(req);
};
