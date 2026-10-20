# Log do agente: tarefa1 (migração Netlify → GitHub Pages)

Status: **CONCLUÍDO na branch `migracao-github-pages` (sem merge, sem push).**

## Passo 0: Varredura de segredos (resultado, no topo)

- `.env` local contém **valores reais** (`KEYSTATIC_SECRET`, `KEYSTATIC_GITHUB_APP_ID`, `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_APP_CLIENT_SECRET`, `KEYSTATIC_GITHUB_APP_PRIVATE_KEY`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, `KEYSTATIC_REPO_OWNER`, `KEYSTATIC_REPO_NAME`). Está no `.gitignore`, **nunca foi commitado** (conferido em `git ls-files` e no histórico) e não foi alterado.
- **ALERTA (erro do agente):** numa listagem anterior, o comando imprimiu na saída da sessão as linhas da `KEYSTATIC_GITHUB_APP_PRIVATE_KEY`. Considere a chave **exposta**: no GitHub App do Keystatic, gere uma nova chave privada e revogue a antiga. Nada foi gravado em arquivo.
- Árvore final (exceto `src/content`, `public/uploads`, que não foram lidos por instrução): só há **nomes** de variáveis/padrões em textos (ex.: `tarefa1.md`), nenhum valor. Histórico tinha 1 commit, sem `.env`, `.pem` ou `.key`.
- Busca por texto (plano B); gitleaks/trufflehog não usados. Isso reduz o risco, não o elimina.
- Como o `.env` nunca entrou no git, o repo é seguro para tornar público quanto a isso; a chave deve ser trocada de qualquer forma.

## Diagnóstico (Passo 1)

- Astro `^7.3.8`, `@keystatic/core ^0.6.9`, `@keystatic/astro ^6.0.0`, npm. Antes: `output: 'server'` + `@astrojs/netlify`, Keystatic storage `github` em PROD.
- `createReader` em `src/lib/noticias.ts` (não alterado), usado por `noticias/index.astro` e `noticias/[slug].astro` (`prerender = true`).
- Sem SSR real, middleware, Actions, `_redirects`, `_headers` ou domínio próprio. Repo de projeto: `https://denilson48mgok-oss.github.io/o_estrangeiro/` (**o nome do repo `o_estrangeiro` foi tirado do config antigo do Keystatic; não há `git remote`. Confirme.**).

## O que foi alterado / removido (commits na branch)

- Removidos: `netlify.toml`, `@astrojs/netlify` (e lockfile atualizado).
- `astro.config.mjs`: `output: 'static'`, `site`, `base: '/o_estrangeiro/'`, `keystatic()` só quando `astro dev`; `react()` e `markdoc()` sempre ligados.
- `keystatic.config.ts`: `storage: { kind: 'local' }`; removidos `repo` e a cópia de `process.env`. Coleções intactas.
- Formulário de contato: Netlify Forms trocado por **FormSubmit** (grátis, sem conta, envia direto ao e-mail de `ownerData.contact.email`), com honeypot `_honey` e redirecionamento para `contato/sucesso`. **O primeiro envio após publicar dispara um e-mail de ativação; o dono precisa clicar no link.**
- `Base.astro`: `og:image` de fallback agora usa `base` (único ajuste de design/links necessário).
- `.gitignore`: agora cobre `.env.*` (exceto `.env.example`). `.env.example` sem variáveis.
- Novos: `.github/workflows/deploy.yml`, `README.md`.

## Verificação (Passo 7)

1. `npm ci` do zero + `npm run build`, sem `KEYSTATIC_*` no ambiente: **passou** (11 páginas).
2. `dist/` sem `keystatic`/`api/keystatic`: **ok** (0 arquivos).
3. `astro preview` com `/o_estrangeiro/`: home, notícias, notícia, contato, favicon e logo retornam 200. Notícias: **6 geradas em `dist/` = 6 em `src/content/noticias/`**.
4. `astro dev`: `/keystatic` e `/keystatic/collection/noticias` retornam 200 (não abri o navegador para ver a lista de posts).
5. Restos de `netlify`/`KEYSTATIC_GITHUB`/`kind: 'github'`: nenhum, fora de `.gitignore` (`.netlify/`, inofensivo), `.agyignore.md` e das próprias tarefas.
6. Varredura final de segredos: nada novo.

## Passos manuais do dono

1. **Revogar e gerar nova chave privada** do GitHub App (ver alerta).
2. Confirmar o nome do repo no GitHub (`o_estrangeiro`) e `git remote add origin ...`; se for outro, ajustar `base` em `astro.config.mjs`.
3. GitHub: **Settings → Pages → Source → GitHub Actions**.
4. Fazer merge da branch na `main` e conferir se o workflow publicou.
5. Só depois: desligar o site no Netlify e apagar o GitHub App do Keystatic.
6. Clicar no link de ativação do FormSubmit no primeiro envio de teste.
