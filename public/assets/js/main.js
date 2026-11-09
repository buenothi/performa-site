// Performa Cloud: interações do site
(function () {
  'use strict';

  // Menu no celular
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
        nav.classList.remove('open');
      }
    });
  }

  // Abas das frentes de atuação
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });

  // Preço para quem já tem Microsoft 365
  var sw = document.querySelector('.switch');
  if (sw) {
    sw.addEventListener('click', function () {
      var byo = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(byo));
      document.querySelectorAll('.price__value[data-full]').forEach(function (el) {
        el.textContent = 'R$ ' + (byo ? el.dataset.byo : el.dataset.full);
      });
      document.querySelectorAll('.m365-item').forEach(function (el) {
        el.textContent = byo ? 'Gestão e suporte do seu Microsoft 365' : 'Microsoft 365 com gestão e suporte';
      });
    });
  }

  // Plano escolhido vai junto com o formulário
  var form = document.getElementById('form-contato');
  document.querySelectorAll('[data-plano]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (!form) return;
      form.elements.plano.value = a.dataset.plano;
      var msg = form.elements.mensagem;
      if (!msg.value) msg.value = 'Tenho interesse no plano ' + a.dataset.plano + '.';
    });
  });

  // Envio do formulário
  if (form) {
    var status = form.querySelector('.form__status');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form__status';
      status.textContent = '';

      var invalid = null;
      ['nome', 'email', 'consentimento'].forEach(function (n) {
        var el = form.elements[n];
        var ok = el.type === 'checkbox' ? el.checked : el.checkValidity() && el.value.trim() !== '';
        el.setAttribute('aria-invalid', String(!ok));
        if (!ok && !invalid) invalid = el;
      });
      if (invalid) {
        status.classList.add('err');
        status.textContent = invalid.name === 'consentimento'
          ? 'Para continuar, marque a concordância com a política de privacidade.'
          : 'Preencha nome e um e-mail válido.';
        invalid.focus();
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Enviando...';
      var data = Object.fromEntries(new FormData(form).entries());

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.j.erro || 'falha');
          form.reset();
          status.classList.add('ok');
          status.textContent = 'Recebemos sua mensagem. Nosso time vai entrar em contato em breve.';
        })
        .catch(function () {
          status.classList.add('err');
          status.innerHTML = 'Não foi possível enviar agora. Fale com a gente pelo <a href="https://wa.me/5511969449185">WhatsApp</a> ou por <a href="mailto:atendimento@performacloud.com.br">e-mail</a>.';
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = 'Pedir diagnóstico gratuito';
        });
    });
  }

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
