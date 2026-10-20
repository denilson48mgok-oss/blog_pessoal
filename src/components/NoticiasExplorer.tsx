// Ilha interativa em React para exploração, busca e filtragem em tempo real de notícias.
// Gerencia busca por texto, filtro por data específica, ordenação cronológica e exibição em grid responsivo.

import React, { useState, useMemo } from 'react';

export interface NoticiaItemProp {
  slug: string;
  titulo: string;
  data: string; // Formato ISO YYYY-MM-DD
  resumo: string;
  imagem: string | null;
}

interface NoticiasExplorerProps {
  noticias: NoticiaItemProp[];
  baseUrl: string;
  siteName: string;
}

// Remove acentuação e converte para minúsculas para busca insensível a acentos e caixa
function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Formata a data ISO (YYYY-MM-DD) para pt-BR idêntico à home
function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('-').map(Number);
  if (!ano || !mes || !dia) return dataIso;
  const dataObj = new Date(Date.UTC(ano, mes - 1, dia));
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dataObj);
}

export default function NoticiasExplorer({ noticias, baseUrl, siteName }: NoticiasExplorerProps) {
  const [termoBusca, setTermoBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'recentes' | 'antigas'>('recentes');
  const [filtroData, setFiltroData] = useState('');

  // Aplica os filtros de busca em tempo real, data e ordenação
  const noticiasFiltradas = useMemo(() => {
    let resultado = [...noticias];

    // Filtro por texto em tempo real (título e resumo)
    if (termoBusca.trim() !== '') {
      const termoNormalizado = normalizarTexto(termoBusca.trim());
      resultado = resultado.filter((item) => {
        const tituloNormalizado = normalizarTexto(item.titulo);
        const resumoNormalizado = normalizarTexto(item.resumo);
        return tituloNormalizado.includes(termoNormalizado) || resumoNormalizado.includes(termoNormalizado);
      });
    }

    // Filtro por data exata (YYYY-MM-DD)
    if (filtroData.trim() !== '') {
      resultado = resultado.filter((item) => item.data === filtroData);
    }

    // Ordenação por data (mais recentes ou mais antigas)
    resultado.sort((a, b) => {
      const comparacao = b.data.localeCompare(a.data);
      return ordenacao === 'recentes' ? comparacao : -comparacao;
    });

    return resultado;
  }, [noticias, termoBusca, ordenacao, filtroData]);

  const temFiltroAtivo = termoBusca !== '' || filtroData !== '' || ordenacao !== 'recentes';

  const limparFiltros = () => {
    setTermoBusca('');
    setOrdenacao('recentes');
    setFiltroData('');
  };

  return (
    <div className="w-full">
      {/* Barra de controles: busca, filtro por data, ordenação e botão limpar */}
      <div className="mb-8 rounded-lg border border-border bg-surface p-4 shadow-xs sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          {/* Campo de Busca em tempo real */}
          <div className="lg:col-span-2">
            <label htmlFor="busca-noticias" className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1.5">
              Buscar notícia
            </label>
            <div className="relative">
              <input
                id="busca-noticias"
                type="search"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Digite palavras-chave do título ou resumo..."
                className="w-full rounded-md border border-border bg-background px-3.5 py-2 text-sm text-text placeholder:text-textMuted/70 transition-colors focus:border-primary focus:outline-2 focus:outline-primary"
              />
              {termoBusca && (
                <button
                  type="button"
                  onClick={() => setTermoBusca('')}
                  aria-label="Limpar campo de busca"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-textMuted hover:text-primary"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Filtro por Data */}
          <div>
            <label htmlFor="filtro-data" className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1.5">
              Filtrar por data
            </label>
            <input
              id="filtro-data"
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text transition-colors focus:border-primary focus:outline-2 focus:outline-primary"
            />
          </div>

          {/* Ordenação */}
          <div>
            <label htmlFor="ordenacao-noticias" className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1.5">
              Ordenar por
            </label>
            <select
              id="ordenacao-noticias"
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as 'recentes' | 'antigas')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text transition-colors focus:border-primary focus:outline-2 focus:outline-primary"
            >
              <option value="recentes">Mais recentes</option>
              <option value="antigas">Mais antigas</option>
            </select>
          </div>
        </div>

        {/* Linha auxiliar: contador e botão limpar filtros */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <span className="text-xs font-medium text-textMuted" aria-live="polite">
            {noticiasFiltradas.length === 1
              ? '1 notícia encontrada'
              : `${noticiasFiltradas.length} notícias encontradas`}
          </span>

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={limparFiltros}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
            >
              <span>&times;</span>
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Cards ou Mensagem de Nenhum Resultado */}
      {noticiasFiltradas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="font-heading text-lg font-bold text-heading">Nenhuma notícia encontrada</p>
          <p className="mt-1 text-sm text-textMuted">
            Não encontramos matérias para os termos ou filtros aplicados.
          </p>
          {temFiltroAtivo && (
            <div className="mt-6">
              <button
                type="button"
                onClick={limparFiltros}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {noticiasFiltradas.map((noticia) => {
            const urlNoticia = `${baseUrl}noticias/${noticia.slug}/`;
            const imagemUrl = noticia.imagem
              ? `${baseUrl}${noticia.imagem.replace(/^\//, '')}`
              : null;

            return (
              <a
                key={noticia.slug}
                href={urlNoticia}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface no-underline transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {/* Bloco de imagem ou bloco com cor como fallback */}
                <div className="relative aspect-video w-full overflow-hidden bg-surface border-b border-border">
                  {imagemUrl ? (
                    <img
                      src={imagemUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                      <span className="font-heading text-xs font-semibold uppercase tracking-wider">
                        {siteName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Conteúdo textual do card */}
                <div className="flex flex-1 flex-col p-5">
                  <time
                    dateTime={noticia.data}
                    className="text-xs font-medium text-textMuted"
                  >
                    {formatarData(noticia.data)}
                  </time>
                  <h3 className="mt-2 font-heading text-lg font-bold leading-snug text-heading transition-colors group-hover:text-primary">
                    {noticia.titulo}
                  </h3>
                  {noticia.resumo && (
                    <p className="mt-2 line-clamp-3 text-sm text-textMuted leading-relaxed">
                      {noticia.resumo}
                    </p>
                  )}
                  <div className="mt-auto pt-4 flex items-center text-xs font-semibold text-primary">
                    <span>Ler matéria completa</span>
                    <span className="ml-1 transition-transform group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
