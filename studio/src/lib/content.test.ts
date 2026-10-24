import test from 'node:test';
import assert from 'node:assert/strict';
import { editYaml, parseNews, safeSlug } from './content.ts';

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
