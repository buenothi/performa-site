# Site institucional da Performa Cloud

Site estático (HTML, CSS e JS sem framework) hospedado no Cloudflare Pages. O conteúdo vem da apresentação comercial v2 (nov/2026).

## Estrutura

```
index.html            página principal (todas as seções)
privacidade.html      política de privacidade (LGPD)
404.html              página de erro
assets/css/style.css  estilos
assets/js/main.js     menu, abas, preços com/sem Microsoft 365, envio do formulário
assets/img/           logo e ícones
functions/api/contato.js  Pages Function que recebe o formulário (POST /api/contato)
_headers              cabeçalhos de segurança e cache
robots.txt, sitemap.xml
```

## Publicar no Cloudflare Pages

1. Suba esta pasta para o repositório `performa-site` no GitHub.
2. No painel da Cloudflare: **Workers & Pages > Create > Pages > Connect to Git** e escolha o repositório.
3. Configuração de build: framework **None**, build command **vazio**, output directory **/** (raiz).
4. Em **Settings > Variables and Secrets**, configure pelo menos um canal para o formulário:
   - E-mail via [Resend](https://resend.com) (plano gratuito: 3 mil e-mails/mês): `RESEND_API_KEY` (secret), `CONTATO_DESTINO=atendimento@performacloud.com.br`, `CONTATO_REMETENTE=site@performacloud.com.br`. O domínio do remetente precisa estar verificado no Resend (registros DNS).
   - Webhook (por exemplo, um fluxo do n8n que cria o lead no CRM): `WEBHOOK_URL` (secret).
   Sem nenhum canal, o formulário mostra os links de WhatsApp e e-mail como alternativa.
5. Em **Custom domains**, adicione `www.performacloud.com.br`. Se o DNS do domínio estiver na Cloudflare, o registro é criado sozinho; se não, crie um CNAME `www` apontando para `<projeto>.pages.dev`. Para o domínio sem "www", crie uma regra de redirecionamento para o www.
6. Cadastre o site no Google Search Console e envie o `sitemap.xml`.

Cada push na branch principal publica o site; cada pull request ganha uma URL de pré-visualização.

## Testar localmente

```
npx wrangler pages dev . --binding WEBHOOK_URL=http://127.0.0.1:9999/hook
```

## Pendências de conteúdo

- Conferir o texto da política de privacidade, principalmente o prazo de guarda de 12 meses, que é uma sugestão.
- Plataformas aparecem como nomes; os logos podem ser trocados por imagens se houver autorização de uso de marca.
- Não há analytics. Se quiser, o Cloudflare Web Analytics pode ser ativado no painel, sem cookies.
