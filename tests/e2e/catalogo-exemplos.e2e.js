const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { chromium, expect } = require('playwright/test');

const { E2E_API_URL: apiUrl, E2E_BASE_URL: baseUrl } = process.env;

async function run() {
  assert.ok(apiUrl && baseUrl, 'Informe a URL do frontend e da API de um ambiente sintético.');
  const login = `${randomUUID()}@teste.invalid`;
  const senha = randomUUID();
  const cadastro = await fetch(`${apiUrl}/Usuarios/cadastro-professor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, senha, nome: 'Professor de teste', opcaoEscola: 'CriarNova', nomeNovaEscola: 'Escola de teste' }),
    signal: AbortSignal.timeout(15_000)
  });
  assert.equal(cadastro.status, 200);
  const nome = `Troca de M por N ${randomUUID()}`;

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15_000);
    page.on('pageerror', erro => console.error('Erro no frontend:', erro.message));
    await page.goto(`${baseUrl}/login`);
    await page.getByPlaceholder('seu@email.com').fill(login);
    await page.getByPlaceholder('Digite sua senha').fill(senha);
    await page.getByRole('button', { name: 'Entrar como professor' }).click();
    await page.waitForURL('**/professor');
    await page.goto(`${baseUrl}/catalogo-erros/publicar`);
    await page.getByLabel('Nome do erro').fill(nome);
    await page.getByLabel('Descrição do erro').fill('Troca de M por N antes de P ou B.');
    await expect(page.getByPlaceholder('Ex.: Antes de p e b usamos M e não N')).toBeVisible();
    const exemplos = page.getByRole('group', { name: 'Exemplos opcional' });
    const adicionar = exemplos.getByRole('button', { name: 'Adicionar exemplo' });
    await expect(exemplos.getByRole('textbox', { name: 'Escrita esperada' })).toHaveCount(1);
    const publicar = page.getByRole('button', { name: 'Publicar erro', exact: true });
    await exemplos.getByLabel('Escrita esperada').first().fill('campo');
    await publicar.click();
    await expect(exemplos.getByRole('alert')).toContainText('no exemplo 1');
    await exemplos.getByLabel('Resposta do aluno').first().fill('canpo');
    await adicionar.click();
    await exemplos.getByLabel('Escrita esperada').nth(1).fill('tambor');
    await exemplos.getByLabel('Resposta do aluno').nth(1).fill('tanbor');
    for (let i = 0; i < 3; i++) await adicionar.click();
    await expect(exemplos.getByRole('textbox', { name: 'Escrita esperada' })).toHaveCount(5);
    await expect(adicionar).toBeDisabled();
    await expect(exemplos.getByRole('status')).toHaveText('Limite de 5 exemplos');
    await exemplos.getByRole('button', { name: 'Remover exemplo 5' }).click();
    await expect(adicionar).toBeEnabled();
    const [resposta] = await Promise.all([
      page.waitForResponse(r => r.url().endsWith('/ErrosCatalogo') && r.request().method() === 'POST'),
      publicar.click()
    ]);
    assert.equal(resposta.status(), 201);
    const { id, exemplos: persistidos } = await resposta.json();
    assert.deepEqual(persistidos, [{ esperado: 'campo', resposta: 'canpo' }, { esperado: 'tambor', resposta: 'tanbor' }]);
    const recibo = page.getByRole('status').filter({ hasText: 'Erro publicado' });
    await expect(recibo.getByText('canpo', { exact: true })).toBeVisible();
    await expect(recibo.getByText('tanbor', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Voltar ao catálogo' }).click();
    await page.waitForURL('**/catalogo-erros');
    await page.getByRole('textbox', { name: 'Pesquisar erros' }).fill(nome);
    await expect(page.getByRole('row').filter({ hasText: nome })).toBeVisible();
    await page.getByRole('button', { name: `Ver detalhes do erro ${nome}`, exact: true }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo.getByText('canpo', { exact: true })).toBeVisible();
    await expect(dialogo.getByText('tanbor', { exact: true })).toBeVisible();
    await dialogo.getByRole('button', { name: 'Fechar', exact: true }).click();

    await page.getByRole('button', { name: `Editar erro ${nome}`, exact: true }).click();
    await expect(dialogo.getByLabel('Escrita esperada').first()).toHaveValue('campo');
    await dialogo.getByLabel('Escrita esperada').first().fill('tempo');
    await dialogo.getByLabel('Resposta do aluno').first().fill('tenpo');
    await dialogo.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(dialogo).toBeHidden();

    await page.goto(`${baseUrl}/catalogo-erros/${id}/editar`);
    await expect(page.getByLabel('Escrita esperada').first()).toHaveValue('tempo');
    await expect(page.getByLabel('Resposta do aluno').nth(1)).toHaveValue('tanbor');
    await page.getByRole('button', { name: 'Remover exemplo 1' }).click();
    await expect(page.getByLabel('Escrita esperada')).toHaveValue('tambor');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByRole('heading', { name: 'Erro atualizado' })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Escrita esperada')).toHaveValue('tambor');
    await expect(page.getByLabel('Resposta do aluno')).toHaveValue('tanbor');
    await page.getByLabel('Escrita esperada').fill('');
    await page.getByLabel('Resposta do aluno').fill('');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText('Nenhum exemplo informado.')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Escrita esperada' })).toHaveCount(1);
    await expect(page.getByLabel('Escrita esperada')).toHaveValue('');

    await page.goto(`${baseUrl}/catalogo-erros`);
    await page.getByRole('textbox', { name: 'Pesquisar erros' }).fill(nome);
    await page.getByRole('button', { name: `Editar erro ${nome}`, exact: true }).click();
    await expect(dialogo.getByRole('textbox', { name: 'Escrita esperada' })).toHaveCount(1);
    await expect(dialogo.getByLabel('Resposta do aluno')).toHaveValue('');
    console.log('PASS: limite de cinco no formulário, dois pares relidos e edição sem exemplos abre com uma linha opcional.');
  } finally {
    await browser.close();
  }
}

run().catch(erro => { console.error(erro.stack); process.exitCode = 1; });
