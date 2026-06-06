/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkGreen: 'var(--color-dark-green)',      /* Primary brand green */
        lightGreen: 'var(--color-light-green)',     /* Light muted green */
        golden: 'var(--color-golden)',         /* Gold accents */
        textPrimary: 'var(--color-text-primary)',    /* Main text */
        textSecondary: 'var(--color-text-secondary)',  /* Secondary text */
      },
    },
  },
  plugins: [],
}
