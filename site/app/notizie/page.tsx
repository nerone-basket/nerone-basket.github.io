import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PageIntro } from '@/components/page-intro';
import { sportsData } from '@/lib/generated-data';
import { sitePath } from '@/lib/paths';
import Link from '@/components/site-link';

export const metadata: Metadata = { title: 'Notizie' };
export const dynamic = 'force-static';

export default function NewsPage() {
  return (
    <main>
      <SiteHeader />
      <PageIntro eyebrow="Dal campo e dal club" title="Notizie">
        <p>Comunicati, cronache, storie e aggiornamenti del Nerone Basket Anzio.</p>
      </PageIntro>
      {sportsData.news.length > 0 ? <section className="page-section news-grid">{[...sportsData.news].sort((a, b) => b.date.localeCompare(a.date)).map((news) => <Link href={sitePath(`/notizie/${news.slug}`)} className="news-card" key={news.slug}>
        <div><p>{new Date(`${news.date}T12:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p><h2>{news.title}</h2>{news.excerpt && <span>{news.excerpt}</span>}</div>
      </Link>)}</section> : <section className="page-section news-empty">
        <span className="news-mark">N</span>
        <div><p className="eyebrow dark">Archivio pronto</p><h2>Le notizie arriveranno qui</h2><p>I nuovi articoli saranno scritti in Markdown e ordinati automaticamente per data.</p></div>
      </section>}
      <SiteFooter />
    </main>
  );
}
