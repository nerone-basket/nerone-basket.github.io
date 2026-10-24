import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CompetitionPageView } from '@/components/competition-page-view';
import { getArchiveCompetitionIds, getLatestSeasonForCompetition } from '@/lib/archive-data';
import { sportsData } from '@/lib/generated-data';
import { getCompetition, seasonRouteId } from '@/lib/site-data';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [...new Set([
    ...getArchiveCompetitionIds(),
    ...sportsData.seasons.map((season) => seasonRouteId(season.id)),
  ])].map((competition) => ({ competition }));
}

function resolveRoute(value: string) {
  const season = sportsData.seasons.find((item) => seasonRouteId(item.id) === value);
  if (season) return { competition: getCompetition(season.competitions[0]?.id), season };

  const competition = getCompetition(value);
  return { competition, season: competition ? getLatestSeasonForCompetition(competition.slug) : undefined };
}

export async function generateMetadata({ params }: { params: Promise<{ competition: string }> }): Promise<Metadata> {
  const { competition: competitionId } = await params;
  const { competition, season } = resolveRoute(competitionId);
  return { title: competition && season ? `${competition.name} ${season.id.replace('-', '/')}` : 'Campionato' };
}

export default async function LatestCompetitionPage({ params }: { params: Promise<{ competition: string }> }) {
  const { competition: competitionId } = await params;
  const { competition, season } = resolveRoute(competitionId);
  if (!competition || !season) notFound();

  return <CompetitionPageView competition={competition} seasonId={season.id} />;
}
