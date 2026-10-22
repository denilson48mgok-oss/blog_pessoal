// Lista oficial de categorias das matérias do blog
// COMO USAR:
// Adicione um novo objeto { value: 'nome-da-categoria', label: 'Nome da Categoria' } 
// os Schemas do Astro, filtros, paineis (keystatic, PagesCMS) são atualizados automaticamente

export const CATEGORIAS_NOTICIAS = [
    { value: 'noticia', label: 'Notícia' },
    { value: 'reflexao', label: 'Reflexão' },
    { value: 'entrevista', label: 'Entrevista' },
    { value: 'cronica', label: 'Crônica' },
    { value: 'review', label: 'Review' },
] as const;

export type CategoriaId = (typeof CATEGORIAS_NOTICIAS)[number]['value'];

export const CATEGORIAS_IDS = CATEGORIAS_NOTICIAS.map((c) => c.value) as 
    [CategoriaId,
    ...CategoriaId[]
];

export const CATEGORIA_LABEL_MAP: Record<string, string> = Object.fromEntries(
    CATEGORIAS_NOTICIAS.map((c) => [c.value, c.label])
);