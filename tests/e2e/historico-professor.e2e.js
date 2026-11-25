const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { chromium, expect } = require('playwright/test');

const { E2E_API_URL: apiUrl, E2E_BASE_URL: baseUrl, E2E_CHROME_PATH } = process.env;

async function api(method, path, status, body, token) {
  const resposta = await fetch(apiUrl + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body && JSON.stringify(body)
  });
  assert.equal(resposta.status, status, method + ' ' + path);
  return [200, 201].includes(status) ? resposta.json() : null;
}

async function criarProfessor() {
  const login = `${randomUUID()}@teste.invalid`;
  const senha = randomUUID();
  const { id } = await api('POST', '/Usuarios/cadastro-professor', 200, {
    nome: 'Professor sintético', login, senha, opcaoEscola: 'CriarNova', nomeNovaEscola: 'Escola do histórico'
  });
  const { token } = await api('POST', '/Usuarios/login', 200, { login, senha });
  const [{ escolaId }] = await api('GET', '/Usuarios/contexto-escolar', 200, null, token);
  return { id, token, escolaId, login, senha };
}

async function run() {
  assert.ok(apiUrl && baseUrl, 'Configure o ambiente de demonstração isolado.');
  const professor = await criarProfessor();
  const externo = await criarProfessor();
  const turma = await api('POST', '/Turmas', 201, {
    nome: 'Turma sintética do histórico', serie: 5, anoLetivo: 2026,
    escolaId: professor.escolaId, professorResponsavelId: professor.id
  }, professor.token);
  const aluno = await api('POST', '/Usuarios/alunos-manual', 200, {
    nome: 'Aluno do histórico', numeroChamada: 1, turmaId: turma.id
  }, professor.token);
  const acesso = { matriculaOuCodigo: aluno.codigoCadastro, pin: '1357' };
  await api('POST', '/Usuarios/primeiro-acesso-aluno', 200, acesso);
  const { token: tokenAluno } = await api('POST', '/Usuarios/login-aluno', 200, acesso);

  const catalogo = await api('GET', '/ErrosCatalogo?estado=ativo', 200, null, professor.token);
  const acentuacao = catalogo.find(erro => erro.codigo === 'COR01_ACENTUACAO');
  assert.ok(acentuacao?.temRegraExecutavel);
  const llm = await api('POST', '/ErrosCatalogo', 201, {
    nome: 'Definição sintética do histórico', descricao: 'Candidato sem executor para a demonstração.',
    categoriaPedagogica: { codigo: 'NAO_ORTOGRAFICO', nome: 'Concordância verbal' }
  }, professor.token);
  const ditado = await api('POST', '/Ditados', 201, {
    titulo: 'Ditado para histórico', textoComMarcacoes: 'Ela tomou [café]. O [gato] dormiu. Os professores [chegaram].',
    audioBase64: 'data:audio/mpeg;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXk=',
    erroCatalogoIds: [acentuacao.id, llm.id]
  }, professor.token);
  await api('POST', `/Ditados/${ditado.id}/visibilidade`, 204, { nivel: 1 }, professor.token);
  await api('POST', `/Turmas/${turma.id}/ditados`, 204, {
    ditadoId: ditado.id, dataLimite: new Date(Date.now() + 86_400_000).toISOString()
  }, professor.token);
  const formulario = await api('GET', `/Ditados/${ditado.id}/realizar`, 200, null, tokenAluno);
  const lacunas = formulario.segmentos.filter(s => s.segmentoId);
  assert.equal(lacunas.length, 3);
  const submeter = palavra => api('POST', `/Ditados/${ditado.id}/submeter`, 200, {
    respostas: lacunas.map((lacuna, i) => ({ segmentoId: lacuna.segmentoId, resposta: ['cafe', palavra, 'chegou'][i] }))
  }, tokenAluno);
  const melhor = await submeter('gato');
  const recente = await submeter('cachorro');
  assert.equal(melhor.nota, 33.33);
  assert.equal(recente.nota, 0);
  assert.equal(recente.detalhes[0].estadoAnaliseLlm, 'Pendente');

  const historicoPath = `/Professores/turmas/${turma.id}/alunos/${aluno.id}/ditados/${ditado.id}/tentativas`;
  await api('GET', historicoPath, 404, null, externo.token);
  await expect.poll(async () => {
    const historico = await api('GET', historicoPath, 200, null, professor.token);
    assert.deepEqual(historico.map(t => t.resultado.respostaDitadoId), [recente.respostaDitadoId, melhor.respostaDitadoId]);
    return historico[0].resultado.detalhes[0].estadoAnaliseLlm;
  }, { timeout: 45_000, intervals: [500, 1000] }).toBe('Concluida');

  const browser = await chromium.launch({ channel: 'chrome', headless: true, executablePath: E2E_CHROME_PATH });
  try {
    const page = await browser.newPage();
    await page.goto(baseUrl + '/login');
    await page.getByPlaceholder('seu@email.com').fill(professor.login);
    await page.getByPlaceholder('Digite sua senha').fill(professor.senha);
    await page.getByRole('button', { name: 'Entrar como professor' }).click();
    await page.waitForURL('**/professor');
    await page.goto(`${baseUrl}/turmas/${turma.id}/ditados/${ditado.id}/resultados`);
    await expect(page.getByRole('columnheader', { name: 'Melhor nota' })).toBeVisible();
    const linha = page.getByRole('row').filter({ hasText: aluno.nome });
    await expect(linha).toContainText('33.3%');
    await expect(page.getByText('Acentuação · Correção tradicional', { exact: true })).toBeVisible();
    await expect(page.getByText('Definição sintética do histórico · Correção IA', { exact: true })).toBeVisible();
    await expect(page.getByText('Lacunas incorretas sem classificação: 1', { exact: true })).toBeVisible();
    await linha.getByRole('button', { name: 'Ver tentativas do aluno' }).click();
    const dialogo = page.getByRole('dialog');
    const tentativas = dialogo.locator('section.tentativa-grupo');
    await expect(tentativas).toHaveCount(2);
    const recente = tentativas.nth(0);
    const antiga = tentativas.nth(1);
    await expect(recente.getByRole('heading')).toContainText('Tentativa 2');
    await expect(recente.locator('time')).toHaveAttribute('datetime', /\d{4}-\d{2}-\d{2}/);
    await expect(recente).toContainText('Nota 0%');
    await expect(recente.getByRole('columnheader', { name: 'Classificação' })).toBeVisible();
    await expect(recente.getByRole('cell', { name: 'cachorro', exact: true })).toBeVisible();
    await expect(recente.getByRole('cell', { name: 'cafe', exact: true })).toBeVisible();
    await expect(recente).toContainText('Acentuação');
    await expect(recente).toContainText('Correção tradicional');
    await expect(recente).toContainText('Definição sintética do histórico');
    await expect(recente).toContainText('Correção IA · Concluída');
    await expect(antiga).toContainText('Nota 33,3%');
    await expect(antiga.locator('tbody tr').nth(1).getByRole('cell').nth(1)).toHaveText('gato');
    await dialogo.getByRole('combobox', { name: 'Ordem das tentativas' }).press('ArrowDown');
    await page.getByRole('option', { name: 'Mais antigas primeiro' }).click();
    await expect(tentativas.nth(0).getByRole('heading')).toContainText('Tentativa 1');
    console.log('PASS: duas tentativas em tabelas verticais com ordem selecionável, origens visíveis, melhor nota e outra escola com HTTP 404.');
  } finally {
    await browser.close();
  }
}

run().catch(erro => { console.error(erro.stack); process.exitCode = 1; });
