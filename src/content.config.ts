// Schema das notícias. Edição: Keystatic (dev) e Pages CMS (opcional).
// Mantenha em sincronia com keystatic.config.ts e .pages.yml.
import { CATEGORIAS_IDS } from "@/data/categorias"
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// O YAML pode entregar `2026-10-19` (sem aspas) como Date. Aceita Date ou texto
// e normaliza sempre para "AAAA-MM-DD" (o código atual ordena comparando esse texto).
const dataISO = z
  .union([z.date(), z.string()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use o formato AAAA-MM-DD'));

// Campos opcionais: ausente, null ou vazio viram null (a interface atual é string | null).
const textoOpcional = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim().length > 0 ? v : null));

const noticias = defineCollection({
  loader: glob({
    base: './src/content/noticias',
    pattern: '*.mdoc',
    // preserva o nome do arquivo exatamente como o Keystatic gerou (sem alterar maiúsculas)
    generateId: ({ entry }) => entry.replace(/\.mdoc$/, ''),
  }),
  schema: z.object({
    titulo: z.string().min(1),
    data: dataISO,
    resumo: textoOpcional,
    imagem: textoOpcional,
    categorias: z
    .array(z.enum(CATEGORIAS_IDS))
    .nullish()
    .transform((v) => v ?? []),
  }),
});

export const collections = { noticias };
