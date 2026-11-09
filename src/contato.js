// POST /api/contato (chamado pelo src/worker.js)
//
// Recebe o formulário do site e entrega o contato por um ou pelos dois canais abaixo,
// conforme as variáveis configuradas no Worker
// (Settings > Variables and Secrets):
//
//   RESEND_API_KEY     (secret)  chave da API do Resend para enviar e-mail
//   CONTATO_DESTINO              e-mail que recebe os contatos (ex.: atendimento@performacloud.com.br)
//   CONTATO_REMETENTE            remetente verificado no Resend (ex.: site@performacloud.com.br)
//   WEBHOOK_URL        (secret)  opcional: URL de um webhook (ex.: n8n) que recebe o contato em JSON
//
// Se nenhum canal estiver configurado, a função responde 503 e o site mostra
// os links de WhatsApp e e-mail como alternativa.

const MAX = { nome: 120, empresa: 120, email: 160, telefone: 30, usuarios: 20, mensagem: 2000, plano: 30 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

function clean(v, max) {
  return String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function handleContato(request, env) {
  // Aceita só envios vindos do próprio site
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return json({ erro: 'origem não permitida' }, 403);
  }

  let raw;
  try {
    const type = request.headers.get('Content-Type') || '';
    raw = type.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return json({ erro: 'requisição inválida' }, 400);
  }

  // Honeypot: robôs preenchem o campo escondido "site"
  if (raw.site) return json({ ok: true });

  const d = {};
  for (const k of Object.keys(MAX)) d[k] = clean(raw[k], MAX[k]);

  if (!d.nome || !EMAIL_RE.test(d.email)) return json({ erro: 'nome e e-mail são obrigatórios' }, 422);
  if (!raw.consentimento) return json({ erro: 'consentimento obrigatório' }, 422);

  const contato = {
    ...d,
    consentimento: true,
    recebido_em: new Date().toISOString(),
    pagina: request.headers.get('Referer') || '',
    ip_pais: request.cf?.country || ''
  };

  const envios = [];

  if (env.WEBHOOK_URL) {
    envios.push(
      fetch(env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contato)
      }).then((r) => { if (!r.ok) throw new Error('webhook ' + r.status); })
    );
  }

  if (env.RESEND_API_KEY && env.CONTATO_DESTINO && env.CONTATO_REMETENTE) {
    const linhas = [
      ['Nome', d.nome], ['Empresa', d.empresa], ['E-mail', d.email], ['Telefone', d.telefone],
      ['Usuários', d.usuarios], ['Plano de interesse', d.plano], ['Mensagem', d.mensagem]
    ].filter(([, v]) => v);

    const html = '<h2>Novo contato pelo site</h2><table cellpadding="6">' +
      linhas.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('') +
      `</table><p style="color:#888">Recebido em ${contato.recebido_em}</p>`;

    envios.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `Site Performa Cloud <${env.CONTATO_REMETENTE}>`,
          to: [env.CONTATO_DESTINO],
          reply_to: d.email,
          subject: `Contato pelo site: ${d.nome}${d.empresa ? ' (' + d.empresa + ')' : ''}`,
          html
        })
      }).then((r) => { if (!r.ok) throw new Error('resend ' + r.status); })
    );
  }

  if (envios.length === 0) return json({ erro: 'canal de contato não configurado' }, 503);

  const res = await Promise.allSettled(envios);
  if (res.every((r) => r.status === 'rejected')) {
    console.error('contato: falha em todos os canais', res.map((r) => r.reason?.message));
    return json({ erro: 'falha ao enviar' }, 502);
  }
  return json({ ok: true });
}

export function metodoNaoPermitido() {
  return json({ erro: 'use POST' }, 405);
}
