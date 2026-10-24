import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', 'dist', 'client');
const game = readdirSync(join(root, 'partite')).find((name) => name.endsWith('.html'));
const pages = ['index.html', 'roster.html', 'notizie.html', 'club.html', game && `partite/${game}`].filter(Boolean);

test('il footer resta presente nelle pagine statiche e conserva link e credito', () => {
  assert.ok(game, 'manca una pagina partita statica');
  for (const page of pages) {
    const html = readFileSync(join(root, page), 'utf8');
    assert.match(html, /WebMAKER by PlayMAKER/, `${page}: credito mancante`);
    assert.match(html, /Nerone Basket Anzio.*Stagione 2026\/27/s, `${page}: nota originale mancante`);
    assert.match(html, /Contatti e campo/, `${page}: navigazione footer mancante`);
  }
});
