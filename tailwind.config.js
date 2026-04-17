/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        // Semantic — design-system.json color.semantic
        'background-base': '#0A0A0A',
        'background-surface': '#161616',
        'background-elevated': '#1C1C1C',
        'background-overlay': 'rgba(255,255,255,0.04)',
        'border-default': 'rgba(255,255,255,0.08)',
        'border-subtle': 'rgba(255,255,255,0.05)',
        'border-accent-orange': 'rgba(255,80,0,0.4)',
        'border-accent-purple': 'rgba(138,47,201,0.4)',
        'text-primary': '#FFFFFF',
        'text-secondary': 'rgba(255,255,255,0.6)',
        'text-tertiary': 'rgba(255,255,255,0.35)',
        'text-disabled': 'rgba(255,255,255,0.2)',
        'accent-primary': '#FF5500',
        'accent-secondary': '#8B2FC9',
        positive: '#22C55E',
        negative: '#EF4444',
        neutral: '#6B6B6B',
        // Primitives — sering dipakai
        'ds-black': {
          100: '#0A0A0A',
          200: '#111111',
          300: '#161616',
          400: '#1C1C1C',
          500: '#242424',
        },
        'ds-gray': {
          100: '#2A2A2A',
          200: '#333333',
          300: '#4A4A4A',
          400: '#6B6B6B',
          500: '#8A8A8A',
          600: '#AAAAAA',
        },
        'ds-orange': {
          100: '#FF4500',
          200: '#FF5500',
          300: '#FF6600',
        },
        'ds-purple': {
          100: '#4B0082',
          200: '#6A0DAD',
          300: '#8B2FC9',
          400: '#A855F7',
        },
        'blue-info': '#3B82F6',
      },
      borderRadius: {
        none: '0px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
        full: '9999px',
        input: '8px',
        badge: '6px',
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'DM Sans',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      boxShadow: {
        'card-default':
          '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'card-elevated':
          '0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
        'card-orange-active':
          '0 0 32px rgba(255,80,0,0.25), 0 0 0 1px rgba(255,80,0,0.35)',
        'button-orange': '0 4px 20px rgba(255,80,0,0.45)',
        'button-purple': '0 4px 20px rgba(138,47,201,0.45)',
        'glow-orange-ambient': '0 0 80px 20px rgba(255,80,0,0.2)',
        'glow-purple-ambient': '0 0 80px 20px rgba(138,47,201,0.2)',
        'input-focus': '0 0 0 2px rgba(255,80,0,0.5)',
        sidebar: '4px 0 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
