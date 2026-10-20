# Tarefa: migrar o blog de Netlify para GitHub Pages (Astro + Keystatic local)

## Contexto

Este repositório é um blog feito com **Astro** e **Keystatic**. Hoje ele é publicado no **Netlify**, com o Keystatic em **modo GitHub** (GitHub App, variáveis de ambiente, adapter de servidor/SSR).

O dono não quer pagar hospedagem e já gastou os créditos do Netlify resolvendo erros de build. O objetivo é publicar de graça no **GitHub Pages**.

O problema: o painel admin do Keystatic precisa de servidor (as rotas de API dele leem e escrevem no repositório/sistema de arquivos), e o GitHub Pages só serve arquivos estáticos.

## Solução escolhida

- O **site em produção** passa a ser 100% estático (`output: 'static'`, sem adapter, sem rotas de servidor, sem `/keystatic`).
- O **Keystatic** passa a rodar em **modo local**, só no `astro dev` (em `http://localhost:4321/keystatic`).
- Fluxo de trabalho do dono: editar no Keystatic local → `git commit` + `git push` → **GitHub Actions** faz o build e publica no Pages.
- Os arquivos de conteúdo ficam nos mesmos caminhos de antes. **Não é preciso migrar nem alterar nenhum conteúdo.**

## Regras para o agente

- Trabalhe em uma branch nova: `migracao-github-pages`. Não mexa direto na `main`.
- Não altere o conteúdo dos posts, o design, nem os componentes, a não ser que seja indispensável (ex.: links quebrados por causa do `base`).
- **Não remova `keystatic.config.ts`, `@keystatic/core` nem `react`/`react-dom` do projeto.** O site usa o leitor do Keystatic (`createReader` de `@keystatic/core/reader`, num utilitário de notícias) **durante o build de produção**, e ele importa o `keystatic.config.ts`. Só o painel admin (a integração `keystatic()`) sai da produção. Não altere o utilitário do leitor: ele já força `storage: { kind: 'local' }` e continua válido.
- Não escreva nem commite segredos. Se encontrar chaves, tokens ou `.env` com valores reais, **não imprima os valores**; apenas diga quais variáveis existem.
- Não apague nada fora do repositório (site do Netlify, GitHub App). Isso o dono faz manualmente (ver "Passos manuais do dono").
- Se algo for ambíguo ou arriscado (ex.: domínio próprio, código que depende de SSR), pare e pergunte em vez de adivinhar.

## Passos

### 0. Varredura de segredos (antes de qualquer outra coisa)

O GitHub Pages no plano gratuito só publica repositórios **públicos**. Isso significa que tudo que está neste repositório (e, se ele for tornado público, **todo o seu histórico**) ficará visível para qualquer pessoa. Antes de mudar qualquer coisa, procure segredos e arquivos que não deveriam ser públicos.

**Escopo:**

- Se este repositório é **novo e sem histórico** (copiado sem a pasta `.git`), varra apenas a **árvore de trabalho**.
- Se é o repositório **antigo, com histórico**, varra a árvore de trabalho **e o histórico completo** (todas as branches).

**Como:**

1. Se `gitleaks` ou `trufflehog` estiver disponível, use-o (ex.: `gitleaks detect --no-banner --redact`). Se não estiver instalado e não der para instalar, use o plano B abaixo; **não tente baixar de sites bloqueados**.
2. Plano B (só com `git` e busca de texto): rode buscas por esses padrões na árvore de trabalho e no histórico (`git log --all -p`):
   - nomes: `SECRET`, `TOKEN`, `PASSWORD`, `PASSWD`, `API_KEY`, `PRIVATE KEY`, `CLIENT_SECRET`, `KEYSTATIC_`, `NETLIFY_AUTH`;
   - formatos conhecidos: `ghp_`, `gho_`, `ghs_`, `github_pat_`, `AKIA`, `sk-`, `xox[bp]-`, `-----BEGIN`, `Bearer `;
   - URLs com credenciais (`https://usuario:senha@...`).
3. Procure **arquivos que não devem existir no repo**, na árvore e no histórico: `.env`, `.env.*` (exceto `.env.example`), `*.pem`, `*.key`, `*.p12`, `id_rsa*`, `.netlify/`, dumps de banco, planilhas ou PDFs com dados pessoais, anotações e rascunhos internos. Para o histórico: `git log --all --diff-filter=A --name-only --pretty=format: | sort -u` e filtre por esses nomes.
4. Confira se o `.gitignore` cobre `.env*` (exceto `.env.example`), `.netlify/`, `node_modules/` e `dist/`.
5. Confira `netlify.toml`, `README`, workflows e `package.json` por valores reais de variáveis de ambiente escritos em texto.

**Regras desta etapa:**

- **Nunca imprima o valor de um segredo**, nem parcialmente. Reporte apenas: tipo, arquivo, número da linha e (se vier do histórico) o hash do commit.
- Não salve o relatório da varredura em nenhum arquivo dentro do repositório.
- **Não reescreva o histórico** (`filter-repo`, BFG, `git commit --amend`, `rebase`) e não altere a visibilidade do repositório. Isso é decisão do dono.

**O que fazer com o que for encontrado:**

- Segredo **na árvore de trabalho**: remova do arquivo, passe a ler de variável de ambiente se fizer sentido, garanta que o arquivo está no `.gitignore` e, se o projeto precisa de um modelo, deixe só um `.env.example` com os **nomes** das variáveis (sem valores). Faça isso em commit próprio.
- Segredo **no histórico**: apenas reporte. Depois que um segredo apareceu num commit, deve ser considerado exposto, mesmo que o arquivo atual esteja limpo. Reporte com destaque que o dono deve **revogar e gerar um novo** (por exemplo, o client secret do GitHub App do Keystatic e a variável `KEYSTATIC_SECRET`; o agente não tem como rotacionar nada) e que o repositório **antigo não deve ser tornado público**. O caminho seguro é publicar a partir de um repositório novo, copiado sem a pasta `.git`.
- Arquivo **sensível que não é segredo** (dados pessoais, rascunhos, anotações): reporte e pergunte ao dono se deve sair do repositório antes de ele ficar público. Não apague por conta própria.
- **Nada encontrado:** diga isso no relatório, lembrando que a varredura reduz o risco mas não o elimina.

O resultado desta etapa vai **no topo do relatório final**, antes de tudo o resto.

### 1. Diagnóstico (só leitura)

Descubra e anote:

- Versão do Astro e do Keystatic (`package.json`).
- Gerenciador de pacotes (npm, pnpm, yarn ou bun, pelo lockfile).
- `astro.config.*`: `output`, `adapter`, `integrations`, `site`, `base`.
- `keystatic.config.*`: tipo de `storage` (hoje deve ser `github`), `repo`, uso de `process.env`/`import.meta.env`.
- Onde o `createReader` é usado (provavelmente um utilitário de notícias em `src/lib` ou `src/utils`): ele depende do `keystatic.config.*` e de `@keystatic/core/reader` **em produção**. Anote o caminho do arquivo, e todas as páginas que o importam.
- Arquivos do Netlify: `netlify.toml`, `_redirects`, `_headers`, pasta `.netlify/`, `@astrojs/netlify` no `package.json`.
- Variáveis de ambiente usadas (`.env*`, `.env.example`, README), principalmente as `KEYSTATIC_*` e `PUBLIC_KEYSTATIC_*`.
- Se alguma página do site usa rotas de servidor, `export const prerender = false`, Astro Actions, middleware ou SSR de verdade (fora do Keystatic). **Se usar, pare e avise o dono**: isso não funciona no GitHub Pages.
- Se existe domínio próprio (arquivo `CNAME`, `site:` apontando para domínio próprio, referências no `netlify.toml`).
- Se o repo é `USUARIO.github.io` (sem `base`) ou um repo de projeto (precisa de `base: '/nome-do-repo'`). Descubra pelo `git remote -v`.

### 2. Remover o que é do Netlify

- Remover o adapter do Netlify do `astro.config.*` e do `package.json` (`@astrojs/netlify`). Rodar o gerenciador de pacotes para atualizar o lockfile.
- Remover `netlify.toml`. Se houver `_redirects`/`_headers` em `public/`, avisar o dono sobre o que eles faziam. Redirects simples podem virar `redirects` no `astro.config.*`; headers não existem no GitHub Pages.
- Remover variáveis do Keystatic GitHub (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, etc.) do `.env.example` e do README. Não apagar o `.env` local do dono; apenas garantir que ele está no `.gitignore`.

### 3. Keystatic em modo local

Em `keystatic.config.*`:

```ts
storage: { kind: 'local' },
```

Remover `repo` e qualquer lógica que escolhia o storage por variável de ambiente. Manter coleções, campos e caminhos exatamente como estão.

### 4. `astro.config.*`: Keystatic só no dev

Resultado esperado (adaptar às integrações que já existem, sem remover as outras):

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

const isDev = process.argv.includes('dev');

export default defineConfig({
  site: 'https://USUARIO.github.io',
  base: '/NOME-DO-REPO', // remover se o repo for USUARIO.github.io ou se houver domínio próprio
  output: 'static',
  integrations: [
    // ...integrações existentes do site
    ...(isDev ? [react(), keystatic()] : []),
  ],
});
```

Observações:

- Se o site já usa React em outro lugar, mantenha `react()` sempre ligado e deixe só o `keystatic()` condicional.
- Se o `astro dev` reclamar de modo de renderização por causa do Keystatic, use `output: isDev ? 'server' : 'static'`. O `astro build` de produção **precisa** continuar `static`.
- Preencha `site` e `base` com os valores reais do repositório (`git remote -v`). Se houver domínio próprio, `site` é o domínio e **não** se usa `base`.

### 5. Ajustar para o `base` (só se o repo for de projeto)

Se o `base` for necessário, procurar links e caminhos absolutos que quebram em `/nome-do-repo/`:

- Links internos escritos como `href="/..."` e imagens em `src="/..."` nos componentes/layouts. Corrigir usando `import.meta.env.BASE_URL` (ou helper equivalente).
- Imagens e caminhos salvos no conteúdo do Keystatic (campos `image`, `directory`, `publicPath`). Verificar se continuam resolvendo corretamente depois do build.
- Links para `/keystatic` em menus ou rodapés: remover ou esconder em produção.

### 6. Workflow do GitHub Actions

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy no GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

A action `withastro/action` detecta o gerenciador de pacotes sozinha. Se o projeto exigir uma versão específica do Node, informar via input `node-version`.

Se existir domínio próprio, garantir que `public/CNAME` existe com o domínio.

### 7. Verificação (obrigatória antes de dar como concluído)

1. Instalar dependências do zero e rodar `astro build` (ou o script `build` do projeto). Deve passar **sem nenhuma variável `KEYSTATIC_*` definida**.
2. Confirmar que a pasta `dist/` **não** contém `keystatic` nem `api/keystatic`.
3. Rodar `astro preview` e conferir a home, uma página de post, a listagem, imagens e links internos. Se houver `base`, abrir pelo caminho com `base`. Confirmar também que a **listagem de notícias e as páginas individuais de cada notícia foram geradas** em `dist/` (é o leitor do Keystatic rodando no build, sem o painel admin), comparando a quantidade de páginas com a quantidade de arquivos em `src/content/noticias/`.
4. Rodar `astro dev` e confirmar que `http://localhost:4321/keystatic` abre e lista os posts existentes (modo local).
5. Procurar no repo por restos: `netlify`, `KEYSTATIC_GITHUB`, `kind: 'github'`, `@astrojs/netlify`.
6. Repetir a varredura de segredos do Passo 0 na **árvore de trabalho final** (já com o workflow, o README e o `.env.example` novos), para garantir que nada foi introduzido durante a migração.

### 8. README

Atualizar (ou criar) o README com uma seção curta, em português:

- Como rodar localmente: instalar, `npm run dev` (ou equivalente), editar em `/keystatic`.
- Como publicar: `git add . && git commit && git push` na `main`; o GitHub Actions publica sozinho.
- Que o admin do Keystatic **não existe em produção** (só local).

## Entrega

- Commits pequenos e com mensagem clara, na branch `migracao-github-pages`.
- **Não faça merge na `main` e não faça push para ela.** Faça push apenas da branch (ou deixe local) e avise o dono.
- Relatório final curto, em português, com: **o resultado da varredura de segredos (Passo 0), no topo**, o que foi alterado, o que foi removido, resultado de cada item da verificação, e qualquer ponto que exige decisão do dono.

## Passos manuais do dono (o agente deve listar isto no relatório, não executar)

1. No GitHub: **Settings → Pages → Source → GitHub Actions**.
2. Fazer o merge da branch na `main` e conferir se o workflow publicou.
3. Só depois de confirmar que o site novo está no ar: desligar/excluir o site no Netlify e desinstalar ou apagar o **GitHub App do Keystatic** (GitHub → Settings → Developer settings → GitHub Apps).
4. Se houver domínio próprio: apontar o DNS para o GitHub Pages e configurar o domínio em Settings → Pages.
