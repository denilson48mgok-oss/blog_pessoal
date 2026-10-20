// Configuração do Tailwind CSS mapeando variáveis CSS dinâmicas a partir de ownerData.
// Permite o uso de classes de utilidade como bg-primary, text-heading e border-border.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        heading: 'var(--color-heading)',
        link: 'var(--color-link)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
    },
  },
  plugins: [],
};
