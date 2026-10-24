import Link from '@/components/site-link';
import { assetPath, sitePath } from '@/lib/paths';

export function SiteFooter() {
  const configuredUrl = process.env.NEXT_PUBLIC_WEBMAKER_URL;
  const webmakerUrl = configuredUrl && /^https:\/\//i.test(configuredUrl) ? configuredUrl : '';
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
      <p className="footer-note">Nerone Basket Anzio · Stagione 2026/27 <span className="footer-credit">{webmakerUrl ? <a href={webmakerUrl} target="_blank" rel="noopener noreferrer">WebMAKER by PlayMAKER</a> : 'WebMAKER by PlayMAKER'}</span></p>
    </footer>
  );
}
