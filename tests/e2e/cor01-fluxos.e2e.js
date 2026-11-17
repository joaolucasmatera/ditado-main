const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { chromium } = require('playwright');

const apiUrl = process.env.E2E_API_URL;
const baseUrl = process.env.E2E_BASE_URL;
const chromePath = process.env.E2E_CHROME_PATH ||
  'C:\\Users\\lucas\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

async function api(method, route, expected, body, token) {
  const response = await fetch(`${apiUrl}${route}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  assert.equal(response.status, expected, `${method} ${route}`);
  return response.status === 204 ? null : response.json();
}

async function loginProfessor(page, login, senha) {
  await page.goto(`${baseUrl}/login`);
  await page.getByPlaceholder('seu@email.com').fill(login);
  await page.getByPlaceholder('Digite sua senha').fill(senha);
  await page.getByRole('button', { name: 'Entrar como professor', exact: true }).click();
  await page.waitForURL('**/professor');
}

async function salvarEdicao(page, id) {
  const pending = page.waitForResponse(response =>
    response.request().method() === 'PUT' && response.url().endsWith(`/Ditados/${id}`));
  await page.getByRole('button', { name: 'Salvar Ditado', exact: true }).click();
  const response = await pending;
  assert.equal(response.status(), 200);
  const dados = response.request().postDataJSON();
  assert.equal(Object.hasOwn(dados, 'textoComMarcacoes'), false);
  assert.equal(Object.hasOwn(dados, 'audioBase64'), false);
  await page.waitForURL('**/ditados');
  return dados;
}

async function run() {
  assert.ok(apiUrl && baseUrl, 'Informe E2E_API_URL e E2E_BASE_URL do ambiente isolado.');
  const marca = randomUUID().slice(0, 8);
  const login = `cor01-${marca}@teste.invalid`;
  const senha = randomUUID();
  const professor = await api('POST', '/Usuarios/cadastro-professor', 200, {
    nome: 'Professor de teste COR-01', login, senha,
    opcaoEscola: 'CriarNova', nomeNovaEscola: `Escola Municipal de Ensino Fundamental com Nome Extenso ${marca}`
  });
  const auth = await api('POST', '/Usuarios/login', 200, { login, senha });
  const [escola] = await api('GET', '/Usuarios/contexto-escolar', 200, undefined, auth.token);
  const turma = await api('POST', '/Turmas', 201, {
    nome: `Turma do Ensino Fundamental com Nome Extenso ${marca}`, serie: 3, anoLetivo: 2026,
    escolaId: escola.escolaId, professorResponsavelId: professor.id
  }, auth.token);
  const catalogo = await api('GET', '/ErrosCatalogo?estado=ativo', 200, undefined, auth.token);
  const acento = catalogo.find(erro => erro.codigo === 'COR01_ACENTUACAO');
  const caixa = catalogo.find(erro => erro.codigo === 'COR01_MAIUSCULAS_PONTUACAO');
  assert.ok(acento?.temRegraExecutavel && caixa?.temRegraExecutavel);
  const categoria = await api('POST', '/Categorias', 201, { nome: `Categoria ${marca}` }, auth.token);
  const audio = 'data:audio/mpeg;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXk=';
  const ditado = await api('POST', '/Ditados', 201, {
    titulo: `Ditado ${marca}`, descricao: 'Descrição original',
    textoComMarcacoes: '[café] [prato] [gato]', audioBase64: audio,
    erroCatalogoIds: [acento.id], categoriaIds: [categoria.id]
  }, auth.token);
  await api('POST', `/Ditados/${ditado.id}/visibilidade`, 204, { nivel: 1 }, auth.token);
  await api('POST', `/Turmas/${turma.id}/ditados`, 204, {
    ditadoId: ditado.id, dataLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  }, auth.token);
  // O cadastro posterior à atribuição deve conceder vínculo e participação pelo fluxo real.
  const aluno = await api('POST', '/Usuarios/alunos-manual', 200, {
    nome: 'Aluno COR-01', numeroChamada: 1, turmaId: turma.id
  }, auth.token);
  const segundoAluno = await api('POST', '/Usuarios/alunos-manual', 200, {
    nome: 'Segundo aluno COR-01', numeroChamada: 999, turmaId: turma.id
  }, auth.token);
  assert.notEqual(aluno.codigoCadastro, segundoAluno.codigoCadastro);
  assert.equal(aluno.codigoCadastro, `E${escola.escolaId}-T${turma.id}-N001`);
  assert.equal(segundoAluno.codigoCadastro, `E${escola.escolaId}-T${turma.id}-N999`);

  const browser = await chromium.launch({
    headless: process.env.E2E_HEADED !== '1', executablePath: chromePath
  });
  const professorContext = await browser.newContext();
  const alunoContext = await browser.newContext();
  const page = await professorContext.newPage();
  const student = await alunoContext.newPage();
  try {
    await loginProfessor(page, login, senha);
    await page.goto(`${baseUrl}/cadastro-ditado/${ditado.id}`);
    await page.getByPlaceholder('Digite o título do ditado').waitFor();
    await page.waitForFunction(() =>
      document.querySelector('textarea[placeholder="Digite o texto do ditado"]')?.value === '[café] [prato] [gato]');
    const texto = page.getByPlaceholder('Digite o texto do ditado');
    assert.equal(await texto.getAttribute('readonly'), '');
    assert.equal(await page.getByPlaceholder('Descreva o objetivo ou contexto do ditado').inputValue(), 'Descrição original');
    await page.locator('.v-chip').filter({ hasText: categoria.nome }).waitFor();
    assert.ok(await page.locator('#ditado-erros-catalogo').isEnabled());
    assert.equal(await page.locator('audio source').getAttribute('src'), audio);
    await page.getByPlaceholder('Digite o título do ditado').fill('Título revisado');
    await page.getByPlaceholder('Descreva o objetivo ou contexto do ditado').fill('Descrição revisada');
    await page.locator('#ditado-erros-catalogo').fill('Maiúsculas');
    await page.getByRole('option', { name: /Maiúsculas e pontuação/ }).click();
    await page.locator('#ditado-erros-catalogo').press('Escape');
    const primeiroSave = await salvarEdicao(page, ditado.id);
    assert.deepEqual(primeiroSave.erroCatalogoIds.sort((a, b) => a - b), [acento.id, caixa.id].sort((a, b) => a - b));
    const editado = await api('GET', `/Ditados/${ditado.id}/visualizar`, 200, undefined, auth.token);
    assert.equal(editado.titulo, 'Título revisado');
    assert.equal(editado.descricao, 'Descrição revisada');
    assert.deepEqual(editado.categorias.map(c => c.id), [categoria.id]);
    assert.equal(editado.audioBase64, audio);
    assert.equal(editado.segmentos.filter(s => s.tipo === 'Lacuna').map(s => s.conteudo).join(','), 'café,prato,gato');
    console.log('PASS edição antes da primeira resposta preserva texto e áudio e salva título, descrição e seleção.');

    await student.goto(`${baseUrl}/login`);
    await student.getByRole('button', { name: 'Aluno', exact: true }).click();
    await student.getByRole('button', { name: 'Primeiro login: criar PIN' }).click();
    await student.getByPlaceholder('Matrícula ou código de entrada', { exact: true }).fill(aluno.codigoCadastro);
    await student.getByRole('button', { name: 'Continuar', exact: true }).click();
    await student.getByPlaceholder('Crie seu PIN (mínimo 4 caracteres)').fill('1357');
    await student.getByRole('button', { name: 'Criar PIN', exact: true }).click();
    await student.waitForURL('**/aluno');
    await student.goto(`${baseUrl}/realizar-ditado/${ditado.id}`);
    await student.locator('.lacuna-input').first().waitFor();
    for (const [i, value] of ['Cafe', 'pato', 'gato'].entries()) {
      await student.locator('.lacuna-input').nth(i).fill(value);
    }
    const submissao = student.waitForResponse(r => r.url().endsWith(`/Ditados/${ditado.id}/submeter`) && r.request().method() === 'POST');
    await student.getByRole('button', { name: 'Submeter respostas' }).click();
    const resposta = await submissao;
    assert.equal(resposta.status(), 200);
    const resultado = await resposta.json();
    assert.equal(resultado.acertos, 1);
    assert.deepEqual(resultado.detalhes[0].classificacoes.map(c => c.erroCatalogoId).sort((a, b) => a - b),
      [acento.id, caixa.id].sort((a, b) => a - b));
    await student.waitForURL('**/resultado-aluno');
    await student.getByText('Não classificado · revisar', { exact: true }).waitFor();
    console.log('PASS cadastro após atribuição, primeiro PIN, submissão e resultado pela tela com duas classificações.');

    const acessoSegundoAluno = { matriculaOuCodigo: segundoAluno.codigoCadastro, pin: '2468' };
    await api('POST', '/Usuarios/primeiro-acesso-aluno', 200, acessoSegundoAluno);
    const segundoLogin = await api('POST', '/Usuarios/login-aluno', 200, acessoSegundoAluno);
    assert.equal(segundoLogin.usuario.id, segundoAluno.id);
    const primeiroSegmento = editado.segmentos.find(segmento => segmento.tipo === 'Lacuna').id;
    const resultadoSegundo = await api('POST', `/Ditados/${ditado.id}/submeter`, 200, {
      respostas: [{ segmentoId: primeiroSegmento, resposta: 'cafe' }]
    }, segundoLogin.token);
    assert.equal(resultadoSegundo.detalhes[0].classificacoes[0].erroCatalogoId, acento.id);
    console.log('PASS escola e turma com nomes longos geram códigos distintos para chamadas 1 e 999 e permitem PIN, login e submissão dos dois alunos.');

    await page.goto(`${baseUrl}/cadastro-ditado/${ditado.id}`);
    await page.getByText('A seleção de erros está bloqueada', { exact: false }).waitFor();
    assert.equal(await page.locator('#ditado-erros-catalogo').isDisabled(), true);
    await page.getByPlaceholder('Digite o título do ditado').fill('Título depois da resposta');
    const segundoSave = await salvarEdicao(page, ditado.id);
    assert.equal(Object.hasOwn(segundoSave, 'erroCatalogoIds'), false);
    const final = await api('GET', `/Ditados/${ditado.id}/visualizar`, 200, undefined, auth.token);
    assert.equal(final.titulo, 'Título depois da resposta');
    assert.equal(final.possuiRespostas, true);
    assert.equal(final.audioBase64, audio);
    assert.deepEqual(final.errosCatalogo.map(e => e.id), editado.errosCatalogo.map(e => e.id));
    assert.deepEqual(final.segmentos, editado.segmentos);
    assert.deepEqual(final.categorias, editado.categorias);
    console.log('PASS seleção bloqueada depois da primeira resposta e edição dos metadados preserva configuração.');
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error('FAIL COR-01', error.message);
  process.exitCode = 1;
});
