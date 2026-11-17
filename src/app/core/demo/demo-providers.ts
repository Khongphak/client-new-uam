import { EnvironmentProviders } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

// Production stub. The `demo` build configuration swaps this file for src/demo/demo-providers.ts
// (angular.json fileReplacements), so production bundles contain no demo code or data.
export const demoHttpInterceptors: HttpInterceptorFn[] = [];
export const demoProviders: EnvironmentProviders[] = [];
