import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from '@/components/site-link';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PageIntro } from '@/components/page-intro';
import { RosterGrid } from '@/components/roster-grid';
import { sportsData } from '@/lib/generated-data';
import { clubTeams } from '@/lib/site-data';
import { sitePath } from '@/lib/paths';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return clubTeams.map((team) => ({ team: team.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ team: string }> }): Promise<Metadata> {
  const { team: teamId } = await params;
  const team = clubTeams.find((item) => item.id === teamId);
  return { title: team ? `Roster ${team.name}` : 'Roster' };
}

export default async function TeamRosterPage({ params }: { params: Promise<{ team: string }> }) {
  const { team: teamId } = await params;
  const team = clubTeams.find((item) => item.id === teamId);
  if (!team) notFound();

  const rosterSeasons = [...new Set(sportsData.rosters
    .filter((entry) => entry.team_id === teamId && entry.active)
    .map((entry) => entry.season))]
    .sort((first, second) => second.localeCompare(first));
  const initialSeason = rosterSeasons.includes(sportsData.season) ? sportsData.season : rosterSeasons[0];
  const playersBySeason = Object.fromEntries(rosterSeasons.map((seasonId) => {
    const memberships = sportsData.rosters.filter((entry) => entry.season === seasonId && entry.team_id === teamId && entry.active);
    const players = memberships.map((membership) => {
      const player = sportsData.players.find((item) => item.id === membership.player_id);
      if (!player) return null;
      return { ...player, number: membership.number };
    }).filter((player): player is NonNullable<typeof player> => Boolean(player));
    return [seasonId, players];
  }));

  return <main>
    <SiteHeader />
    <PageIntro eyebrow="Amatori UISP" title={team.name}>
      <p>Roster e archivio dei giocatori della squadra.</p>
    </PageIntro>
    <section className="page-section roster-section">
      <Link className="roster-back-link" href={sitePath('/roster')}><ArrowLeft size={17} /> Cambia squadra</Link>
      <p className="eyebrow dark">Conosci i giocatori</p>
      <RosterGrid playersBySeason={playersBySeason} seasons={rosterSeasons} initialSeason={initialSeason} />
    </section>
    <SiteFooter />
  </main>;
}
