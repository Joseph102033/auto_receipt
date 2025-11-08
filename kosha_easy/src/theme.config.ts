/**
 * Design System Configuration
 * Document Submission Management System
 *
 * This file defines the complete design tokens including:
 * - Color palette (Primary, Secondary, Accent, Grayscale)
 * - Typography settings (Font families, sizes, weights)
 */

export const colors = {
  // Primary Colors - Accessible Blue
  // Base chosen to achieve WCAG AA contrast on white for normal text and
  // white-on-base for large text in buttons.
  primary: {
    light: '#60A5FA',   // blue-400
    base: '#2563EB',    // blue-600 (AA on white for text)
    dark: '#1E40AF',    // blue-800 (strong contrast backgrounds)
  },

  // Secondary Colors - Neutral Gray (AA-friendly base)
  secondary: {
    light: '#9CA3AF',   // gray-400
    base: '#6B7280',    // gray-500 (AA on white for text)
    dark: '#374151',    // gray-700
  },

  // Accent Colors - Orange (AA-friendly base for emphasis)
  // Base selected to improve contrast with white text in CTAs.
  accent: {
    light: '#FB923C',   // orange-400 (use for subtle highlights)
    base: '#EA580C',    // orange-600 (better contrast for UI elements)
    dark: '#C2410C',    // orange-700
  },

  // Grayscale - Neutral palette
  grayscale: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const;

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    serif: ['Merriweather', 'Georgia', 'serif'],
    display: ['Poppins', 'sans-serif'],
  },

  // Font Sizes with line heights
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  },

  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

// Complete design tokens export
export const designTokens = {
  colors,
  typography,
} as const;

export default designTokens;
