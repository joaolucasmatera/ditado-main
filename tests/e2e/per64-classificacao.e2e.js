const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { chromium, expect } = require('playwright/test');

const { E2E_API_URL: apiUrl, E2E_BASE_URL: baseUrl, E2E_SCHEMA: schema,
  E2E_RESTART_SCRIPT: restartScript, E2E_ARTIFACTS_PATH: artifactsPath } = process.env;

async function api(method, route, status, body, token) {
  const response = await fetch(apiUrl + route, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  assert.equal(response.status, status, method + ' ' + route);
  return status === 200 || status === 201 ? response.json() : null;
}

async function criarEscola() {
  const login = `per64-${randomUUID()}@teste.invalid`;
  const senha = randomUUID();
  const professor = await api('POST', '/Usuarios/cadastro-professor', 200, {
    nome: 'Professor sintético', login, senha, opcaoEscola: 'CriarNova', nomeNovaEscola: 'Escola sintética PER-64'
  });
  const { token } = await api('POST', '/Usuarios/login', 200, { login, senha });
  const [contexto] = await api('GET', '/Usuarios/contexto-escolar', 200, undefined, token);
  const turma = await api('POST', '/Turmas', 201, {
    nome: 'Turma sintética', serie: 3, anoLetivo: 2026, escolaId: contexto.escolaId, professorResponsavelId: professor.id
  }, token);
  const aluno = await api('POST', '/Usuarios/alunos-manual', 200, {
    nome: 'Aluno sintético', numeroChamada: 1, turmaId: turma.id
  }, token);
  const acesso = { matriculaOuCodigo: aluno.codigoCadastro, pin: '1357' };
  await api('POST', '/Usuarios/primeiro-acesso-aluno', 200, acesso);
  const authAluno = await api('POST', '/Usuarios/login-aluno', 200, acesso);
  return { token, turma, acesso, authAluno };
}

async function loginAluno(page, acesso) {
  await page.goto(baseUrl + '/login');
  await page.getByRole('button', { name: 'Aluno', exact: true }).click();
  await page.getByPlaceholder('Matrícula ou código de entrada', { exact: true }).fill(acesso.matriculaOuCodigo);
  await page.getByPlaceholder(/PIN/).fill(acesso.pin);
  await page.getByRole('button', { name: 'Entrar como aluno', exact: true }).click();
  await page.waitForURL('**/aluno');
}

async function run() {
  assert.ok(apiUrl && baseUrl && schema && restartScript && artifactsPath);
  const escola = await criarEscola();
  const outra = await criarEscola();
  const catalogo = await api('GET', '/ErrosCatalogo?estado=ativo', 200, undefined, escola.token);
  const acento = catalogo.find(erro => erro.codigo === 'COR01_ACENTUACAO');
  assert.ok(acento?.temRegraExecutavel);
  const candidato = await api('POST', '/ErrosCatalogo', 201, {
    nome: 'Achado simulado PER-64', descricao: 'Definição sem executor para este teste.',
    categoriaPedagogica: { codigo: 'NAO_ORTOGRAFICO', nome: 'Concordância verbal' }
  }, escola.token);
  const ditado = await api('POST', '/Ditados', 201, {
    titulo: 'Ditado sintético PER-64', textoComMarcacoes: '[café] [prato] [gato]',
    audioBase64: 'data:audio/mpeg;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXk=',
    erroCatalogoIds: [acento.id, candidato.id]
  }, escola.token);
  await api('POST', `/Ditados/${ditado.id}/visibilidade`, 204, { nivel: 1 }, escola.token);
  await api('POST', `/Turmas/${escola.turma.id}/ditados`, 204, {
    ditadoId: ditado.id, dataLimite: new Date(Date.now() + 86_400_000).toISOString()
  }, escola.token);

  const browser = await chromium.launch({
    headless: true, channel: 'chrome', executablePath: process.env.E2E_CHROME_PATH
  });
  try {
    const page = await browser.newPage();
    await loginAluno(page, escola.acesso);
    await page.goto(`${baseUrl}/realizar-ditado/${ditado.id}`);
    await expect(page.locator('.lacuna-input')).toHaveCount(3);
    for (const [i, value] of ['cafe', 'omite esta lacuna', 'gato'].entries())
      await page.locator('.lacuna-input').nth(i).fill(value);

    const submeter = `/Ditados/${ditado.id}/submeter`;
    await page.route('**' + submeter, async route => {
      if (route.request().method() !== 'POST') return route.continue();
      const dados = route.request().postDataJSON();
      dados.respostas.splice(1, 1);
      await route.continue({ postData: JSON.stringify(dados) });
    });
    const submissao = page.waitForResponse(r => r.url().endsWith(submeter) && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Submeter respostas' }).click();
    const response = await submissao;
    assert.equal(response.status(), 200);
    const original = await response.json();
    assert.equal(original.nota, 33.33);
    assert.deepEqual(original.detalhes.map(d => [d.respostaEsperada, d.respostaFornecida, d.correto, d.respostaAusente, d.estadoAnaliseLlm]), [
      ['café', 'cafe', false, false, 'Pendente'], ['prato', '', false, true, 'Pendente'],
      ['gato', 'gato', true, false, 'Pendente']
    ]);
    assert.deepEqual(original.detalhes[0].classificacoes.map(c => c.origem), ['Codigo']);
    await page.waitForURL(url => url.pathname === '/resultado-aluno');
    const linha = page.getByRole('row').filter({ hasText: 'café' });
    await expect(linha).toContainText('Acentuação · Código');
    const resultadoPath = `/Alunos/tentativas/${original.respostaDitadoId}/resultado`;
    await expect.poll(async () => (await api('GET', resultadoPath, 200, undefined, escola.authAluno.token))
      .detalhes[0].estadoAnaliseLlm, { timeout: 8000 }).toBe('Processando');
    console.log('Antes da reinicialização: nota 33.33, 3 lacunas, achado Código e processamento iniciado.');
    execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', restartScript,
      '-Schema', schema, '-ArtifactsPath', artifactsPath, '-Retomar'], { stdio: 'inherit', timeout: 30000 });

    await expect.poll(async () => {
      try {
        const resultado = await api('GET', resultadoPath, 200, undefined, escola.authAluno.token);
        return resultado.detalhes.every(d => d.estadoAnaliseLlm === 'Concluida');
      } catch { return false; }
    }, { timeout: 40000, intervals: [500] }).toBe(true);
    await page.reload();
    await expect(linha).toContainText('Acentuação · Código');
    await expect(linha).toContainText('Achado simulado PER-64 · Correção IA');
    await expect(linha).toContainText('Correção IA · Concluída');
    await expect(page.getByText('33.3%', { exact: true })).toBeVisible();
    await expect(page.getByText('(sem resposta)', { exact: true })).toBeVisible();
    const final = await api('GET', resultadoPath, 200, undefined, escola.authAluno.token);
    assert.equal(final.nota, original.nota);
    assert.deepEqual(final.detalhes[0].classificacoes.map(c => c.erroCatalogoId), [acento.id, candidato.id]);
    console.log(await page.getByRole('table').ariaSnapshot());
    await api('GET', resultadoPath, 404, undefined, outra.authAluno.token);
    const externo = await browser.newPage();
    await loginAluno(externo, outra.acesso);
    await externo.goto(page.url());
    await expect(externo.getByText('Resultado indisponível.', { exact: true })).toBeVisible();
    console.log('PASS: resultado após recarga, nota preservada, origens distintas e acesso de outra escola negado (404).');
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error('FAIL PER-64:', error.message);
  process.exitCode = 1;
});
