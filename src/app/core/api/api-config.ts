import { InjectionToken } from '@angular/core';

/** Prefix of every UAM endpoint path (`v1/...`), taken from the environment. Empty = same origin (tests, demo). */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', { factory: () => '' });
