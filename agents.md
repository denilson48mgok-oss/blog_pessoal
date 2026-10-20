# Log do agente: tarefa1 (migração Netlify → GitHub Pages)

Status: **PAUSADO, aguardando decisão do dono. Nenhum arquivo do projeto foi alterado.**

## Passo 0: Varredura de segredos (resultado)

- **Árvore de trabalho:** o arquivo `.env` (já coberto pelo `.gitignore`) contém **valores reais**. As variáveis presentes são: `KEYSTATIC_SECRET`, `KEYSTATIC_GITHUB_APP_ID`, `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_APP_CLIENT_SECRET`, `KEYSTATIC_GITHUB_APP_PRIVATE_KEY` (chave privada RSA multilinha), `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, `KEYSTATIC_REPO_OWNER` e `KEYSTATIC_REPO_NAME`.
- **ALERTA (erro do agente):** ao listar os nomes das variáveis do `.env`, o comando também imprimiu as linhas de continuação da `KEYSTATIC_GITHUB_APP_PRIVATE_KEY` na saída da sessão. A chave deve ser considerada **exposta** e deve ser **revogada e gerada de novo** (GitHub → Settings → Developer settings → GitHub Apps → o app do Keystatic → gerar nova chave privada e revogar a antiga). O valor não foi gravado em nenhum arquivo.
- Demais arquivos (exceto `src/content` e `public/uploads`, que não foram lidos por instrução): só há menções a **nomes** de variáveis em `.env.example`, `keystatic.config.ts` e `netlify.toml`, sem valores. `.env.example` está sem valores.
- **Não há `.git`** nesta pasta, então não existe histórico a varrer e não há como criar a branch `migracao-github-pages`.
- `.gitignore` cobre `.env`, `node_modules/`, `dist/` e `.netlify/`, mas **não** cobre `.env.*` genérico (só `.env.production` e `.env*.local`). Deve ser ajustado.
- `gitleaks` e `trufflehog` não foram usados; a busca foi por texto (plano B). Isso reduz o risco, mas não o elimina.

## Passo 1: Diagnóstico (só leitura)

- Astro `^7.3.8`, `@keystatic/core ^0.6.9`, `@keystatic/astro ^6.0.0`, `@astrojs/react`, `@astrojs/markdoc`, Tailwind 4 (plugin Vite). Gerenciador: **npm** (`package-lock.json`).
- `astro.config.mjs`: `output: 'server'`, adapter `@astrojs/netlify`, integrações `react()`, `markdoc()`, `keystatic()`, `trailingSlash: 'ignore'`, `base: '/'`, **sem `site`**.
- `keystatic.config.ts`: storage `github` em produção (`import.meta.env?.PROD`) e `local` em dev, com repo fixo `denilson48mgok-oss/o_estrangeiro`. Também copia `KEYSTATIC_GITHUB_APP_*` para `process.env`.
- `createReader`: em `src/lib/noticias.ts`, que importa `keystatic.config.ts`. É usado por `src/pages/noticias/index.astro` e `src/pages/noticias/[slug].astro`, ambos com `prerender = true`. Não foi alterado.
- Arquivos do Netlify: `netlify.toml` (build, `SECRETS_SCAN_OMIT_KEYS`, `functions.included_files`, redirect `/* → 200`). Não há `_redirects`, `_headers` nem `.netlify/`.
- **Formulário de contato:** `src/pages/contato.astro` usa **Netlify Forms** (`data-netlify`, honeypot) e `contato/sucesso.astro` é o redirecionamento de sucesso. **Isso deixa de funcionar no GitHub Pages.** É uma dependência de servidor não prevista na tarefa.
- Links internos já usam `import.meta.env.BASE_URL` (Header, Footer, Base, index, sobre, contato, noticias).
- Não encontrados: Actions, middleware, rotas de API próprias.
- Domínio próprio / `CNAME`: não encontrado. Não há `git remote` (sem `.git`). O nome do repo no config do Keystatic (`o_estrangeiro`) sugere repo de projeto, ou seja, `base: '/o_estrangeiro'`, mas **não está confirmado**.

## Decisões pendentes (por que parei)

1. **Sem `.git`:** devo rodar `git init` e criar a branch `migracao-github-pages`, ou o dono vai copiar para o repo novo? Qual é o nome do repo e do usuário (para `site` e `base`)? O repo é `USUARIO.github.io` ou de projeto? Há domínio próprio?
2. **Formulário de contato (Netlify Forms):** trocar por um serviço externo gratuito (ex.: Formspree), usar `mailto:`, ou remover a página?
3. **Chave privada exposta:** confirmar que o dono vai revogá-la e gerá-la de novo.

## Próximos passos após as respostas

Passos 2 a 8 da `tarefa1.md` (remover Netlify, Keystatic local, `astro.config` com `keystatic()` só no dev, workflow `deploy.yml`, `.gitignore`/`.env.example`, README, verificação, relatório final).
