import type { Metadata } from 'next';
import { CompetitionPageView } from '@/components/competition-page-view';
import { competitions } from '@/lib/site-data';
import { getLatestSeasonForCompetition } from '@/lib/archive-data';

export const metadata: Metadata = { title: 'Amatori UISP' };
export const dynamic = 'force-static';

export default function GoldPage() {
  const competition = competitions.find((item) => item.slug === 'gold') ?? competitions[0];
  const season = getLatestSeasonForCompetition(competition.slug);
  return <CompetitionPageView competition={competition} seasonId={season?.id ?? '2026-27'} />;
}
