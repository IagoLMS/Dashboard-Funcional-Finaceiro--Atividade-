/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas:      '#f0f2f5',
        text:        '#040B16',
        cyan:        '#51C7D2',
        white:       '#FFFFFF',
        smoke:       '#EEEEEC',
        primary:     '#06668F',
        'dark-cyan': '#0197B2',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,.07)',
        soft:    '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)',
        modal:   '0 20px 50px rgba(0,0,0,.25)',
        login:   '0 20px 60px rgba(0,0,0,.30)',
      },
      keyframes: {
        'fade-in':  { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
        'slide-in': { '0%': { opacity: 0, transform: 'translateX(-10px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: {
        'fade-in':  'fade-in .3s ease both',
        'slide-in': 'slide-in .25s ease both',
      },
    },
  },
  plugins: [],
}
