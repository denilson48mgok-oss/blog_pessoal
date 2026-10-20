// Configuração do Keystatic CMS para gerenciamento editorial da Revista Codorninha.
// Define o modo de armazenamento e o schema da coleção de notícias.
import { config, collection, fields } from '@keystatic/core';

// O Keystatic só lê KEYSTATIC_GITHUB_CLIENT_ID e KEYSTATIC_GITHUB_CLIENT_SECRET.
// Aceitamos também os nomes com "_APP_" (usados no Netlify) para evitar erro 500 na API.
if (typeof process !== 'undefined' && process.env) {
  process.env.KEYSTATIC_GITHUB_CLIENT_ID ||= process.env.KEYSTATIC_GITHUB_APP_CLIENT_ID;
  process.env.KEYSTATIC_GITHUB_CLIENT_SECRET ||= process.env.KEYSTATIC_GITHUB_APP_CLIENT_SECRET;
}

export default config({
  storage: import.meta.env?.PROD
    ? {
        kind: 'github',
        // Valores fixos: este arquivo também roda no navegador, onde process.env não existe.
        repo: {
          owner: 'denilson48mgok-oss',
          name: 'o_estrangeiro',
        },
      }
    : { kind: 'local' },
  collections: {
    noticias: collection({
      label: 'Notícias',
      slugField: 'titulo',
      path: 'src/content/noticias/*',
      format: { contentField: 'conteudo' },
      schema: {
        titulo: fields.slug({
          name: {
            label: 'Título',
            validation: { isRequired: true },
          },
        }),
        data: fields.date({
          label: 'Data',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        resumo: fields.text({
          label: 'Resumo',
          multiline: true,
          description: 'Texto curto de introdução (opcional). Se omitido, o resumo será extraído do conteúdo.',
        }),
        imagem: fields.image({
          label: 'Imagem de capa',
          directory: 'public/uploads/noticias',
          publicPath: '/uploads/noticias/',
          description: 'Imagem principal da notícia salva em public/uploads/noticias.',
        }),
        conteudo: fields.markdoc({
          label: 'Conteúdo',
        }),
      },
    }),
  },
});
