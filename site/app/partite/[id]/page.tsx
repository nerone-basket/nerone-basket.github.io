import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, MapPin } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { sportsData } from '@/lib/generated-data';
import { assetPath } from '@/lib/paths';
import { GamesPageView } from '@/components/games-page-view';
import { getArchiveCompetitionIds, getLatestSeasonForCompetition } from '@/lib/archive-data';
import { getCompetition, isClubTeam, seasonRouteId } from '@/lib/site-data';
import { SocialEmbeds } from '@/components/social-embeds';

export const dynamic = 'force-static';
export const dynamicParams = false;

const neroneGames = sportsData.seasons.flatMap((season) => season.competitions.flatMap((competition) => competition.games.map((game) => ({ season, competition, game })))).filter(({ game }) => (isClubTeam(game.home_team) || isClubTeam(game.away_team)) && (game.phase !== 'friendly' || game.youtube_url));
const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

function formatGameDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return `${day} ${monthNames[month - 1]} ${year}`;
}

export function generateStaticParams() {
  return [...new Set([
    ...neroneGames.map(({ game }) => game.id),
    ...getArchiveCompetitionIds(),
    ...sportsData.seasons.map((season) => seasonRouteId(season.id)),
  ])].map((id) => ({ id }));
}

function resolveGamesArchive(value: string) {
  const season = sportsData.seasons.find((item) => seasonRouteId(item.id) === value);
  if (season) return { competition: getCompetition(season.competitions[0]?.id), season };

  const competition = getCompetition(value);
  return { competition, season: competition ? getLatestSeasonForCompetition(competition.slug) : undefined };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const found = neroneGames.find(({ game }) => game.id === id);
  if (!found) {
    const { competition, season } = resolveGamesArchive(id);
    return { title: competition && season ? `Partite ${competition.shortName} ${season.id.replace('-', '/')}` : 'Partita' };
  }
  return { title: `${sportsData.teams[found.game.home_team]?.short_name ?? found.game.home_team} – ${sportsData.teams[found.game.away_team]?.short_name ?? found.game.away_team}` };
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = neroneGames.find(({ game }) => game.id === id);
  if (!found) {
    const { competition, season } = resolveGamesArchive(id);
    if (!competition || !season) notFound();
    return <GamesPageView competition={competition} seasonId={season.id} />;
  }
  const { game, competition, season } = found;
  const home = sportsData.teams[game.home_team];
  const away = sportsData.teams[game.away_team];
  const homeLogo = home?.logo_on_dark || (isClubTeam(game.home_team) ? '/assets/logo-bianco.png' : home?.logo || '/assets/logo-bianco.png');
  const awayLogo = away?.logo_on_dark || (isClubTeam(game.away_team) ? '/assets/logo-bianco.png' : away?.logo || '/assets/logo-bianco.png');
  const isFriendly = game.phase === 'friendly';
  const gameCompetitionLabel = game.phase === 'friendly' ? 'Amichevole' : competition.name;
  const venueLabel = game.venue && game.address.toLocaleLowerCase().includes(game.venue.toLocaleLowerCase())
    ? game.address
    : [game.venue, game.address].filter(Boolean).join(' · ');

  return <main>
    <SiteHeader />
    <section className="game-hero">
      <p className="eyebrow">{gameCompetitionLabel} · {season.id.replace('-', '/')}{game.round ? ` · ${game.round}` : ''}</p>
      <h1 className="game-matchup-title">{home?.short_name ?? game.home_team} <span>vs</span> {away?.short_name ?? game.away_team}</h1>
      <div className="scoreboard">
        <div><img src={assetPath(homeLogo)} alt={home?.short_name ?? game.home_team} /></div>
        {isFriendly
          ? <strong className="friendly-versus">VS</strong>
          : <strong>{game.home_score ?? '–'}<span>:</span>{game.away_score ?? '–'}</strong>}
        <div><img src={assetPath(awayLogo)} alt={away?.short_name ?? game.away_team} /></div>
      </div>
      <div className="game-meta">
        <span><CalendarDays size={17} /> {game.date ? `${formatGameDate(game.date)}${game.time ? ` · ${game.time}` : ''}` : 'Data non disponibile'}</span>
        {game.address ? <a className="game-map-link" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(game.address)}`} target="_blank" rel="noreferrer"><MapPin size={17} /> {venueLabel}</a> : <span><MapPin size={17} /> {game.venue || 'Luogo non disponibile'}</span>}
        {game.notes && <span>{game.notes}</span>}
      </div>
    </section>
    {game.youtube_url && <section className="page-section game-video-section">
      <p className="eyebrow dark">Video</p>
      <h2>Guarda la partita</h2>
      <div className="game-video"><iframe src={game.youtube_url} title={`${home?.short_name ?? game.home_team} vs ${away?.short_name ?? game.away_team}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
    </section>}
    {game.social_urls.length > 0 && <section className="page-section game-social-section">
      <SocialEmbeds posts={game.social_urls} title="Dalla partita" />
    </section>}
    <SiteFooter />
  </main>;
}
