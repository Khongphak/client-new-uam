import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import Lara from '@primeuix/themes/lara';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // The UAM colour preset (#2854a7) is UAM-FND-02; the design has no dark mode.
    providePrimeNG({ theme: { preset: Lara, options: { darkModeSelector: 'none' } } }),
  ],
};
