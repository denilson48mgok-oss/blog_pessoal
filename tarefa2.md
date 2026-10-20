# Tarefa: migrar a leitura das notícias para Astro Content Collections (com zod)

## Contexto

Hoje o site lê as notícias com o **leitor do Keystatic** (`createReader` de `@keystatic/core/reader`), num utilitário que expõe `listarNoticias`, `obterNoticia` e `gerarResumo`. Ele funciona, mas:

- depende do `keystatic.config.ts` e do `@keystatic/core` **no build de produção**;
- usa vários `as unknown as ...` para forçar tipos;
- não valida o frontmatter: um arquivo fora do padrão (data errada, campo faltando) pode quebrar o build com erro obscuro ou ordenar errado em silêncio.

O objetivo é trocar o leitor pelas **Content Collections do Astro**: `src/content.config.ts` com `loader` + **schema zod**, `getCollection`/`getEntry` e `render()`. O build passa a validar cada notícia e a apontar o arquivo com problema, e o site deixa de importar o Keystatic em produção.

**O que NÃO muda:** os arquivos de conteúdo (`src/content/noticias/*.mdoc`), o Keystatic como painel de edição em modo local (dev), o `keystatic.config.ts` e o Pages CMS (se existir um `.pages.yml`). Os dois editores continuam escrevendo os mesmos arquivos; o que muda é só quem **lê**.

## Ordem em relação às outras tarefas

- Faça esta tarefa **depois** da `tarefa.md` (migração para GitHub Pages) estar aplicada e mergeada, para evitar conflitos em `package.json` e `astro.config.*`. Se ainda não estiver, crie a branch a partir da branch daquela tarefa e avise no relatório.
- A `tarefa_implementarpagescms.md` é independente desta.
- A regra da `tarefa.md` "não remover `keystatic.config.ts`/`@keystatic/core` porque o leitor os usa em produção" deixa de valer para a **produção** depois desta tarefa, mas os dois **continuam necessários para o painel admin em dev**. Não os remova.

## Regras para o agente

- Trabalhe numa branch nova: `content-collections`. Não faça push nem merge na `main`.
- **Não altere nenhum arquivo de conteúdo** (`src/content/**`, `public/uploads/**`).
- Não altere o `keystatic.config.ts`, o `.pages.yml`, o design nem a aparência das páginas. A saída HTML deve ficar equivalente; qualquer diferença precisa ser listada no relatório (ver "Verificação").
- Mantenha os nomes das funções públicas do utilitário (`listarNoticias`, `obterNoticia`, `gerarResumo`) para reduzir mudanças nas páginas.
- Siga a documentação **da versão do Astro instalada** (a API de content collections mudou entre versões).
- Não imprima nem commite segredos. Se algo não bater com este documento, pare e pergunte.

## Passos

### 1. Diagnóstico (só leitura)

Anote antes de mexer em qualquer coisa:

- **Versão do Astro.** Se for **menor que 5**, pare e avise: a API de loaders (`glob`) usada aqui não existe lá.
- Se `@astrojs/markdoc` já está instalado e registrado no `astro.config.*`, e se existe `markdoc.config.*` (tags/nodes customizados).
- Se já existe `src/content.config.ts` ou `src/content/config.ts` (formato legado). Se existir, pare e avise antes de sobrescrever.
- O arquivo do utilitário do leitor (`createReader`) e **todas as páginas/componentes que o importam** (listagem, página da notícia, home, RSS, sitemap, busca etc.).
- **Como as páginas renderizam o corpo** hoje (`conteudo()`, `Markdoc.transform`, `Markdoc.renderers.html`, componente próprio?). Anote exatamente.
- 3 a 4 arquivos reais de `src/content/noticias/`: extensão, delimitadores, e o **formato cru de cada campo**: a `data` aparece com aspas ou sem (`data: 2026-10-19`)? Como aparecem `resumo` e `imagem` quando vazios (ausentes, `''`, `null`)? A `imagem` vem como `/uploads/noticias/arquivo.ext`? O corpo vem depois do frontmatter?
- Se o projeto roda Pagefind (ou outra etapa pós-build) e onde isso entra no script de build.
- Se o `astro.config.*` registra integrações condicionalmente para dev (`isDev`). O `markdoc()` **não** pode ficar dentro desse condicional.

### 2. Linha de base (antes de mudar)

- Rodar o build atual e **copiar a pasta `dist/` inteira** para um local fora do repositório (ex.: `/tmp/dist-antes`), ou para uma pasta ignorada pelo git. Isso é a referência para a comparação final. Não commitar.

### 3. Dependências

- Instalar `@astrojs/markdoc` na versão compatível com o Astro (`npx astro add markdoc` ou `npm install @astrojs/markdoc`) e registrar o `markdoc()` em `integrations`, **para dev e produção**.
- Adicionar `@markdoc/markdoc` como **dependência direta** (o resumo automático vai usá-lo; não dependa de ele vir de passagem).
- Se `markdoc.config.*` já existia, mantê-lo.

### 4. Criar `src/content.config.ts`

Rascunho (adapte ao formato real dos arquivos encontrado no diagnóstico):

```ts
// Schema das notícias. Edição: Keystatic (dev) e Pages CMS (opcional).
// Mantenha em sincronia com keystatic.config.ts e .pages.yml.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod'; // se não resolver nesta versão, importe z de 'astro:content'

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
  }),
});

export const collections = { noticias };
```

Observações importantes:

- O `glob` usa `*.mdoc` (sem subpastas), porque no Keystatic o caminho é `src/content/noticias/*`.
- O `id` da entrada precisa continuar igual ao slug atual (nome do arquivo sem extensão), para as URLs não mudarem. Compare os ids gerados com os nomes dos arquivos.
- Um `slug:` no frontmatter sobrescreve o `id` no loader. Os arquivos do Keystatic não devem ter essa chave; se tiverem, avise.
- O corpo (`conteudo`) **não** entra no schema: no Keystatic ele fica fora do frontmatter, e o Astro o entrega em `entry.body`.

### 5. Reescrever o utilitário do leitor

Manter o arquivo e os nomes exportados; trocar o `createReader` por `getCollection`/`getEntry`. Mantenha as funções `extrairTextoDeNo` e `formatarLimite160` **exatamente como estão** (o resumo automático continua com o mesmo comportamento). Esqueleto:

```ts
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

function paraItem(entry: Noticia): NoticiaItem {
  return { slug: entry.id, entry, ...entry.data };
}

export async function listarNoticias(): Promise<NoticiaItem[]> {
  const entradas = await getCollection('noticias');
  // a ordem do getCollection não é garantida: ordenar sempre
  return entradas.map(paraItem).sort((a, b) => b.data.localeCompare(a.data));
}

export async function obterNoticia(slug: string): Promise<NoticiaItem | null> {
  const entry = await getEntry('noticias', slug);
  return entry ? paraItem(entry) : null;
}

export function gerarResumo(noticia: Pick<NoticiaItem, 'resumo' | 'entry'>): string {
  const manual = noticia.resumo ?? noticia.entry.data.resumo;
  if (manual && manual.trim().length > 0) return formatarLimite160(manual);

  const corpo = noticia.entry.body ?? '';
  if (!corpo) return '';
  // Mesma extração de texto de antes, agora sobre a árvore do Markdoc do corpo bruto
  return formatarLimite160(extrairTextoDeNo(Markdoc.parse(corpo)));
}

// ...extrairTextoDeNo e formatarLimite160 sem alterações
```

- Remover o `createReader`, o import do `keystatic.config.ts` e todos os `as unknown as ...`.
- Se `gerarResumo` virar síncrona, as chamadas existentes com `await` continuam funcionando; não precisa mexer nelas, mas confira.
- A interface `NoticiaItem` agora é derivada do schema; remova `NoticiaEntryData`, `MarkdocDocumentNode` e tipos que só existiam por causa do leitor, se nenhum outro arquivo os usar.

### 6. Atualizar os consumidores

- Páginas/componentes que usavam `noticia.conteudo()` passam a usar:

  ```astro
  ---
  import { render } from 'astro:content';
  const { Content } = await render(noticia.entry);
  ---
  <Content />
  ```

- Em páginas dinâmicas (`[slug].astro`), manter `getStaticPaths` com `params: { slug: item.slug }` e passar o item/entry via `props`.
- Se o corpo era renderizado com `Markdoc.transform` + um renderizador próprio, ou com tags/nodes customizados, **não invente equivalência**: leve a configuração para `markdoc.config.*` apenas se já existia; caso contrário, use o `<Content />` padrão e confira a diferença no HTML (passo 8).
- Procurar por qualquer outro uso do leitor: `grep -r "keystatic/reader\|createReader" src`. O resultado final deve ser **vazio**.

### 7. Checagem de tipos

- Rodar `npx astro sync` e depois `npx astro check` (se `@astrojs/check` não estiver instalado, use `tsc --noEmit` após o sync). **Zero erros.**
- Se o dev server já estiver aberto durante a mudança de schema, reiniciá-lo (o Astro pode precisar de restart ou `s + enter` para reconhecer o schema novo).

### 8. Verificação (obrigatória antes de dar como concluído)

1. **Build passa** sem nenhuma variável `KEYSTATIC_*` definida.
2. **Mesmas páginas e mesmas URLs:** comparar a lista de `index.html` em `dist/` com a linha de base (`diff` das listas ordenadas). Contagem de páginas de notícia = quantidade de arquivos em `src/content/noticias/`.
3. **Diff do HTML das notícias** (listagem e páginas individuais) entre `/tmp/dist-antes` e o `dist/` novo. Classifique cada diferença encontrada em:
   - *esperada e inofensiva* (ex.: `id` nos títulos gerados pelo `@astrojs/markdoc`, espaços em branco, o elemento `<article>` que o Markdoc usa como raiz por padrão);
   - *inesperada* (texto faltando, imagem quebrada, ordem diferente, resumo diferente, data diferente).
   Não "conserte" por conta própria diferenças que alterem o visual: liste-as no relatório para o dono decidir.
4. **Teste negativo:** criar temporariamente um arquivo de notícia com data inválida (ex.: `data: ontem`) e outro sem `titulo`; o build deve **falhar apontando o arquivo e o campo**. Depois remover os dois arquivos de teste (e conferir com `git status` que não sobrou nada).
5. **Resumo:** confirmar que uma notícia com o campo `resumo` vazio gera o resumo automático (primeiras frases, até ~160 caracteres), e que uma com resumo preenchido usa o texto manual.
6. **Imagem:** notícia sem `imagem` não quebra a página; notícia com `imagem` carrega.
7. **Dev:** `astro dev` funciona e `/keystatic` continua abrindo e listando as notícias. Criar um arquivo `.mdoc` de teste manualmente e confirmar que ele aparece no site em dev; depois remover.
8. Se o projeto usa **Pagefind** (ou outra etapa pós-build), confirmar que continua gerando o índice.
9. Procurar restos: `createReader`, `keystatic/reader` e `as unknown as` relacionados ao leitor em `src/`. Nenhum deve restar.

### 9. Documentação

- Adicionar ao README uma seção curta, em português: **onde mora o schema da notícia**. Agora são até três lugares que precisam andar juntos: `keystatic.config.ts`, `src/content.config.ts` e `.pages.yml` (se existir). Explique que o `src/content.config.ts` é quem **valida o build**.
- Deixar o comentário de cabeçalho no `src/content.config.ts` (já no rascunho) e adicionar um comentário equivalente no topo do `keystatic.config.ts` apontando para ele. Esta é a **única** alteração permitida nesse arquivo.

## Critérios de aceite

- Build verde, `astro check` sem erros, nenhum import do leitor do Keystatic em `src/`.
- Mesmo conjunto de URLs; diferenças de HTML todas listadas e classificadas.
- Notícia inválida derruba o build com mensagem clara apontando o arquivo.
- Keystatic em dev e Pages CMS (se existir) continuam editando os mesmos arquivos, sem alteração de conteúdo.

## Entrega

- Commits pequenos na branch `content-collections` (dependências, schema, utilitário, páginas, README), sem merge e sem push na `main`.
- Relatório final curto, em português: o que mudou, o resultado de cada item da verificação, a **lista de diferenças de HTML** com a classificação, e qualquer ponto que exija decisão do dono.

## Plano de reversão

Como o conteúdo não é alterado, basta reverter os commits da branch (ou não fazer o merge). Nenhum dado é perdido.

## Passos manuais do dono (o agente deve listar isto no relatório, não executar)

1. Conferir o relatório de diferenças de HTML e abrir o site local (`astro preview`) em 2 ou 3 notícias antigas e numa nova.
2. Criar uma notícia pelo Keystatic local e rodar o build para confirmar o fluxo completo.
3. Fazer o merge na `main` e confirmar que o GitHub Actions publicou o site.
