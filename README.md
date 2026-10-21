# Revista Codorninha (O Estrangeiro)

Site feito com Astro e Keystatic, publicado de graça no GitHub Pages.

## Como rodar localmente

1. `npm install`
2. `npm run dev`
3. Abra `http://localhost:4321/o_estrangeiro/` para ver o site e `http://localhost:4321/keystatic` para editar as notícias.

Nenhuma variável de ambiente é necessária.

## Como publicar

```
git add .
git commit -m "Descrição da mudança"
git push
```

Ao dar push na `main`, o GitHub Actions faz o build e publica sozinho (veja `.github/workflows/deploy.yml`).

## Importante

O painel do Keystatic **não existe em produção**: ele só funciona localmente, com `npm run dev`. O site publicado é 100% estático.

## Formulário de contato

Usa o Web3Forms(app.web3forms.com) (gratuito, sem conta). No primeiro envio depois de publicar, o FormSubmit manda um e-mail de ativação para o endereço configurado em `src/data/owner_data.ts`; é preciso clicar no link desse e-mail para que as mensagens passem a chegar.


## Onde mora o schema da notícia

A estrutura (campos) de cada notícia fica definida em até três arquivos que devem ser mantidos em sincronia sempre que um campo for criado ou alterado:

- `src/content.config.ts`: define a Content Collection do Astro com Zod e é quem **valida os arquivos `.mdoc` durante o build** (apontando erro caso falte título ou a data esteja fora do formato `AAAA-MM-DD`).
- `keystatic.config.ts`: define os campos exibidos no painel de edição local (`/keystatic` em `npm run dev`).
- `.pages.yml` (se existir): define os campos para edição via Pages CMS.

## Edição de conteúdo (Keystatic e Pages CMS)

O arquivo `.pages.yml` na raiz do projeto serve exclusivamente para configurar o **Pages CMS** e não é consumido pelo Astro durante o build.

- **Edição local (Keystatic):** rode `npm run dev`, acesse `http://localhost:4321/keystatic` e depois faça commit e push das alterações.
- **Edição online (Pages CMS):** acesse `https://app.pagescms.org`, conecte sua conta GitHub com acesso ao repositório e edite as notícias pelo navegador (o Pages CMS salva direto no GitHub).

**Atenção:** o Keystatic e o Pages CMS **editam os mesmos arquivos** em `src/content/noticias/` e salvam imagens em `public/uploads/noticias/`. Qualquer mudança no schema de um precisa ser refletida no outro (`keystatic.config.ts` ↔ `.pages.yml`), além de `src/content.config.ts`.

