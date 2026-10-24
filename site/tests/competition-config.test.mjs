import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const testsRoot = dirname(fileURLToPath(import.meta.url));

test('un nuovo campionato appare nei dati e nella sitemap senza archivi CSV preesistenti', () => {
  const root = mkdtempSync(join(testsRoot, '_competition-fixture-'));
  try {
    for (const folder of ['scripts', 'data/players', 'content/news', 'public', 'lib']) mkdirSync(join(root, folder), { recursive: true });
    copyFileSync(join(testsRoot, '../scripts/build-data.mjs'), join(root, 'scripts/build-data.mjs'));
    writeFileSync(join(root, 'data/competitions.yaml'), 'current_season: 2027-28\nseasons:\n  - id: 2027-28\n    competitions:\n      - id: gold\n        name: Amatori Gold\n        teams: [nerone]\n      - id: silver\n        name: Amatori Silver\n        teams: [nerone]\n');
    writeFileSync(join(root, 'data/teams.yaml'), 'nerone:\n  name: Nerone Basket Anzio\n  short_name: Nerone\n');
    writeFileSync(join(root, 'data/players/example.yaml'), 'id: example\nname: Example\nbio: Test\n');
    writeFileSync(join(root, 'data/rosters.csv'), 'season,competition,team_id,player_id,number,role,active\n');
    execFileSync(process.execPath, [join(root, 'scripts/build-data.mjs')], { cwd: root });
    const generated = readFileSync(join(root, 'lib/generated-data.ts'), 'utf8');
    const sitemap = readFileSync(join(root, 'public/sitemap.xml'), 'utf8');
    assert.match(generated, /"id": "silver"/);
    assert.match(sitemap, /\/campionato\/silver\/28/);
    assert.match(sitemap, /\/partite\/gold\/28/);
  } finally {
    assert.ok(resolve(root).startsWith(`${resolve(testsRoot)}\\`) || resolve(root).startsWith(`${resolve(testsRoot)}/`));
    rmSync(root, { recursive: true, force: true });
  }
});
