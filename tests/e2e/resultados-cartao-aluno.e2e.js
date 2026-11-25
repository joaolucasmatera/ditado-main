const assert = require('node:assert/strict');
const { chromium, expect } = require('playwright/test');

const baseUrl = process.env.E2E_BASE_URL;

async function run() {
  assert.ok(baseUrl, 'Informe a URL do frontend com E2E_BASE_URL.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 850 }, serviceWorkers: 'block' });
    const origem = new URL(baseUrl).origin;
    await page.addInitScript(origem => {
      if (location.origin !== origem) return;
      localStorage.setItem('token', 'sessao-sintetica');
      localStorage.setItem('usuario', JSON.stringify({ id: 1, nome: 'Aluno de teste', tipo: 'Aluno' }));
    }, origem);

    const turma = { id: 2, nome: 'Turma de teste' };
    const turmas = [{ turmaId: turma.id }];
    const feitos = { ditadoId: 3, titulo: 'Ditado entregue', turmas, status: { jaTentou: true, melhorNota: 80 } };
    const novo = { ditadoId: 4, titulo: 'Ditado a fazer', turmas, status: { jaTentou: false } };
    const escritas = [];
    let consultas = 0;
    let estadoLlm = 'Pendente';

    await page.route('**/api/**', async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (request.method() !== 'GET') {
        escritas.push(request.method() + ' ' + path);
        return route.abort();
      }
      if (path.endsWith('/Alunos/meus-ditados')) return route.fulfill({ json: [feitos, novo] });
      if (path.endsWith('/Turmas/aluno/1')) return route.fulfill({ json: [turma] });
      if (path.endsWith('/Alunos/ditados/3/minhas-tentativas')) {
        if (++consultas === 1) return route.fulfill({ status: 503, json: {} });
        return route.fulfill({ json: [{ tentativaId: 11, nota: 80 }, { tentativaId: 12, nota: 60 }] });
      }
      if (path.endsWith('/Alunos/tentativas/12/resultado')) {
        return route.fulfill({ json: {
          respostaDitadoId: 12,
          nota: 60,
          totalLacunas: 3,
          acertos: 0,
          erros: 3,
          detalhes: [{
            segmentoId: 7, respostaEsperada: 'chegaram', respostaFornecida: 'chegou', correto: false,
            estadoAnaliseLlm: estadoLlm,
            classificacoes: estadoLlm === 'Concluida' ? [{
              erroCatalogoId: 16, nome: 'Concordância verbal', origem: 'LLM',
              categoriaPedagogica: { codigo: 'NAO_ORTOGRAFICO', nome: 'Concordância verbal', familia: null }
            }] : []
          }, {
            segmentoId: 8, respostaEsperada: 'café', respostaFornecida: 'cafe', correto: false,
            classificacoes: [{
              erroCatalogoId: 2, nome: 'Acentuação', origem: 'Codigo',
              categoriaPedagogica: { codigo: 'HIBRIDO_ACENTUACAO', nome: 'Acentuação', familia: 'Híbrida' }
            }]
          }, {
            segmentoId: 9, respostaEsperada: 'porta', respostaFornecida: 'pota', correto: false,
            tiposErro: ['Omissão']
          }]
        } });
      }
      if (path.endsWith('/Ditados/3/realizar')) return route.fulfill({ json: { titulo: feitos.titulo, segmentos: [] } });
      return route.fulfill({ json: [] });
    });

    const navegacoes = [];
    page.on('request', request => {
      if (request.isNavigationRequest() && request.frame() === page.mainFrame()) navegacoes.push(request.url());
    });
    await page.goto(baseUrl + '/aluno');
    const cartao = page.locator('.ditado-card').filter({ hasText: feitos.titulo });
    const aindaNaoFez = page.locator('.ditado-card').filter({ hasText: novo.titulo });
    const resultados = cartao.getByRole('button', { name: 'Resultados', exact: true });
    await expect(cartao.getByText('Clique em Resultados para ver a correção da IA.')).toBeVisible();
    await expect(cartao.getByRole('link', { name: 'Tentar novamente' })).toHaveAttribute('href', '/realizar-ditado/3');
    await expect(aindaNaoFez.getByRole('link', { name: 'Iniciar Ditado' })).toBeVisible();
    await expect(aindaNaoFez.getByRole('button', { name: 'Resultados', exact: true })).toHaveCount(0);
    await resultados.click();
    await expect(cartao.getByRole('alert')).toHaveText('Não foi possível abrir o resultado. Tente novamente.');
    await expect(page).toHaveURL(baseUrl + '/aluno');

    await resultados.click();
    await expect(page).toHaveURL(baseUrl + '/resultado-aluno?tentativa=12');
    await expect(page.getByText('Correção IA · Pendente')).toBeVisible();
    await page.getByRole('button', { name: 'Voltar para Meus Ditados' }).click();
    estadoLlm = 'Revisao';
    await resultados.click();
    await expect(page.getByText('Correção IA · Em revisão')).toBeVisible();
    const lacunaLlm = page.getByRole('row').filter({ hasText: 'chegaram' });
    await expect(lacunaLlm.getByText('Categoria não registrada')).toHaveCount(0);
    await page.getByRole('button', { name: 'Voltar para Meus Ditados' }).click();
    estadoLlm = 'Concluida';
    await resultados.click();
    await expect(page.getByText('Concordância verbal · Correção IA')).toBeVisible();
    await expect(page.getByText('Correção IA · Concluída')).toBeVisible();
    await expect(page.getByText('Categoria: Concordância verbal', { exact: true })).toBeVisible();
    await expect(page.getByText('Categoria: Acentuação · Híbrida', { exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'porta' }).getByText('Categoria não registrada')).toBeVisible();
    await expect(page.getByText('Modelo:', { exact: false })).toHaveCount(0);
    assert.deepEqual(navegacoes, [baseUrl + '/aluno']);

    await page.goto(baseUrl + '/minhas-turmas');
    await page.getByRole('button', { name: 'Ver Ditados' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Resultados', exact: true }).click();
    await expect(page).toHaveURL(baseUrl + '/resultado-aluno?tentativa=12');
    await page.getByRole('button', { name: 'Voltar para Meus Ditados' }).click();
    await cartao.getByRole('link', { name: 'Tentar novamente' }).click();
    await expect(page).toHaveURL(baseUrl + '/realizar-ditado/3');
    assert.deepEqual(escritas, []);
    console.log('PASS: Resultados no painel e na turma, última tentativa, correção IA atualizada sem recarga, erro recuperável e ação Tentar novamente.');
  } finally {
    await browser.close();
  }
}

run().catch(erro => { console.error(erro.stack); process.exitCode = 1; });
