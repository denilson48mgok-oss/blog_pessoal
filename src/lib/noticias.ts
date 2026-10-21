// Utilitário para leitura e manipulação das notícias via Astro Content Collections.
// Fornece listagem cronológica, busca por slug e extração inteligente de resumo.

import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import Markdoc from '@markdoc/markdoc';

export type Noticia = CollectionEntry<'noticias'>;

export interface NoticiaItem {
  slug: string;
  titulo: string;
  data: string;
  resumo: string | null;
  imagem: string | null;
  entry: Noticia;
}

// Interface estrutural para nós da árvore sintática do Markdoc
interface MarkdocNodeChild {
  type?: string;
  attributes?: {
    content?: string;
    [key: string]: unknown;
  };
  children?: MarkdocNodeChild[];
}

function paraItem(entry: Noticia): NoticiaItem {
  return { slug: entry.id, entry, ...entry.data };
}

/**
 * Percorre recursivamente a árvore do Markdoc extraindo os nós de texto.
 */
function extrairTextoDeNo(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as MarkdocNodeChild;
  let texto = '';
  if (n.attributes && typeof n.attributes.content === 'string') {
    texto += n.attributes.content + ' ';
  }
  if (Array.isArray(n.children)) {
    for (const filho of n.children) {
      texto += extrairTextoDeNo(filho);
    }
  }
  return texto;
}

/**
 * Ajusta o texto para o limite de aproximadamente 160 caracteres,
 * priorizando o encerramento em pontuação de fim de frase ou em fronteira de palavra.
 */
function formatarLimite160(texto: string): string {
  const normalizado = texto.trim().replace(/\s+/g, ' ');
  if (normalizado.length <= 160) {
    return normalizado;
  }

  const trecho = normalizado.slice(0, 160);
  const ultimoPonto = Math.max(
    trecho.lastIndexOf('. '),
    trecho.lastIndexOf('! '),
    trecho.lastIndexOf('? ')
  );

  // Se houver finalização de frase que ocupe boa parte do limite (> 60 caracteres)
  if (ultimoPonto > 60) {
    return trecho.slice(0, ultimoPonto + 1);
  }

  // Corta na última palavra antes de ~157 caracteres e anexa reticências
  const cortePalavra = trecho.slice(0, 157).lastIndexOf(' ');
  if (cortePalavra > 30) {
    return `${trecho.slice(0, cortePalavra).trim()}...`;
  }

  return `${trecho.slice(0, 157).trim()}...`;
}

/**
 * Lista todas as notícias cadastradas, ordenadas da mais recente para a mais antiga.
 */
export async function listarNoticias(): Promise<NoticiaItem[]> {
  const entradas = await getCollection('noticias');
  // A ordem de retorno de getCollection não é garantida pela API
  return entradas.map(paraItem).sort((a, b) => b.data.localeCompare(a.data));
}

/**
 * Obtém uma notícia específica a partir de seu slug.
 * Retorna null caso a notícia não seja encontrada.
 */
export async function obterNoticia(slug: string): Promise<NoticiaItem | null> {
  const entry = await getEntry('noticias', slug);
  return entry ? paraItem(entry) : null;
}

/**
 * Gera um resumo curto (máximo de aproximadamente 160 caracteres).
 * Utiliza o campo resumo se preenchido; caso contrário, extrai as primeiras frases do conteúdo.
 */
export function gerarResumo(noticia: Pick<NoticiaItem, 'resumo' | 'entry'>): string {
  const manual = noticia.resumo ?? noticia.entry.data.resumo;
  if (manual && manual.trim().length > 0) return formatarLimite160(manual);

  const corpo = noticia.entry.body ?? '';
  if (!corpo) return '';
  return formatarLimite160(extrairTextoDeNo(Markdoc.parse(corpo)));
}
