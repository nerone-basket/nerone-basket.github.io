import type { Metadata } from 'next';
import { CompetitionPageView } from '@/components/competition-page-view';
import { competitions } from '@/lib/site-data';
import { sportsData } from '@/lib/generated-data';

export const dynamic = 'force-static';
export const metadata: Metadata = { title: 'Amatori UISP' };

export default function CompetitionsPage() {
  return <CompetitionPageView competition={competitions.find((item) => item.slug === sportsData.competitions[0]?.id) ?? competitions[0]} seasonId={sportsData.season} />;
}
