import Link from '@/components/site-link';
import { Menu } from 'lucide-react';
import { assetPath, sitePath } from '@/lib/paths';
import { sportsData } from '@/lib/generated-data';
import { archivePath } from '@/lib/site-data';

const primaryCompetition = sportsData.competitions[0]?.id ?? 'platinum';
const links = [
  { href: archivePath('campionato', primaryCompetition, sportsData.season), label: 'Campionato' },
  { href: archivePath('partite', primaryCompetition, sportsData.season), label: 'Partite' },
  { href: '/calendario', label: 'Calendario' },
  { href: '/roster', label: 'Roster' },
  { href: '/notizie', label: 'Notizie' },
  { href: '/club', label: 'Club' },
];

export function SiteHeader({ light = false }: { light?: boolean }) {
  return (
    <header className={`site-header ${light ? 'site-header-light' : ''}`}>
      <Link className="brand" href={sitePath('/')} aria-label="Nerone Basket Anzio — Home">
        <img
          className="brand-mark"
          src={assetPath(`/assets/${light ? 'logo-nero.png' : 'logo-bianco.png'}`)}
          alt=""
        />
        <img
          className={`brand-wordmark${light ? ' brand-wordmark-dark' : ''}`}
          src={assetPath('/assets/testo.png')}
          alt="Nerone Basket Anzio"
        />
      </Link>
      <nav className="desktop-nav" aria-label="Navigazione principale">
        {links.map((link) => <Link href={sitePath(link.href)} key={link.href}>{link.label}</Link>)}
      </nav>
      <span className="season-chip">{sportsData.season.replace('-', ' / ')}</span>
      <details className="mobile-menu">
        <summary aria-label="Apri il menu"><Menu size={22} /></summary>
        <nav aria-label="Navigazione mobile">
          {links.map((link) => <Link href={sitePath(link.href)} key={link.href}>{link.label}</Link>)}
        </nav>
      </details>
    </header>
  );
}
