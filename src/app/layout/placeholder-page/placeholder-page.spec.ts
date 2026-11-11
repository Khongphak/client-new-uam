import { TestBed } from '@angular/core/testing';

import { PlaceholderPage } from './placeholder-page';

describe('PlaceholderPage', () => {
  it('shows the app name as the page heading', async () => {
    const fixture = TestBed.createComponent(PlaceholderPage);
    await fixture.whenStable();

    const heading = (fixture.nativeElement as HTMLElement).querySelector('h1');
    expect(heading?.textContent).toContain('UAM');
  });
});
