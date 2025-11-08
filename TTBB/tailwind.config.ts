import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Typography: Primary and secondary font families for Korean text
      // Primary: Pretendard - modern, clean Korean font
      // Secondary: Noto Sans KR - fallback Korean font
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        pretendard: ['Pretendard', 'system-ui', 'sans-serif'],
        notoSansKr: ['Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      // Color Palette: TTBB Brand Colors
      colors: {
        // shadcn/ui semantic colors (uses CSS variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Brand primary color - Cream Beige (#F6E6D0)
        // Usage: bg-primary, text-primary
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Brand secondary color - White (#FFFFFF)
        // Usage: bg-secondary, text-secondary
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        // Brand accent color - Brown (#B67C5C)
        // Usage: bg-accent, text-accent, hover:bg-accent
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Grayscale palette for backgrounds, borders, and text
        // Usage: bg-gray-100, border-gray-200, text-gray-500, text-gray-900
        gray: {
          100: '#F6F6F6', // Light background
          200: '#E0E0E0', // Borders, dividers
          500: '#A0A0A0', // Muted text, placeholders
          900: '#2C2C2C', // Primary text, headings
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;

export default config;
