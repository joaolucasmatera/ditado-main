const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:5173';
const studentCode = process.env.E2E_STUDENT_CODE || 'E0-T1-N008';
const pin = process.env.E2E_STUDENT_PIN || '1234';
const executablePath = process.env.E2E_CHROME_PATH ||
  'C:\\Users\\lucas\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage();

  try {
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Aluno', exact: true }).click();
    await page.getByRole('button', { name: 'Primeiro login: criar PIN' }).click();

    await page.getByRole('textbox', { name: 'Matrícula ou código de entrada' })
      .fill(studentCode);
    await page.getByRole('button', { name: 'Continuar' }).click();

    await assertVisible(page, 'Identificador confirmado. Agora crie seu PIN para acessar como aluno.');
    await page.getByRole('textbox', { name: 'Crie seu PIN' }).fill(pin);
    await page.getByRole('button', { name: 'Criar PIN' }).click();

    await page.waitForURL('**/aluno');
    await assertVisible(page, 'Bem-vindo(a)');

    console.log(`PASS: primeiro acesso do aluno (${studentCode}) levou a /aluno`);
  } finally {
    await browser.close();
  }
}

async function assertVisible(page, text) {
  await assert.doesNotReject(async () => {
    await page.getByText(text, { exact: false }).waitFor({ state: 'visible' });
  });
}

run().catch((error) => {
  console.error('FAIL: teste E2E de primeiro acesso do aluno');
  console.error(error);
  process.exitCode = 1;
});
