/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          foreground: 'rgb(var(--success-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: `0.75rem`,
        md: `0.5rem`,
        sm: `0.25rem`,
      },
      keyframes: {
        'slide-in-fade': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-up-fade': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out-to-right': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(100%)' },
        },
        'fade-in': {
            from: { opacity: 0 },
            to: { opacity: 1 },
        },
        'fade-out': {
            from: { opacity: 1 },
            to: { opacity: 0 },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'slide-in-fade': 'slide-in-fade 0.5s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
        'slide-up-fade': 'slide-up-fade 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
        'slide-in-from-right': 'slide-in-from-right 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
        'slide-out-to-right': 'slide-out-to-right 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
        'fade-in': 'fade-in 0.2s ease-in-out forwards',
        'fade-out': 'fade-out 0.2s ease-in-out forwards',
        'marquee': 'marquee 60s linear infinite',
      }
    }
  },
  plugins: [],
}
