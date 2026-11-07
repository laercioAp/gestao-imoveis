import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { routes } from './app.routes';
import { authInterceptor } from './core/services/interceptor/auth.interceptor';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};