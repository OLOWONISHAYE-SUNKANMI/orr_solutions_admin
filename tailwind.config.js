/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      grotesk: ['Space Grotesk', 'sans-serif'],
      poppins: ['Poppins', 'sans-serif'],
      sans: ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
    },
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        lemon: 'var(--color-lemon)',
        green: 'var(--color-green)',
        card: 'var(--color-card)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
      },
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}