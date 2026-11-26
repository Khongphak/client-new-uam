import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { apiInterceptors } from './core/api/api-interceptors';
import { demoHttpInterceptors, demoProviders } from './core/demo/demo-providers';
import { Session } from './core/session';
import { SHELL_PROFILE } from './layout/shell/shell-profile';
import { UAM_THEME_OPTIONS, UamPreset } from './core/theme/uam-preset';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([...demoHttpInterceptors, ...apiInterceptors])),
    ...demoProviders,
    { provide: SHELL_PROFILE, useFactory: () => inject(Session).profile },
    providePrimeNG({ theme: { preset: UamPreset, options: UAM_THEME_OPTIONS } }),
  ],
};
