const assert = require('node:assert/strict');
const { chromium, expect } = require('playwright/test');

const baseUrl = process.env.E2E_BASE_URL;

async function run() {
  assert.ok(baseUrl, 'Informe E2E_BASE_URL para o frontend de validação.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ serviceWorkers: 'block' });
    await page.addInitScript(() => {
      localStorage.setItem('token', 'sessao-sintetica');
      localStorage.setItem('usuario', JSON.stringify({ id: 1, nome: 'Professor de teste', tipo: 'Professor' }));
    });
    const categoriaPedagogica = { codigo: 'NAO_ORTOGRAFICO', nome: 'Concordância verbal', familia: null };
    const data = '2026-11-25T15:00:00Z';
    const itens = {
      '/api/Professores/turmas/2/ditados/3/resultados': {
        turmaId: 2, turmaNome: 'Turma de teste', ditadoId: 3, ditadoTitulo: 'Ditado de teste',
        dataAtribuicao: data, dataLimite: data, totalAlunos: 1, alunosQueFizeram: 1,
        notaMedia: 0, percentualConclusao: 100, errosPorPalavra: [],
        alunos: [{ alunoId: 7, nome: 'Aluno de teste', fez: true, nota: 0, numeroTentativas: 1 }],
        errosPorTipo: [{ tipoErroId: 27, origem: 'Codigo', descricaoCurta: 'Concordância e flexão', quantidade: 1 }],
        errosPorCategoria: [{ categoriaPedagogica, quantidade: 1 }, { categoriaPedagogica: null, quantidade: 1 }]
      },
      '/api/Professores/turmas/2/alunos/7/ditados/3/tentativas': [{
        dataRealizacao: data,
        resultado: {
          respostaDitadoId: 9, nota: 0, totalLacunas: 2, acertos: 0, erros: 2,
          detalhes: [{
            segmentoId: 10, respostaEsperada: 'chegaram', respostaFornecida: 'chegou', correto: false,
            classificacoes: [{ erroCatalogoId: 0, tipoErro: 27, origem: 'Codigo', nome: 'Concordância e flexão', categoriaPedagogica }]
          }, {
            segmentoId: 11, respostaEsperada: 'porta', respostaFornecida: 'pota', correto: false,
            tiposErro: ['Omissão']
          }]
        }
      }],
      '/api/Ditados/3/visualizar': {
        titulo: 'Ditado de teste', textoComMarcacoes: '[chegaram]',
        errosCatalogo: [{ erroCatalogoId: 4, nome: 'Concordância e flexão' }],
        categorias: [{ id: 5, nome: 'Categoria antiga do ditado' }]
      },
      '/api/ErrosCatalogo': [{ id: 4, nome: 'Concordância e flexão', ativo: true, categoriaPedagogica }]
    };
    await page.route('**/api/**', route => {
      const path = new URL(route.request().url()).pathname;
      return route.fulfill({ json: itens[path] ?? [] });
    });

    await page.goto(baseUrl + '/turmas/2/ditados/3/resultados');
    const erros = page.getByRole('region', { name: 'Erros identificados' });
    await expect(erros).toContainText('Concordância e flexão');
    await expect(page.getByRole('region', { name: 'Erros por Tipo' })).toHaveCount(0);
    const categorias = page.getByRole('region', { name: 'Erros por categoria' });
    await expect(categorias).toContainText('Concordância verbal');
    await expect(categorias).toContainText('Categoria não registrada');

    await page.getByRole('button', { name: 'Ver tentativas do aluno' }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo.getByRole('row').filter({ hasText: 'chegaram' })).toContainText('Categoria: Concordância verbal');
    await expect(dialogo.getByRole('row').filter({ hasText: 'porta' })).toContainText('Categoria não registrada');

    for (const rota of ['/cadastro-ditado', '/cadastro-ditado/3']) {
      await page.goto(baseUrl + rota);
      const formulario = page.locator('form');
      await expect(formulario).toBeVisible();
      await formulario.getByRole('combobox', { name: 'Erros do catálogo' }).click();
      await expect(page.getByRole('option', { name: 'Concordância e flexão' })).toBeVisible();
      await expect(page.getByRole('listbox').getByText('Concordância verbal', { exact: true })).toHaveCount(0);
      await expect(formulario.getByText(/Categoria|Concordância verbal/)).toHaveCount(0);
    }

    console.log('PASS: erros identificados, categoria gravada e legado no professor, cadastro e edição sem categoria.');
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error.stack); process.exitCode = 1; });
