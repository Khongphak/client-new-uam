import { Routes } from '@angular/router';

// Every feature is lazy-loaded (ADR-0001) to stay inside the initial bundle budget.
export const routes: Routes = [
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
];
