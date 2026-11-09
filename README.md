# Site institucional da Performa Cloud

Site estático (HTML, CSS e JS sem framework) publicado como **Cloudflare Worker com arquivos estáticos**. O conteúdo vem da apresentação comercial v2 (nov/2026).

## Estrutura

```
wrangler.jsonc               configuração do Worker (nome, pasta de arquivos, 404)
src/worker.js                entrada do Worker: /api/contato ou arquivos estáticos
src/contato.js               tratamento do formulário (POST /api/contato)
public/index.html            página principal (todas as seções)
public/privacidade.html      política de privacidade (LGPD), servida em /privacidade
public/404.html              página de erro
public/assets/               CSS, JS, logo e ícones
public/_headers              cabeçalhos de segurança e cache
public/robots.txt, public/sitemap.xml
```

## Publicar na Cloudflare

1. O Worker está ligado a este repositório pelo **Workers Builds**. Deploy command: `npx wrangler deploy`, sem build command. Cada push na `main` publica o site.
2. O campo `name` do `wrangler.jsonc` precisa ser igual ao nome do Worker no painel (hoje `performa-site`).
3. Em **Settings > Variables and Secrets** do Worker, configure pelo menos um canal para o formulário:
   - E-mail via [Resend](https://resend.com) (plano gratuito: 3 mil e-mails/mês): `RESEND_API_KEY` (secret), `CONTATO_DESTINO=atendimento@performacloud.com.br`, `CONTATO_REMETENTE=site@performacloud.com.br`. O domínio do remetente precisa estar verificado no Resend (registros DNS).
   - Webhook (por exemplo, um fluxo do n8n que cria o lead no CRM): `WEBHOOK_URL` (secret).
   O `keep_vars: true` do `wrangler.jsonc` impede que o deploy apague essas variáveis. Sem nenhum canal, o formulário mostra os links de WhatsApp e e-mail como alternativa.
4. Em **Settings > Domains & Routes > Add > Custom domain**, adicione `www.performacloud.com.br` e `performacloud.com.br` (o DNS do domínio precisa estar na Cloudflare).
5. Cadastre o site no Google Search Console e envie o `sitemap.xml`.

## Abertura (herói)

A abertura ocupa a tela inteira, com fundo escuro animado só com CSS. Para usar um vídeo de fundo, coloque um loop curto e sem som (10 a 20 s, até ~5 MB, 1280×720) em `public/assets/video/` e preencha `data-video` na `<section class="hero hero--impact">`. O vídeo não carrega para quem pediu movimento reduzido ou economia de dados.

## Vídeos explicativos

A seção `#videos` do `public/index.html` lista os vídeos. O primeiro aparece em destaque; os seguintes entram numa grade que se ajusta sozinha.

Para publicar um vídeo do YouTube, preencha `data-youtube` com o id dele (o trecho depois de `v=` ou de `youtu.be/`). A miniatura vem do próprio YouTube, e o player (`youtube-nocookie.com`) só carrega quando a pessoa clica. Para um vídeo novo, copie um `<article class="video">`, troque título, descrição e duração, e apague um dos cartões "Novo vídeo em produção".

Para hospedar o arquivo no próprio site em vez do YouTube, coloque o `.mp4` em `public/assets/video/` e use `data-src="/assets/video/nome.mp4"` (opcional: `data-poster` com uma imagem de capa). O limite da Cloudflare é 25 MB por arquivo, então o YouTube é o caminho recomendado.

Se usar outro serviço (Vimeo, por exemplo), libere o domínio em `frame-src` no `public/_headers`.

## Cache de CSS e JS

Os HTMLs carregam `style.css?v=...` e `main.js?v=...`. **Ao mudar o CSS ou o JS, troque o valor de `v`** em todos os `.html` (por exemplo, para a data do dia). Sem isso, quem já visitou o site pode ver o HTML novo com o CSS antigo, e a página fica quebrada até o cache expirar.

## Testar localmente

```
npx wrangler dev --var WEBHOOK_URL:http://127.0.0.1:9999/hook
```

## Pendências de conteúdo

- Conferir o texto da política de privacidade, principalmente o prazo de guarda de 12 meses, que é uma sugestão.
- Plataformas aparecem como nomes; os logos podem ser trocados por imagens se houver autorização de uso de marca.
- Não há analytics. Se quiser, o Cloudflare Web Analytics pode ser ativado no painel, sem cookies.
