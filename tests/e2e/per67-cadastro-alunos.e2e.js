const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { chromium, expect } = require('playwright/test');

const { E2E_API_URL: apiUrl, E2E_BASE_URL: baseUrl, E2E_CHROME_PATH } = process.env;

async function api(method, route, status, data, token) {
  const response = await fetch(apiUrl + route, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: data === undefined ? undefined : JSON.stringify(data)
  });
  assert.equal(response.status, status, method + ' ' + route);
  return response.json();
}

async function run() {
  assert.ok(apiUrl && baseUrl, 'Use API e frontend de teste com dados sintéticos.');
  const login = `per67-${randomUUID()}@teste.invalid`;
  const senha = randomUUID();
  const professor = await api('POST', '/Usuarios/cadastro-professor', 200, {
    nome: 'Professor sintético', login, senha, opcaoEscola: 'CriarNova', nomeNovaEscola: 'Escola de teste PER-67'
  });
  const { token } = await api('POST', '/Usuarios/login', 200, { login, senha });
  const [{ escolaId }] = await api('GET', '/Usuarios/contexto-escolar', 200, undefined, token);

  const browser = await chromium.launch({ channel: 'chrome', headless: true, executablePath: E2E_CHROME_PATH });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);
    const pedidos = [];
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().endsWith('/Usuarios/alunos-manual'))
        pedidos.push(request.postDataJSON());
    });
    await page.goto(baseUrl + '/login');
    await page.getByPlaceholder('seu@email.com').fill(login);
    await page.getByPlaceholder('Digite sua senha').fill(senha);
    await page.getByRole('button', { name: 'Entrar como professor' }).click();
    await page.waitForURL('**/professor');
    await page.goto(baseUrl + '/usuarios');
    const abrir = page.getByRole('button', { name: 'Cadastrar alunos', exact: true });
    await abrir.click();
    const dialog = page.getByRole('dialog').filter({ hasText: 'Cadastro manual de alunos' });
    const turmaSelect = dialog.getByRole('combobox', { name: 'Turma' });
    const confirmar = dialog.getByRole('button', { name: 'Confirmar cadastro' });
    await turmaSelect.press('ArrowDown');
    await expect(page.getByText('Nenhuma turma ativa disponível', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await confirmar.click();
    await expect(dialog.getByText('Selecione uma turma para cadastrar os alunos.')).toBeVisible();
    assert.equal(pedidos.length, 0);
    await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();

    const turma = await api('POST', '/Turmas', 201, {
      nome: 'Turma de teste PER-67', serie: 3, anoLetivo: 2026, escolaId, professorResponsavelId: professor.id
    }, token);
    await abrir.click();
    await turmaSelect.press('ArrowDown');
    await page.getByRole('option', { name: turma.nome, exact: true }).click();
    await confirmar.click();
    await expect(dialog.getByText('Informe o nome na linha 1.')).toBeVisible();
    await dialog.getByRole('button', { name: 'Adicionar linha' }).click();
    const linhas = dialog.getByRole('row').filter({ has: page.getByRole('spinbutton') });
    await linhas.nth(0).getByRole('textbox').first().fill('Primeiro aluno de teste');
    await linhas.nth(1).getByRole('textbox').first().fill('Segundo aluno de teste');
    const primeira = dialog.getByRole('spinbutton', { name: 'Número da chamada, linha 1' });
    const segunda = dialog.getByRole('spinbutton', { name: 'Número da chamada, linha 2' });
    await primeira.fill('001');
    await segunda.pressSequentially('teste');
    await expect(segunda).toHaveValue('');
    for (const invalido of ['', '0', '2.5', '1000']) {
      await segunda.fill(invalido);
      await confirmar.click();
      await expect(dialog.getByText('Informe um número da chamada inteiro de 1 a 999 na linha 2.')).toBeVisible();
      assert.equal(pedidos.length, 0);
    }
    await segunda.fill('999');
    await confirmar.click();
    await expect(dialog.getByText('Convites gerados', { exact: true })).toBeVisible();
    await expect(dialog.getByText(`E${escolaId}-T${turma.id}-N001`, { exact: false })).toBeVisible();
    await expect(dialog.getByText(`E${escolaId}-T${turma.id}-N999`, { exact: false })).toBeVisible();
    assert.deepEqual(pedidos.map(p => [p.numeroChamada, p.turmaId, p.matricula]), [[1, turma.id, ''], [999, turma.id, '']]);

    await dialog.locator('input[type=file]').setInputFiles({
      name: 'chamada.csv', mimeType: 'text/csv', buffer: Buffer.from('Nome;Chamada\nAluno de teste importado;0\n')
    });
    const pendente = dialog.getByRole('row').filter({ has: page.getByRole('button', { name: 'Adicionar', exact: true }) });
    await pendente.getByRole('spinbutton').fill('1000');
    await pendente.getByRole('button', { name: 'Adicionar', exact: true }).click();
    await expect(dialog.getByText('Informe o nome e uma chamada inteira de 1 a 999.')).toBeVisible();
    assert.equal(pedidos.length, 2);
    await pendente.getByRole('spinbutton').fill('12');
    await pendente.getByRole('button', { name: 'Adicionar', exact: true }).click();
    await confirmar.click();
    await expect(dialog.getByText(`E${escolaId}-T${turma.id}-N012`, { exact: false })).toBeVisible();
    assert.equal(pedidos[2].numeroChamada, 12);
    console.log('PASS PER-67: turma obrigatória, chamadas inválidas sem POST, dois convites manuais e um convite após corrigir CSV.');
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error.message); process.exitCode = 1; });
