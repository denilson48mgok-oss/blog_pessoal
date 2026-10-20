// Configuração principal do Astro com suporte a Netlify, Keystatic, React e Tailwind CSS.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output:'server',
  adapter: netlify({
    devFeatures: {
      edgeFunctions: false,
    },
  }),
  integrations: [
    react(),
    markdoc(),
    keystatic(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  trailingSlash: 'ignore',// Configuração para ignorar a barra final nas URLs. Essencial para funcionar corretamente com o keystatic e o Netlify, evitando problemas de roteamento e garantindo que as URLs sejam consistentes.
  base: '/',
});
