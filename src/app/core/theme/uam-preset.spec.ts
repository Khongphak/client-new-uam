import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from 'primeng/button';
import { providePrimeNG } from 'primeng/config';

import { UAM_THEME_OPTIONS, UamPreset } from './uam-preset';

@Component({
  imports: [Button],
  template: `<p-button label="บันทึก" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ButtonHost {}

/** All CSS text PrimeNG has injected into <head> so far. */
function injectedCss(): string {
  return Array.from(document.head.querySelectorAll('style'))
    .map((s) => s.textContent ?? '')
    .join('\n')
    .replace(/\s+/g, '');
}

describe('UamPreset', () => {
  it('sets the primary palette from #2854a7 (not the Lara default emerald)', () => {
    const primary = (UamPreset.semantic as { primary: Record<string, string> }).primary;
    expect(primary['500']).toBe('#2854a7');
    expect(primary['50']).toBeTruthy();
    expect(primary['950']).toBeTruthy();
  });

  it('keeps the design single-theme: no dark mode selector', () => {
    expect(UAM_THEME_OPTIONS.darkModeSelector).toBe('none');
  });

  describe('when provided to PrimeNG', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [providePrimeNG({ theme: { preset: UamPreset, options: UAM_THEME_OPTIONS } })],
      });
    });

    it('injects --p-primary-500: #2854a7 and no emerald primary', async () => {
      const fixture = TestBed.createComponent(ButtonHost);
      await fixture.whenStable();

      const css = injectedCss();
      expect(css).toContain('--p-primary-500:#2854a7');
      expect(css).not.toContain('--p-primary-500:#10b981');
    });

    it('renders a p-button whose primary colour variables come from the UAM palette', async () => {
      const fixture = TestBed.createComponent(ButtonHost);
      await fixture.whenStable();

      const button = (fixture.nativeElement as HTMLElement).querySelector('button.p-button');
      expect(button?.textContent).toContain('บันทึก');
      // The button's background variable resolves through the semantic primary colour.
      expect(injectedCss()).toMatch(
        /--p-button-primary-background:var\(--p-primary-color\)|--p-button-primary-background:#2854a7/,
      );
      expect(injectedCss()).toContain('--p-primary-color:var(--p-primary-500)');
    });

    it('uses the design focus ring colour', async () => {
      const fixture = TestBed.createComponent(ButtonHost);
      await fixture.whenStable();
      expect(injectedCss()).toContain(
        '--p-focus-ring-shadow:0 0 0 0.2rem #bfdbfe'.replace(/\s+/g, ''),
      );
    });
  });
});
