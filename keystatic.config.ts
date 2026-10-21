// Configuração do Keystatic CMS para gerenciamento editorial da Revista Codorninha.
// Define o modo de armazenamento e o schema da coleção de notícias.
// Mantenha o schema em sincronia com src/content.config.ts (validação no build) e .pages.yml (se existir).
import { config, collection, fields } from '@keystatic/core';

// Modo local: o painel só existe no `astro dev`; em produção o site é estático.
export default config({
  storage: { kind: 'local' },
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
