import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { sportsData } from '@/lib/generated-data';
import { assetPath, instagramUrl } from '@/lib/paths';
import { SocialEmbeds } from '@/components/social-embeds';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return sportsData.players.map((player) => ({ id: player.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: sportsData.players.find((player) => player.id === id)?.name ?? 'Giocatore' };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = sportsData.players.find((item) => item.id === id);
  if (!player) notFound();
  const membership = sportsData.rosters.find((entry) => entry.player_id === id && entry.season === sportsData.season);
  const currentTeam = membership ? sportsData.teams[membership.team_id] : undefined;

  return <main>
    <SiteHeader />
    <section className="player-hero">
      <div className="player-hero-copy"><p className="eyebrow">{currentTeam?.name ?? 'Roster'} · 2026/27</p><span className="profile-number">{membership?.number ?? '—'}</span><h1>{player.name}</h1><p>{membership?.role || 'Giocatore'}</p></div>
      <figure><img src={assetPath(player.photo || '/assets/logo-bianco.png')} alt={player.name} /></figure>
    </section>
    <section className="page-section player-content">
      <article><p className="eyebrow dark">Profilo</p><h2>Bio</h2><p className="player-bio">{player.bio}</p>{player.instagram && <a className="button button-dark" href={instagramUrl(player.instagram)} target="_blank" rel="noreferrer">Instagram <ExternalLink size={16} /></a>}</article>
      <aside className="player-social-panel">
        {player.social_urls?.length
          ? <SocialEmbeds posts={player.social_urls} title="Contenuti correlati" />
          : <><p className="eyebrow dark">Instagram</p><h2>Contenuti correlati</h2><p className="player-social-empty">Nessun post collegato a questo giocatore.</p></>}
      </aside>
    </section>
    <SiteFooter />
  </main>;
}
