import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const NexthomePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef9f2',
      100: '#d7f0df',
      200: '#b2e2c2',
      300: '#82cfa0',
      400: '#52b97c',
      500: '#279d59',
      600: '#147d3e',
      700: '#126534',
      800: '#12512d',
      900: '#104326',
      950: '#072614',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f6f7f7',
          100: '#eef1ef',
          200: '#dce3de',
          300: '#b8c3bc',
          400: '#909d95',
          500: '#66736b',
          600: '#4a554e',
          700: '#343c37',
          800: '#242a26',
          900: '#17201a',
          950: '#0b120d',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f3f5f4',
          100: '#dce1de',
          200: '#b1b8b4',
          300: '#909a94',
          400: '#707a74',
          500: '#59625d',
          600: '#3a413d',
          700: '#292e2b',
          800: '#222624',
          900: '#1a1d1b',
          950: '#111312',
        },
      },
    },
  },
});
