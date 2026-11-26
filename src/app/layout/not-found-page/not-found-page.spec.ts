import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from '../../app.routes';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  it('shows the 404 copy with a single Back to Home action', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NotFoundPage);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="u-errpage-code"]')?.textContent).toContain('404');
    expect(el.querySelector('h1')?.textContent).toContain('This page doesn’t exist');
    expect(el.querySelector('[data-testid="notfound-home"]')?.getAttribute('href')).toBe('/home');
    expect(el.querySelector('[data-testid="forbidden-support"]')).toBeNull();
  });

  it('is registered at /notfound and as the last-route wildcard', () => {
    expect(routes.some((r) => r.path === 'notfound')).toBe(true);
    expect(routes[routes.length - 1].path).toBe('**');
  });
});
