import { Routes } from '@angular/router';

import { ACCESS_POLICY } from './access/role-access';
import { authChildGuard, authGuard, consentGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

// Every feature is lazy-loaded (ADR-0001) to stay inside the initial bundle budget.
export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in · UAM',
    loadComponent: () => import('./access/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'pdpaconsent',
    title: 'Personal data consent · UAM',
    canActivate: [consentGuard],
    loadComponent: () =>
      import('./access/consent-page/consent-page').then((m) => m.ConsentPage),
  },
  {
    path: 'forbidden',
    title: 'No access · UAM',
    loadComponent: () =>
      import('./layout/forbidden-page/forbidden-page').then((m) => m.ForbiddenPage),
  },
  {
    path: '',
    // One guard on the parent covers every route under the shell (new feature routes need nothing extra).
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'home',
        title: 'Home · UAM',
        loadComponent: () => import('./home/home-page/home-page').then((m) => m.HomePage),
      },
      {
        path: 'report',
        title: 'Report · UAM',
        canActivate: [roleGuard(ACCESS_POLICY.report)],
        loadComponent: () =>
          import('./reporting/report-page/report-page').then((m) => m.ReportPage),
      },
      {
        path: 'setting/users-setting',
        title: 'User & Permission · UAM',
        canActivate: [roleGuard(ACCESS_POLICY['user-permission'])],
        loadComponent: () =>
          import('./identity-roles/user-permission/user-permission-page').then(
            (m) => m.UserPermissionPage,
          ),
      },
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
