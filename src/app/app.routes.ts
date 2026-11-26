import { Routes } from '@angular/router';

// Every feature is lazy-loaded (ADR-0001) to stay inside the initial bundle budget.
export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in · UAM',
    loadComponent: () => import('./access/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'forbidden',
    title: 'No access · UAM',
    loadComponent: () =>
      import('./layout/forbidden-page/forbidden-page').then((m) => m.ForbiddenPage),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        title: 'UAM',
        loadComponent: () =>
          import('./layout/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
      },
    ],
  },
  {
    path: 'notfound',
    title: 'Page not found · UAM',
    loadComponent: () =>
      import('./layout/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
  {
    path: '**',
    title: 'Page not found · UAM',
    loadComponent: () =>
      import('./layout/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];
