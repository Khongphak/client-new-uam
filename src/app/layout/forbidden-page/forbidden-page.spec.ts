import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from '../../app.routes';
import { ForbiddenPage } from './forbidden-page';

describe('ForbiddenPage', () => {
  it('shows the 403 "No access" copy with Home and support actions', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ForbiddenPage);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="u-errpage-code"]')?.textContent).toContain('403');
    expect(el.querySelector('h1')?.textContent).toContain('don’t have access');
    expect(el.querySelector('[data-testid="forbidden-home"]')?.getAttribute('href')).toBe('/home');
    expect(el.querySelector('[data-testid="forbidden-support"]')?.getAttribute('href')).toMatch(/^mailto:/);
  });

  it('is registered at /forbidden', () => {
    expect(routes.some((r) => r.path === 'forbidden')).toBe(true);
  });
});
