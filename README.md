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