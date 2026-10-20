# Tarefa: adicionar o Pages CMS ao projeto (convivendo com o Keystatic)

## Contexto

Este repositório (`o_estrangeiro`, "Revista Codorninha") é um site Astro com conteúdo editado pelo **Keystatic**. O objetivo desta tarefa é adicionar o **Pages CMS** como uma **segunda porta de edição**, para que, no futuro, alguém possa editar o conteúdo pelo navegador (app hospedado em `app.pagescms.org`, gratuito, que edita o repositório via GitHub), sem precisar de servidor nem de GitHub App próprio.

O **Keystatic continua** como está, em modo local. O Pages CMS só precisa de um arquivo `.pages.yml` na raiz e **não é consumido pelo Astro**, então não afeta o build.

Esta tarefa é **independente** da `tarefa.md` (migração para GitHub Pages):

- Se a `tarefa.md` já foi aplicada, o `storage` do Keystatic já é `local`. Não mexa nele.
- Se ainda não foi, **não mexa no `storage`, no bloco de `process.env` nem em nada do Keystatic** aqui. Essa limpeza pertence à outra tarefa.

## Regras para o agente

- Trabalhe numa branch nova: `pages-cms`. Não faça push nem merge na `main`.
- **Não altere nenhum arquivo de conteúdo** (`src/content/**`, `public/uploads/**`).
- Não altere o utilitário do leitor das notícias (o arquivo que usa `createReader` de `@keystatic/core/reader`), `keystatic.config.ts`, a configuração do Astro nem os componentes. O leitor já força `storage: { kind: 'local' }`, lê os arquivos do disco no build e não precisa de mudança para o Pages CMS. O único arquivo novo de configuração é o `.pages.yml` (mais uma seção no README).
- Não imprima nem commite segredos.
- Se algo não bater com o que está descrito aqui, pare e pergunte em vez de adivinhar.

## Schema atual (Keystatic), para espelhar

Coleção `noticias`, em `src/content/noticias/*` (um arquivo por notícia, provavelmente `.mdoc`), com o corpo no campo `conteudo` (Markdoc, **sem componentes customizados**):

| Campo | Tipo no Keystatic | Observações |
|---|---|---|
| `titulo` | slug (nome obrigatório, rótulo "Título") | o slug vira o nome do arquivo |
| `data` | date | obrigatório, padrão = hoje |
| `resumo` | text multilinha | opcional |
| `imagem` | image | salva em `public/uploads/noticias`, caminho público `/uploads/noticias/` |
| `conteudo` | markdoc | corpo do arquivo (fora do frontmatter) |

## Passos

### 1. Diagnóstico (só leitura)

Antes de escrever qualquer coisa, olhe os arquivos reais e anote:

- Confirme no `keystatic.config.ts` o schema acima.
- Abra de 2 a 3 arquivos de `src/content/noticias/`. Anote a **extensão** (`.mdoc`?), os **delimitadores do frontmatter** (`---`?), o **formato exato de cada campo** (como a `data` aparece, como a `imagem` aparece: com `/uploads/noticias/arquivo.ext`?) e se o corpo vem depois do frontmatter.
- Veja como o Astro lê a coleção (provavelmente `src/content.config.ts`): o `pattern` do loader e o schema zod. O `.pages.yml` precisa produzir arquivos que passem nesse schema.
- Veja se existe `.pages.yml` ou `.pages.yaml` na raiz (se existir, pare e avise).

### 2. Criar o `.pages.yml` na raiz

Rascunho de partida (ajuste ao que o diagnóstico mostrou, mantendo os mesmos nomes de campo do frontmatter atual):

```yaml
media:
  input: public/uploads/noticias
  output: /uploads/noticias
  rename: safe

content:
  - name: noticias
    label: Notícias
    type: collection
    path: src/content/noticias
    format: yaml-frontmatter
    filename: "{primary}.mdoc"
    view:
      primary: titulo
      sort: data
      order: desc
    fields:
      - name: titulo
        label: Título
        type: string
        required: true
      - name: data
        label: Data
        type: date
        required: true
        options:
          format: yyyy-MM-dd
      - name: resumo
        label: Resumo
        type: text
        description: Texto curto de introdução (opcional). Se omitido, o resumo é extraído do conteúdo.
      - name: imagem
        label: Imagem de capa
        type: image
      - name: body
        label: Conteúdo
        type: rich-text
        options:
          format: markdown
```

Pontos que o rascunho assume e que **precisam ser conferidos** (não estão garantidos na documentação):

1. **Extensão `.mdoc`.** A documentação não diz se o Pages CMS trata `.mdoc` como frontmatter sozinho. Por isso o rascunho força `format: yaml-frontmatter`. Se os arquivos existentes forem `.md` ou `.mdx`, ajuste o `filename` para a extensão real.
2. **Nome `body` para o corpo.** Os exemplos da documentação usam `body` como campo do corpo, por isso o rascunho usa esse nome em vez de `conteudo`. Isso não afeta o Astro, porque o corpo fica fora do frontmatter.
3. **Chave `description` em campos.** Não foi verificada. Se o app rejeitar, remova.
4. **Nome do arquivo.** O Pages CMS gera o nome a partir do `titulo` (slugificado). O slugificador do Keystatic pode diferenciar de forma mínima em acentos e pontuação. Isso só afeta arquivos novos.

### 3. Validação local (o que o agente consegue fazer)

- Validar a sintaxe YAML do `.pages.yml` (ex.: com Python `yaml.safe_load` ou `npx yaml-lint`).
- Conferir, campo a campo, que **os nomes e formatos do `.pages.yml` batem com o frontmatter dos arquivos existentes** e com o schema do Astro.
- Rodar o build do projeto e confirmar que **nada mudou** (o `.pages.yml` não deve afetar o build).
- Rodar o dev e confirmar que `/keystatic` continua funcionando como antes.

O app hospedado exige login no GitHub, então **o agente não consegue testar o Pages CMS de ponta a ponta**. Essa parte é do dono (ver abaixo).

### 4. README

Adicionar uma seção curta em português:

- O que é o `.pages.yml` e que ele só serve ao Pages CMS.
- Como editar localmente (Keystatic) e como editar online (Pages CMS), sem detalhar o que não foi testado.
- Aviso de que **os dois editam os mesmos arquivos** e que mudanças no schema de um precisam ser refletidas no outro (`keystatic.config.ts` ↔ `.pages.yml`).

## Entrega

- Commits pequenos, na branch `pages-cms`. Sem merge e sem push na `main`.
- Relatório final curto, em português, com: o `.pages.yml` criado, o que foi conferido, **quais das 4 suposições acima se confirmaram ou não**, e qualquer ponto que exige decisão do dono.

## Teste manual do dono (o agente deve listar isto no relatório, não executar)

1. Fazer push da branch `pages-cms`.
2. Acessar `app.pagescms.org`, entrar com o GitHub e dar acesso ao repositório.
3. Selecionar a **branch `pages-cms`** (o Pages CMS lê o `.pages.yml` por repositório e por branch). Assim os testes não vão para a `main` e não disparam deploy.
4. Abrir "Notícias": as notícias existentes devem aparecer listadas, e a abertura de uma delas deve mostrar todos os campos preenchidos.
5. Criar uma notícia de teste com imagem de capa e salvar. Depois, comparar o arquivo gerado com uma notícia existente: delimitadores do frontmatter, formato da data, caminho da imagem (`/uploads/noticias/...`), extensão e posição do corpo.
6. Rodar o build com essa notícia de teste e confirmar que ela passa no schema e aparece no site. Como o leitor do Keystatic é quem lê os arquivos, confira especificamente:
   - a notícia aparece na listagem e tem página própria (`listarNoticias` e `obterNoticia`);
   - a **data** está como texto `yyyy-MM-dd`, porque o leitor ordena as notícias comparando essa string (`localeCompare`);
   - com o campo **Resumo vazio**, o resumo automático (primeiras frases do conteúdo) funciona;
   - o **corpo** renderiza normalmente. O Markdoc não aceita HTML cru nem `{% ... %}` no meio do texto, então se o editor gerar algo assim, o texto sai estranho ou quebra;
   - a imagem de capa carrega.

   Se der erro, voltar ao agente com a diferença encontrada.
7. Só depois de tudo certo: apagar a notícia de teste e fazer o merge na `main`.

## Plano B se os arquivos `.mdoc` não funcionarem

Como o Markdoc deste projeto não usa tags customizadas, a alternativa é converter as notícias para `.md` (e ajustar o `pattern` do loader do Astro). **Isso quebra a leitura pelo Keystatic**, que depende de `.mdoc`, então só faça isso se o dono decidir abandonar o Keystatic. Não execute sem confirmação.
