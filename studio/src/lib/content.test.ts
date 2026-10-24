import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parseDocument } from 'yaml';
import { editYaml, parseNews, playerSocialUrls, safeSlug } from './content.ts';

test('YAML conserva campi non gestiti', () => {
  const updated = editYaml('id: marco\nname: Marco\ncustom: resta\n', { name: 'Marco D.' });
  assert.match(updated, /custom: resta/);
  assert.match(updated, /name: Marco D\./);
});

test('notizia conserva metadati personalizzati e genera slug sicuro', () => {
  const news = parseNews('---\ntitle: Titolo\nextra: valore\n---\nTesto');
  assert.match(news.update({ title: 'Nuovo' }, 'Corpo'), /extra: valore/);
  assert.equal(safeSlug('Novità Nerone 2026/27!'), 'novita-nerone-2026-27');
});

test('tutti i profili reali con social_urls si aprono senza bloccare lo Studio', () => {
  const players = new URL('../../../site/data/players/', import.meta.url);
  let profilesWithSocial = 0;
  for (const filename of readdirSync(players).filter((name) => name.endsWith('.yaml'))) {
    const document = parseDocument(readFileSync(new URL(filename, players), 'utf8'));
    const urls = playerSocialUrls(document);
    assert.ok(Array.isArray(urls), filename);
    if (urls.length) profilesWithSocial++;
  }
  const michele = parseDocument(readFileSync(new URL('michele-magrini.yaml', players), 'utf8'));
  assert.deepEqual(playerSocialUrls(michele), ['https://www.instagram.com/reel/DX1uhCiIa9A/']);
  assert.ok(profilesWithSocial > 0);
});
