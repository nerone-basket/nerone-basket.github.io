import { sportsData } from '@/lib/generated-data';

export const season = {
  id: sportsData.season,
  label: sportsData.season.replace('-', '/'),
};

export type Competition = {
  slug: string; name: string; shortName: string; code: string; teamName: string;
};

const orderedSeasons = [...sportsData.seasons].sort((first, second) =>
  Number(second.id === sportsData.season) - Number(first.id === sportsData.season) || second.id.localeCompare(first.id));
const competitionMap = new Map<string, Competition>();
for (const entry of orderedSeasons) {
  for (const competition of entry.competitions) {
    if (!competitionMap.has(competition.id)) competitionMap.set(competition.id, {
      slug: competition.id,
      name: competition.name,
      shortName: competition.name,
      code: competition.id === 'platinum' ? 'UISP' : competition.id.slice(0, 6).toUpperCase(),
      teamName: 'Nerone Basket Anzio',
    });
  }
}
export const competitions: Competition[] = [...competitionMap.values()];

export const clubTeams = [
  { id: 'nerone', name: 'Nerone Basket Anzio', shortName: 'Nerone', code: 'NER' },
  { id: 'nerone-bounganvillae', name: 'Nerone Basket Anzio BGV', shortName: 'Nerone BGV', code: 'BGV' },
] as const;

export type ClubTeamId = (typeof clubTeams)[number]['id'];

export function isClubTeam(teamId: string): teamId is ClubTeamId {
  return clubTeams.some((team) => team.id === teamId);
}

export function getCompetition(slug: string) {
  return competitions.find((competition) => competition.slug === slug);
}

export function seasonRouteId(seasonId: string) {
  return seasonId.split('-')[1]?.slice(-2) ?? seasonId;
}

export function archivePath(section: 'campionato' | 'partite', competition: string, seasonId: string) {
  const seasonData = sportsData.seasons.find((entry) => entry.id === seasonId);
  return seasonData?.competitions.length === 1
    ? `/${section}/${seasonRouteId(seasonId)}`
    : `/${section}/${competition}/${seasonRouteId(seasonId)}`;
}
