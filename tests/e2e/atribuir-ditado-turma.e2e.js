const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { chromium, expect } = require('playwright/test');

const { E2E_API_URL: apiUrl, E2E_BASE_URL: baseUrl, E2E_CHROME_PATH } = process.env;

async function api(method, route, status, body, token) {
  const response = await fetch(apiUrl + route, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  assert.equal(response.status, status, method + ' ' + route);
  return status === 204 ? null : response.json();
}

async function run() {
  assert.ok(apiUrl && baseUrl, 'Informe o ambiente de teste isolado.');
  const login = `atribuicao-${randomUUID()}@teste.invalid`;
  const senha = randomUUID();
  const professor = await api('POST', '/Usuarios/cadastro-professor', 200, {
    nome: 'Professor sintético', login, senha, opcaoEscola: 'CriarNova', nomeNovaEscola: 'Escola de teste de atribuição'
  });
  const { token } = await api('POST', '/Usuarios/login', 200, { login, senha });
  const [{ escolaId }] = await api('GET', '/Usuarios/contexto-escolar', 200, undefined, token);
  const criarTurma = nome => api('POST', '/Turmas', 201, {
    nome, serie: 5, anoLetivo: 2026, escolaId, professorResponsavelId: professor.id
  }, token);
  const alvo = await criarTurma('Turma de destino');
  const outra = await criarTurma('Outra turma da escola');
  const catalogo = await api('GET', '/ErrosCatalogo?estado=ativo', 200, undefined, token);
  const acento = catalogo.find(erro => erro.codigo === 'COR01_ACENTUACAO');
  assert.ok(acento?.temRegraExecutavel);
  const ditado = await api('POST', '/Ditados', 201, {
    titulo: 'Ditado sintético sem publicação',
    textoComMarcacoes: 'Ela tomou [café].',
    audioBase64: 'data:audio/mpeg;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXk=',
    erroCatalogoIds: [acento.id]
  }, token);
  const semPublicacao = await api('POST', `/Turmas/${alvo.id}/ditados`, 400, { ditadoId: ditado.id }, token);
  assert.match(semPublicacao.mensagem, /sem publicação vigente/);

  const browser = await chromium.launch({ channel: 'chrome', headless: true, executablePath: E2E_CHROME_PATH });
  try {
    const page = await browser.newPage();
    const publicacoes = [];
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().endsWith(`/Ditados/${ditado.id}/visibilidade`))
        publicacoes.push(request.postDataJSON());
    });
    await page.goto(baseUrl + '/login');
    await page.getByPlaceholder('seu@email.com').fill(login);
    await page.getByPlaceholder('Digite sua senha').fill(senha);
    await page.getByRole('button', { name: 'Entrar como professor' }).click();
    await page.waitForURL('**/professor');
    await page.goto(baseUrl + '/ditados');
    const linha = page.getByRole('row').filter({ has: page.getByTitle('Atribuir a uma turma') }).filter({ hasText: ditado.titulo });
    await expect(linha.getByText('Não publicado', { exact: true })).toBeVisible();
    const dialog = page.getByRole('dialog').filter({ hasText: 'Atribuir Ditado a uma Turma' });
    async function selecionarTurma(nome) {
      await linha.getByTitle('Atribuir a uma turma').click();
      await dialog.getByRole('combobox', { name: 'Selecione a turma' }).press('ArrowDown');
      await page.getByRole('option', { name: nome, exact: true }).click();
    }

    await selecionarTurma(alvo.nome);
    await expect(dialog.getByText(/publicado somente para a turma selecionada/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Publicar para esta turma e atribuir' }).click();
    await expect(page.getByText('Ditado atribuído à turma com sucesso')).toBeVisible();
    await expect(linha.getByText('Turmas', { exact: true })).toBeVisible();
    assert.deepEqual(publicacoes, [{ nivel: 3, escolaId, turmaIds: [alvo.id] }]);

    await selecionarTurma(outra.nome);
    await dialog.getByRole('button', { name: 'Confirmar atribuição' }).click();
    await expect(dialog.getByText(/sem publicação vigente compatível/)).toBeVisible();
    assert.equal(publicacoes.length, 1, 'Uma publicação vigente não deve ser alterada pelo diálogo.');
    console.log('PASS: rótulo correto, atribuição pela tela à turma escolhida e recusa visível em outra turma.');
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error.stack); process.exitCode = 1; });
