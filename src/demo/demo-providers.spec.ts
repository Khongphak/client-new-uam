import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { demoInterceptor, demoProviders } from './demo-providers';

describe('demo interceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([demoInterceptor]))] }));

  it('answers a contract endpoint without any network call', async () => {
    const res = await firstValueFrom(TestBed.inject(HttpClient).get<{ statusCode: string; data: unknown[] }>('https://real-api.example.test/v1/Roles/get-all-roles'));
    expect(res.statusCode).toBe('20000');
    expect(res.data.length).toBeGreaterThan(0);
  });

  it('answers unknown URLs with UNKNOWN_URL (40400) instead of going out', async () => {
    const res = await firstValueFrom(TestBed.inject(HttpClient).get<{ statusCode: string }>('https://elsewhere.example.test/x'));
    expect(res.statusCode).toBe('40400');
  });

  it('shows the always-visible DEMO banner on startup', () => {
    TestBed.configureTestingModule({ providers: [demoProviders] });
    TestBed.inject(HttpClient);
    expect(document.querySelector('[data-testid="demo-banner"]')?.textContent).toContain('DEMO');
  });
});
