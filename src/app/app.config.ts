import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { httpInterceptorInterceptor } from './core/interceptors/http-interceptor.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom( HttpClientModule ),
    provideAnimations(),
    provideToastr(),
    provideHttpClient(
      withInterceptors([httpInterceptorInterceptor])
    ),
    CommonModule,
  ]
};
