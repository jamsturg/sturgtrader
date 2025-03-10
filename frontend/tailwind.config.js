/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        positive: 'var(--color-positive)',
        neutral: 'var(--color-neutral)',
        background: 'var(--color-background)',
        panel: 'var(--color-panel)',
      },
      backdropBlur: {
        xs: '2px',
        md: 'var(--blur-amount)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
