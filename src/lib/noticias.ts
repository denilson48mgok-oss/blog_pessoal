// Utilitário para leitura e manipulação das notícias gerenciadas pelo Keystatic CMS.
// Fornece listagem cronológica, busca por slug e extração inteligente de resumo.

import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config.ts';

// Interface estrutural para nós da árvore sintática do Markdoc
interface MarkdocNodeChild {
  type?: string;
  attributes?: {
    content?: string;
    [key: string]: unknown;
  };
  children?: MarkdocNodeChild[];
}

interface MarkdocDocumentNode {
  type?: string;
  children?: MarkdocNodeChild[];
  [key: string]: unknown;
}

export interface NoticiaEntryData {
  titulo: string;
  data: string;
  resumo: string | null;
  imagem: string | null;
  conteudo: () => Promise<{ node: MarkdocDocumentNode }>;
}

export interface NoticiaItem extends NoticiaEntryData {
  slug: string;
  entry: NoticiaEntryData;
}

export type NoticiaParaResumo = {
  resumo?: string | null;
  conteudo?: (() => Promise<{ node: MarkdocDocumentNode }>) | { node: MarkdocDocumentNode } | unknown;
  entry?: {
    resumo?: string | null;
    conteudo?: (() => Promise<{ node: MarkdocDocumentNode }>) | { node: MarkdocDocumentNode } | unknown;
  };
};

// Leitor Keystatic configurado para ler os arquivos locais do repositório no site público,
// evitando que tente se conectar à API do GitHub em produção para renderizar as páginas.
export const reader = createReader(process.cwd(), {
  ...keystaticConfig,
  storage: { kind: 'local' },
});

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
  const itens = await reader.collections.noticias.all();

  // Ordena por data decrescente (formato ISO YYYY-MM-DD)
  const ordenados = itens.sort((a, b) => b.entry.data.localeCompare(a.entry.data));

  return ordenados.map((item) => ({
    slug: item.slug,
    entry: item.entry as unknown as NoticiaEntryData,
    ...(item.entry as unknown as NoticiaEntryData),
  }));
}

/**
 * Obtém uma notícia específica a partir de seu slug.
 * Retorna null caso a notícia não seja encontrada.
 */
export async function obterNoticia(slug: string): Promise<NoticiaItem | null> {
  const entry = await reader.collections.noticias.read(slug);
  if (!entry) {
    return null;
  }

  const entryData = entry as unknown as NoticiaEntryData;
  return {
    slug,
    entry: entryData,
    ...entryData,
  };
}

/**
 * Gera um resumo curto (máximo de aproximadamente 160 caracteres).
 * Utiliza o campo resumo se preenchido; caso contrário, extrai as primeiras frases do conteúdo.
 */
export async function gerarResumo(noticia: NoticiaParaResumo): Promise<string> {
  // Dá suporte tanto ao objeto direto quanto aninhado em entry
  const resumoTexto = noticia.resumo ?? noticia.entry?.resumo;
  if (resumoTexto && resumoTexto.trim().length > 0) {
    return formatarLimite160(resumoTexto);
  }

  const conteudoRef = noticia.conteudo ?? noticia.entry?.conteudo;
  if (!conteudoRef) {
    return '';
  }

  let nodeRoot: unknown = null;
  if (typeof conteudoRef === 'function') {
    const markdocResolvido = await (conteudoRef as () => Promise<{ node: unknown }>)();
    nodeRoot = markdocResolvido?.node;
  } else if (typeof conteudoRef === 'object' && conteudoRef !== null && 'node' in conteudoRef) {
    nodeRoot = (conteudoRef as { node: unknown }).node;
  } else {
    nodeRoot = conteudoRef;
  }

  const textoExtraido = extrairTextoDeNo(nodeRoot);
  return formatarLimite160(textoExtraido);
}
