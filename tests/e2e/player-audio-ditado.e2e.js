const assert = require('node:assert/strict');
const { chromium, expect } = require('playwright/test');

const baseUrl = process.env.E2E_BASE_URL;

// WAV PCM de 8 segundos gerado em memória para testar o player do navegador.
function audioSintetico() {
  const amostras = 8000 * 8;
  const wav = Buffer.alloc(44 + amostras, 128);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(8000, 28);
  wav.writeUInt16LE(1, 32);
  wav.writeUInt16LE(8, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(amostras, 40);
  return 'data:audio/wav;base64,' + wav.toString('base64');
}

async function run() {
  assert.ok(baseUrl, 'Informe E2E_BASE_URL para o frontend de validação.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await page.addInitScript(() => {
      localStorage.setItem('token', 'sessao-sintetica');
      localStorage.setItem('usuario', JSON.stringify({ id: 1, nome: 'Aluno de teste', tipo: 'Aluno' }));
    });
    const audioBase64 = audioSintetico();
    await page.route('**/api/**', route => {
      const path = new URL(route.request().url()).pathname;
      return route.fulfill({ json: {
        titulo: 'Ditado de teste', segmentos: [{ segmentoId: 1, tipo: 'Lacuna' }],
        audioBase64: path.endsWith('/Ditados/3/realizar') ? audioBase64 : null
      } });
    });

    await page.goto(baseUrl + '/realizar-ditado/3');
    const player = page.locator('.audio-player-container');
    const botao = player.getByRole('button', { name: /^(Tocar|Pausar) áudio$/ });
    const velocidade = player.getByRole('combobox', { name: 'Velocidade do áudio' });
    const audio = page.locator('audio');
    const lerAudio = () => audio.evaluate(el => ({
      pausado: el.paused, posicao: el.currentTime, velocidade: el.playbackRate
    }));
    await expect(botao).toHaveCount(1);
    await expect(botao).toHaveAccessibleName('Tocar áudio');
    await expect(botao.locator('.mdi-play')).toBeVisible();
    await expect(player.getByText('Normal (1×)', { exact: true })).toBeVisible();
    await expect.poll(async () => (await lerAudio()).velocidade).toBe(1);
    expect(await player.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);

    await botao.press('Enter');
    await expect(botao).toHaveAccessibleName('Pausar áudio');
    await expect(botao.locator('.mdi-pause')).toBeVisible();
    await expect(botao).toBeFocused();
    await expect.poll(async () => (await lerAudio()).posicao).toBeGreaterThan(0.2);
    await botao.press('Space');
    await expect(botao).toHaveAccessibleName('Tocar áudio');
    assert.equal((await lerAudio()).pausado, true);
    const posicaoPausada = (await lerAudio()).posicao;

    await page.keyboard.press('Tab');
    await expect(velocidade).toBeFocused();
    async function escolherRotulo(rotulo) {
      await velocidade.press('ArrowDown');
      const opcoes = page.getByRole('listbox').getByRole('option');
      await expect(opcoes).toHaveText(['Mais devagar (0,75×)', 'Normal (1×)', 'Mais rápido (1,25×)']);
      await page.getByRole('option', { name: rotulo, exact: true }).press('Enter');
      await expect(page.getByRole('listbox')).toBeHidden();
    }
    await escolherRotulo('Mais devagar (0,75×)');
    await expect.poll(async () => (await lerAudio()).velocidade).toBe(0.75);
    assert.equal((await lerAudio()).posicao, posicaoPausada);

    await botao.press('Enter');
    await expect(botao).toHaveAccessibleName('Pausar áudio');
    await expect.poll(async () => (await lerAudio()).posicao).toBeGreaterThan(posicaoPausada + 0.1);
    assert.equal((await lerAudio()).velocidade, 0.75);
    await escolherRotulo('Mais rápido (1,25×)');
    await expect.poll(async () => (await lerAudio()).velocidade).toBe(1.25);
    await audio.evaluate(el => { el.currentTime = el.duration - 0.05; });
    await expect(botao).toHaveAccessibleName('Tocar áudio');
    await expect.poll(async () => (await lerAudio()).posicao).toBe(0);

    await page.goto(baseUrl + '/realizar-ditado/4');
    await expect(botao).toBeDisabled();
    await expect(velocidade).toBeDisabled();

    console.log('PASS: áudio real no navegador, três velocidades, teclado, pausa, retomada, fim e ausência de áudio.');
  } finally {
    await browser.close();
  }
}

run().catch(erro => { console.error(erro.stack); process.exitCode = 1; });
