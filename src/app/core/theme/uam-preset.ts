import { definePreset, palette } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';

/**
 * UAM theme for PrimeNG 21: Lara with the UAM primary colour.
 * Every base preset defaults primary to emerald, so the override is required (ADR-0001 (ก)).
 * Colours that are not part of a PrimeNG palette live in src/styles/_tokens.scss as --uam-*.
 */
export const UamPreset = definePreset(Lara, {
  semantic: {
    primary: palette('#2854a7'),
    // Inputs and buttons share one 10px radius in the design.
    formField: { borderRadius: '0.625rem', borderColor: '#b9c0cc' },
    colorScheme: {
      light: {
        focusRing: { shadow: '0 0 0 0.2rem #bfdbfe' },
        text: { color: '#363636' },
      },
    },
  },
});

/** The design has a single light theme, so PrimeNG's dark mode is switched off. */
export const UAM_THEME_OPTIONS = { darkModeSelector: 'none' } as const;
