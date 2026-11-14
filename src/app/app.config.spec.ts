import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from 'primeng/button';

import { appConfig } from './app.config';

@Component({
  imports: [Button],
  template: `<p-button label="บันทึก" icon="pi pi-check" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ButtonHost {}

describe('appConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  it('renders a PrimeNG button with the configured provider', async () => {
    const fixture = TestBed.createComponent(ButtonHost);
    await fixture.whenStable();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button.p-button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain('บันทึก');
    expect(button?.querySelector('.pi.pi-check')).not.toBeNull();
  });

  it('injects the Lara theme CSS variables from providePrimeNG', async () => {
    const fixture = TestBed.createComponent(ButtonHost);
    await fixture.whenStable();

    const css = Array.from(document.head.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('\n');
    expect(css).toContain('--p-primary-500');
    expect(css).toContain('--p-button-');
  });
});
