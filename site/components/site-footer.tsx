import Link from '@/components/site-link';
import { assetPath, sitePath } from '@/lib/paths';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src={assetPath('/assets/logo-testo-bianco.png')} alt="Nerone Basket Anzio" />
      </div>
      <nav aria-label="Link nel piè di pagina">
        <Link href={sitePath('/campionato/27')}>Campionato</Link>
        <Link href={sitePath('/partite/27')}>Partite</Link>
        <Link href={sitePath('/calendario')}>Calendario</Link>
        <Link href={sitePath('/roster')}>Roster</Link>
        <Link href={sitePath('/notizie')}>Notizie</Link>
        <Link href={sitePath('/club')}>Contatti e campo</Link>
      </nav>
      <p className="footer-note">
        <span>Nerone Basket Anzio · Stagione 2026/27</span>
        <span className="footer-credit">
          Created with <a href="https://github.com/PlayMAKER-apps/webmaker" target="_blank" rel="noopener noreferrer">WebMAKER</a>
          {' '}by <a href="https://playmaker-apps.github.io/" target="_blank" rel="noopener noreferrer">PlayMAKER</a> Ecosystem
          {' '}(an open source project by <a href="https://mich1803.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Michele Magrini</a>)
        </span>
      </p>
    </footer>
  );
}
