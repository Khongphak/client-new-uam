import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    });
  });

  it('creates the root component', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders only a router-outlet as the shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('router-outlet')).not.toBeNull();
    expect(host.children.length).toBe(1);
  });
});

describe('routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('lazy-loads the placeholder page on the root path', async () => {
    const root = routes.find((r) => r.path === '');
    expect(root?.loadComponent).toBeTypeOf('function');
    expect(root?.component).toBeUndefined();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(
      harness.routeNativeElement?.querySelector('[data-testid="placeholder-page"]'),
    ).not.toBeNull();
  });
});
