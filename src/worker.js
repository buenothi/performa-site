// Worker do site da Performa Cloud.
// Arquivos estáticos ficam em public/ e são servidos pelo binding ASSETS.
// A única rota dinâmica é o formulário de contato.
import { handleContato, metodoNaoPermitido } from './contato.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contato') {
      return request.method === 'POST' ? handleContato(request, env) : metodoNaoPermitido();
    }

    return env.ASSETS.fetch(request);
  }
};
