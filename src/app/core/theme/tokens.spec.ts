import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * The unit-test builder does not load angular.json › styles, so the real SCSS file is compiled
 * through a component with no encapsulation; its :root rule then lands in the document.
 */
@Component({
  template: '',
  styleUrl: '../../../styles/_tokens.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TokensHost {}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

describe('design tokens (:root)', () => {
  beforeEach(async () => {
    const fixture = TestBed.createComponent(TokensHost);
    await fixture.whenStable();
  });

  it.each([
    ['--uam-navy', '#00194b'],
    ['--uam-blue', '#2854a7'],
    ['--uam-muted', '#5d5d5d'],
    ['--uam-rule', '#eef0f3'],
    ['--uam-tile', '#eef1f7'],
    ['--uam-ok', '#1b6b43'],
    ['--uam-warn', '#7a4b00'],
    ['--uam-danger', '#b42318'],
  ])('%s = %s', (name, value) => {
    expect(token(name)).toBe(value);
  });

  it.each([
    ['--sp-1', '0.25rem'],
    ['--sp-2', '0.5rem'],
    ['--sp-3', '0.75rem'],
    ['--sp-4', '1rem'],
    ['--sp-5', '1.5rem'],
    ['--sp-6', '2rem'],
  ])('%s = %s', (name, value) => {
    expect(token(name)).toBe(value);
  });

  it('puts Sukhumvit Set first in the font stack', () => {
    expect(token('--uam-font-family')).toMatch(/^'?"?Sukhumvit Set/);
  });

  it('defines the brand gradient from navy to blue', () => {
    expect(token('--uam-gradient')).toContain('#00194b');
    expect(token('--uam-gradient')).toContain('#2854a7');
  });
});
