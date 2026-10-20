// Configuração principal do Astro: site estático para GitHub Pages, com Keystatic (painel admin) apenas no dev local, React, Markdoc e Tailwind CSS.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

// O painel do Keystatic precisa de servidor, então só entra no `astro dev`.
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  site: 'https://denilson48mgok-oss.github.io',
  base: '/', // O keystatic precisa de uma '/'. É uma issue #1170 no github "Keystatic's admin cant run under a base path yet"
  output: 'server',
  integrations: [
    react(),
    markdoc(),
    ...(isDev ? [keystatic()] : []),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  trailingSlash: 'ignore',
});
