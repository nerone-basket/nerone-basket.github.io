import type { Metadata } from 'next';
import Link from '@/components/site-link';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { assetPath, sitePath } from '@/lib/paths';
import { sportsData } from '@/lib/generated-data';
import { Countdown } from '@/components/countdown';
import { PromotedSocial } from '@/components/promoted-social';
import homeSocial from '@/data/home-social.json';
import { archivePath, competitions, isClubTeam } from '@/lib/site-data';
import { absoluteSiteUrl } from '@/lib/seo';

export const dynamic = 'force-static';
export const metadata: Metadata = { alternates: { canonical: absoluteSiteUrl('/') } };

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = sportsData.competitions.flatMap((competition) => competition.games.map((game) => ({
    ...game,
    competitionName: game.phase === 'friendly' ? 'Amichevole' : competition.name,
  }))).filter((game) => game.status === 'scheduled' && game.date >= today).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const nextGame = upcoming[0];
  const nextHome = nextGame ? sportsData.teams[nextGame.home_team]?.short_name ?? nextGame.home_team : '';
  const nextAway = nextGame ? sportsData.teams[nextGame.away_team]?.short_name ?? nextGame.away_team : '';
  const nextClubTeamId = nextGame ? [nextGame.home_team, nextGame.away_team].find(isClubTeam) : undefined;
  const nextClubLogo = nextClubTeamId ? sportsData.teams[nextClubTeamId]?.logo_on_dark : undefined;
  const latestNews = [...sportsData.news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const currentCompetitions = competitions.filter((competition) => sportsData.competitions.some((entry) => entry.id === competition.slug));
  const currentSeasonLabel = sportsData.season.replace('-', '/');
  const nextGameContent = <>
    <p className="panel-label"><span>Prossima<br className="next-game-label-break" />{' '}partita</span></p>
    <div className="next-game-state">
      <img src={assetPath(nextClubLogo || '/assets/logo-bianco.png')} alt="" />
      <div>
        <strong>{nextGame ? `${nextHome} – ${nextAway}` : 'Calendario in aggiornamento'}</strong>
        <span>{nextGame?.competitionName ?? `Stagione ${currentSeasonLabel}`}</span>
      </div>
    </div>
    <div className="next-game-meta">
      <span><CalendarDays size={16} /> {nextGame ? `${nextGame.date} · ${nextGame.time || 'Orario da definire'}` : 'Date in arrivo'}</span>
      <span><MapPin size={16} /> {nextGame?.venue || 'Anzio'}</span>
    </div>
    {nextGame?.time && <Countdown target={`${nextGame.date}T${nextGame.time}:00`} />}
  </>;

  return (
    <main>
      <SiteHeader />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Nerone Basket Anzio · Stagione 2026/27</p>
          <h1 id="hero-title"><span className="visually-hidden">Nerone Basket Anzio — </span>Black!</h1>
          <p className="hero-intro">
            Risultati, classifiche, tabellini e notizie della stagione 26/27 del
            NERONE BASKET ANZIO.
          </p>
          <div className="hero-actions">
            <Link className="button button-light" href={sitePath('/campionato/27')}>
              Segui la stagione <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="text-link" href={sitePath('/roster')}>Scopri i roster</Link>
          </div>
        </div>

        <div className="hero-photo" aria-hidden="true">
          <img src={assetPath('/assets/home-team-alt.png')} alt="" />
          <div className="photo-wash" />
          <p className="side-word">ANZIO</p>
        </div>

        {nextGame && nextGame.phase !== 'friendly'
          ? <Link className="next-game" href={sitePath(`/partite/${nextGame.id}`)} aria-label={`Apri la partita ${nextHome} contro ${nextAway}`}>{nextGameContent}</Link>
          : <aside className="next-game" aria-label="Prossima partita">{nextGameContent}</aside>}
      </section>

      <PromotedSocial posts={homeSocial.posts} />

      <section className="competition-strip" aria-labelledby="competitions-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Le nostre squadre</p>
            <h2 id="competitions-title">Segui il campionato</h2>
          </div>
          <p>
            {currentCompetitions.length === 1
              ? `Nella stagione ${currentSeasonLabel} le squadre Nerone condividono il campionato ${currentCompetitions[0].name}, con roster separati.`
              : `Segui i ${currentCompetitions.length} campionati della stagione ${currentSeasonLabel}, con risultati e classifiche aggiornati.`}
          </p>
        </div>

        <div className={`competition-grid${currentCompetitions.length === 1 ? ' competition-grid-single' : ''}`}>
          {currentCompetitions.map((competition, index) => (
            <Link href={sitePath(archivePath('campionato', competition.slug, sportsData.season))} className="competition-card" key={competition.slug}>
              <span className="competition-index">0{index + 1}</span>
              <span className="competition-code">{competition.code}</span>
              <div>
                <p>Stagione {currentSeasonLabel}</p>
                <h3>{competition.name}</h3>
              </div>
              <ArrowRight size={24} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
      {latestNews.length > 0 && <section className="home-news" aria-labelledby="latest-news-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Dal campo e dal club</p>
            <h2 id="latest-news-title">Ultime notizie</h2>
          </div>
          <Link className="home-news-link" href={sitePath('/notizie')}>Tutte le notizie <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="news-grid home-news-grid" data-count={latestNews.length}>
          {latestNews.map((news) => <Link href={sitePath(`/notizie/${news.slug}`)} className="news-card" key={news.slug}>
            {news.cover ? <figure><img src={assetPath(news.cover)} alt="" /></figure> : <figure className="news-card-placeholder"><img src={assetPath('/assets/logo-testo-bianco.png')} alt="" /></figure>}
            <div>
              <p>{new Date(`${news.date}T12:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <h2>{news.title}</h2>
              {news.excerpt && <span>{news.excerpt}</span>}
            </div>
          </Link>)}
        </div>
      </section>}
      <SiteFooter />
    </main>
  );
}
