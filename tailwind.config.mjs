/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          background: '#051424',
          surface: '#051424',
          'surface-dim': '#051424',
          'surface-bright': '#2c3a4c',
          'surface-container-lowest': '#010f1f',
          'surface-container-low': '#0d1c2d',
          'surface-container': '#122131',
          'surface-container-high': '#1c2b3c',
          'surface-container-highest': '#273647',
          'on-surface': '#d4e4fa',
          'on-surface-variant': '#bac9cc',
          'outline': '#849396',
          'outline-variant': '#3b494c',
          primary: '#c3f5ff',
          'primary-container': '#00e5ff',
          'on-primary-container': '#00626e',
          secondary: '#c0c1ff',
          'secondary-container': '#3131c0',
          'on-secondary-container': '#b0b2ff',
          tertiary: '#e8ecff',
        },
        spacing: {
          base: '4px',
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2.5rem',
          xl: '4rem',
          gutter: '1.5rem',
          margin: '2rem',
        },
        fontFamily: {
          space: ['Space Grotesk', 'sans-serif'],
          inter: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/container-queries'),
    ],
  }     