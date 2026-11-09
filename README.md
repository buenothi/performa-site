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

## Testar localmente

```
npx wrangler dev --var WEBHOOK_URL:http://127.0.0.1:9999/hook
```

## Pendências de conteúdo

- Conferir o texto da política de privacidade, principalmente o prazo de guarda de 12 meses, que é uma sugestão.
- Plataformas aparecem como nomes; os logos podem ser trocados por imagens se houver autorização de uso de marca.
- Não há analytics. Se quiser, o Cloudflare Web Analytics pode ser ativado no painel, sem cookies.
