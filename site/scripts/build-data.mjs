import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = join(projectRoot, 'data');
const contentRoot = join(projectRoot, 'content', 'news');
const publicRoot = join(projectRoot, 'public');
const errors = [];
const siteUrl = 'https://mich1803.github.io/nerone-basket-anzio';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field.trim()); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; field = '';
    } else field += char;
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  const [headers = [], ...body] = rows;
  return body.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function csv(relativePath) {
  const path = join(dataRoot, relativePath);
  return existsSync(path) ? parseCsv(readFileSync(path, 'utf8')) : [];
}

function numberOrNull(value) {
  if (value === '' || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const competitionConfig = YAML.parse(readFileSync(join(dataRoot, 'competitions.yaml'), 'utf8'));
const teams = YAML.parse(readFileSync(join(dataRoot, 'teams.yaml'), 'utf8'));

const players = readdirSync(join(dataRoot, 'players'))
  .filter((file) => ['.yaml', '.yml'].includes(extname(file)) && !file.startsWith('_'))
  .map((file) => YAML.parse(readFileSync(join(dataRoot, 'players', file), 'utf8')));
const playerIds = new Set(players.map((player) => player.id));

const rosters = csv('rosters.csv').map((row) => ({
  ...row,
  team_id: row.team_id || 'nerone',
  number: numberOrNull(row.number),
  active: row.active.toLowerCase() !== 'false',
}));

for (const membership of rosters) {
  if (!playerIds.has(membership.player_id)) errors.push(`Roster ${membership.season}: giocatore ${membership.player_id} non definito.`);
  if (!teams[membership.team_id]) errors.push(`Roster ${membership.season}: squadra ${membership.team_id} non definita.`);
}

function buildCompetition(seasonId, competition) {
  const gameRows = csv(join('games', seasonId, `${competition.id}.csv`));
  const games = gameRows.map((row) => ({
    ...row,
    social_urls: row.instagram_url ? row.instagram_url.split('|').filter(Boolean) : [],
    home_score: numberOrNull(row.home_score),
    away_score: numberOrNull(row.away_score),
    competition: competition.id,
  }));
  const gameIds = new Set();
  for (const game of games) {
    if (!game.id) errors.push(`${competition.id}: una partita non ha un ID.`);
    if (gameIds.has(game.id)) errors.push(`${competition.id}: ID partita duplicato ${game.id}.`);
    gameIds.add(game.id);
    if (!teams[game.home_team] || !teams[game.away_team]) errors.push(`${game.id}: squadra casa o trasferta non definita in teams.yaml.`);
    if (game.status === 'final' && (game.home_score == null || game.away_score == null)) errors.push(`${game.id}: risultato finale incompleto.`);
  }

  const statRows = csv(join('player-stats', seasonId, `${competition.id}.csv`));
  const playerStats = statRows.map((row) => ({
    ...row,
    points: numberOrNull(row.points) ?? 0,
    three_pointers_made: numberOrNull(row.three_pointers_made) ?? 0,
    two_pointers_made: numberOrNull(row.two_pointers_made) ?? 0,
    free_throws_made: numberOrNull(row.free_throws_made) ?? 0,
    fouls: numberOrNull(row.fouls) ?? 0,
    rebounds_off: numberOrNull(row.rebounds_off) ?? 0,
    rebounds_def: numberOrNull(row.rebounds_def) ?? 0,
    assists: numberOrNull(row.assists) ?? 0,
    turnovers: numberOrNull(row.turnovers) ?? 0,
  }));

  for (const stat of playerStats) {
    if (!gameIds.has(stat.game_id)) errors.push(`${stat.game_id}: statistiche collegate a una partita inesistente.`);
    if (!playerIds.has(stat.player_id)) errors.push(`${stat.game_id}: giocatore ${stat.player_id} non definito.`);
    if (stat.minutes && !/^\d{1,2}:\d{2}$/.test(stat.minutes)) errors.push(`${stat.game_id}: minuti non validi per ${stat.player_id}; usare MM:SS.`);
  }

  const postseasonPath = join(dataRoot, 'postseason', seasonId, `${competition.id}.yaml`);
  const postseason = existsSync(postseasonPath) ? YAML.parse(readFileSync(postseasonPath, 'utf8')) : undefined;
  if (postseason) {
    for (const group of postseason.play_in?.groups ?? []) {
      for (const row of group.rows ?? []) {
        if (!teams[row.team_id]) errors.push(`${seasonId}/${competition.id}: squadra ${row.team_id} del play-in non definita in teams.yaml.`);
      }
    }
    const bracketGameIds = [...(postseason.bracket?.semifinal_game_ids ?? []), postseason.bracket?.final_game_id].filter(Boolean);
    for (const gameId of bracketGameIds) {
      if (!gameIds.has(gameId)) errors.push(`${seasonId}/${competition.id}: partita ${gameId} del bracket non definita.`);
    }
    if (postseason.bracket?.champion_team_id && !teams[postseason.bracket.champion_team_id]) errors.push(`${seasonId}/${competition.id}: squadra campione ${postseason.bracket.champion_team_id} non definita.`);
  }

  const explicitStandings = csv(join('standings', seasonId, `${competition.id}.csv`));
  if (explicitStandings.length) {
    const rows = explicitStandings.map((row) => ({
      team_id: row.team_id,
      name: teams[row.team_id]?.name ?? row.team_id,
      played: numberOrNull(row.played) ?? 0,
      wins: numberOrNull(row.wins) ?? 0,
      losses: numberOrNull(row.losses) ?? 0,
      points_for: numberOrNull(row.points_for) ?? 0,
      points_against: numberOrNull(row.points_against) ?? 0,
      difference: (numberOrNull(row.points_for) ?? 0) - (numberOrNull(row.points_against) ?? 0),
      table_points: numberOrNull(row.table_points),
    }));
    for (const row of rows) {
      if (!teams[row.team_id]) errors.push(`${seasonId}/${competition.id}: squadra ${row.team_id} della classifica non definita in teams.yaml.`);
    }
    return { ...competition, games, playerStats, standings: rows, postseason };
  }

  const standings = new Map();
  const ensureTeam = (teamId) => {
    if (!standings.has(teamId)) standings.set(teamId, { team_id: teamId, played: 0, wins: 0, losses: 0, points_for: 0, points_against: 0, table_points: null });
    return standings.get(teamId);
  };

  for (const game of games.filter((item) => item.status === 'final' && item.home_score != null && item.away_score != null && (!item.phase || item.phase === 'regular-season'))) {
    const home = ensureTeam(game.home_team);
    const away = ensureTeam(game.away_team);
    home.played += 1; away.played += 1;
    home.points_for += game.home_score; home.points_against += game.away_score;
    away.points_for += game.away_score; away.points_against += game.home_score;
    if (game.home_score > game.away_score) { home.wins += 1; away.losses += 1; }
    else { away.wins += 1; home.losses += 1; }
  }

  const winPoints = competition.standings_points?.win;
  const lossPoints = competition.standings_points?.loss;
  const rows = [...standings.values()].map((row) => ({
    ...row,
    name: teams[row.team_id]?.name ?? row.team_id,
    difference: row.points_for - row.points_against,
    table_points: typeof winPoints === 'number' && typeof lossPoints === 'number' ? row.wins * winPoints + row.losses * lossPoints : null,
  })).sort((a, b) => (b.table_points ?? b.wins) - (a.table_points ?? a.wins) || b.difference - a.difference);

  return { ...competition, games, playerStats, standings: rows, postseason };
}

const seasonConfigs = competitionConfig.seasons ?? [{ id: competitionConfig.season, competitions: competitionConfig.competitions }];
const seasons = seasonConfigs.map((season) => ({
  id: season.id,
  competitions: season.competitions.map((competition) => buildCompetition(season.id, competition)),
}));
const currentSeasonId = competitionConfig.current_season ?? competitionConfig.season;
const competitions = seasons.find((season) => season.id === currentSeasonId)?.competitions ?? [];
if (!competitions.length) errors.push(`La stagione corrente ${currentSeasonId} non è definita in competitions.yaml.`);

const news = existsSync(contentRoot) ? readdirSync(contentRoot)
  .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
  .map((file) => {
    const source = readFileSync(join(contentRoot, file), 'utf8');
    const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
    if (!match) { errors.push(`${file}: front matter Markdown mancante.`); return null; }
    return { slug: file.replace(/\.md$/, ''), ...YAML.parse(match[1]), body: match[2].trim() };
  }).filter(Boolean) : [];

if (errors.length) {
  console.error('\nErrori nei dati del sito:\n- ' + errors.join('\n- '));
  process.exit(1);
}

const output = { season: currentSeasonId, teams, players, rosters, competitions, seasons, news };
writeFileSync(join(projectRoot, 'lib', 'generated-data.ts'), `// Generato automaticamente da scripts/build-data.mjs.\nimport type { SportsData } from './data-types';\nexport const sportsData: SportsData = ${JSON.stringify(output, null, 2)};\n`);

const clubTeamIds = new Set(['nerone', 'nerone-bounganvillae']);
const seasonRouteId = (seasonId) => seasonId.split('-')[1]?.slice(-2) ?? seasonId;
const sitemapRoutes = [...new Set([
  '/',
  '/calendario',
  '/roster',
  '/notizie',
  '/club',
  ...seasons.flatMap((season) => season.competitions.flatMap((competition) => {
    const route = season.competitions.length === 1
      ? seasonRouteId(season.id)
      : `${competition.id}/${seasonRouteId(season.id)}`;
    return [`/campionato/${route}`, `/partite/${route}`];
  })),
  ...['nerone', 'nerone-bounganvillae'].map((teamId) => `/roster/${teamId}`),
  ...players.map((player) => `/giocatori/${player.id}`),
  ...seasons.flatMap((season) => season.competitions.flatMap((competition) => competition.games
    .filter((game) => (clubTeamIds.has(game.home_team) || clubTeamIds.has(game.away_team)) && (game.phase !== 'friendly' || game.youtube_url))
    .map((game) => `/partite/${game.id}`))),
  ...news.map((item) => `/notizie/${item.slug}`),
])];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes.map((route) => `  <url><loc>${siteUrl}${route === '/' ? '/' : route}</loc></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(join(publicRoot, 'sitemap.xml'), sitemapXml);
writeFileSync(join(publicRoot, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`Dati validati: ${seasons.reduce((total, season) => total + season.competitions.reduce((sum, competition) => sum + competition.games.length, 0), 0)} partite, ${players.length} giocatori, ${news.length} notizie.`);
