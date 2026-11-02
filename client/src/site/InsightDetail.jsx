import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock, Link2, Linkedin, Mail, Twitter, UserRound } from 'lucide-react';
import { api, assetUrl } from '../api.js';
import { Icon } from '../icons.jsx';
import { useSiteData } from './SiteData.jsx';
import { NotFoundBlock, SiteShell } from './Layout.jsx';
import { Cta, InsightCard } from './Sections.jsx';
import { ErrorState, LoadingState } from './States.jsx';
import { SmartLink } from './nav.jsx';

function formatDate(d) {
  if (!d) return '';
  const date = new Date(`${String(d).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Very small formatter: blank-line separated paragraphs, "## " headings and "- " bullet lists. */
function ArticleBody({ text }) {
  const blocks = String(text || '').replace(/\r\n/g, '\n').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="article-body">
      {blocks.map((b, i) => {
        if (b.startsWith('## ')) return <h2 key={i}>{b.slice(3)}</h2>;
        const lines = b.split('\n');
        if (lines.every((l) => /^[-*] /.test(l.trim()))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}</ul>;
        }
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{l}</Fragment>)}</p>;
      })}
    </div>
  );
}

export default function InsightDetail() {
  const { slug } = useParams();
  const site = useSiteData();
  const [state, setState] = useState({ loading: true, error: null, notFound: false, article: null, related: [] });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setState((st) => ({ ...st, loading: true, error: null, notFound: false }));
    api(`/api/public/insights/${encodeURIComponent(slug)}`)
      .then((d) => alive && setState({ loading: false, error: null, notFound: false, article: d.article, related: d.related }))
      .catch((e) => alive && setState({ loading: false, error: e.status === 404 ? null : e.message, notFound: e.status === 404, article: null, related: [] }));
    window.scrollTo(0, 0);
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    if (state.article) document.title = `${state.article.title} | ${site.data?.settings?.site_name || 'Aerolex Advisors'}`;
  }, [state.article, site.data]);

  if ((site.loading && !site.data) || (state.loading && !state.article)) return <LoadingState />;
  if (site.error || !site.data) return <ErrorState message={site.error} onRetry={site.reload} />;

  const data = site.data;
  const a = state.article;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(pageUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  return (
    <SiteShell data={data}>
      {state.notFound && <NotFoundBlock title="Article not found" text="This article may have been moved or unpublished." />}
      {state.error && <ErrorState message={state.error} />}
      {a && (
        <article>
          <header className="article-hero">
            <div className="container">
              <nav className="breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link><ChevronRight size={14} />
                <SmartLink to="#insights">{data.sections.insights?.eyebrow || 'Insights'}</SmartLink><ChevronRight size={14} />
                <span aria-current="page">{a.category || 'Article'}</span>
              </nav>
              <div className="article-head">
                <div className="insight-meta">
                  <span className="insight-cat-icon"><Icon name={a.category_icon} size={15} strokeWidth={2} /></span>
                  {a.category && <span className="insight-cat">{a.category}</span>}
                </div>
                <h1>{a.title}</h1>
                <div className="article-meta">
                  {a.author && <span><UserRound size={16} /> {a.author}</span>}
                  {a.published_on && <span><CalendarDays size={16} /> {formatDate(a.published_on)}</span>}
                  {a.read_time && <span><Clock size={16} /> {a.read_time}</span>}
                </div>
              </div>
              {a.image && (
                <div className="article-cover">
                  <img src={assetUrl(a.image)} alt={a.title} />
                </div>
              )}
            </div>
          </header>

          <div className="container article-body-wrap">
            <div>
              {a.excerpt && <p className="lead" style={{ fontSize: 20, color: 'var(--dark)', marginBottom: 28, fontWeight: 500 }}>{a.excerpt}</p>}
              <ArticleBody text={a.content} />
              <div style={{ marginTop: 48 }}>
                <SmartLink to="#insights" className="link-arrow"><ArrowLeft size={16} /> Back to all insights</SmartLink>
              </div>
            </div>
            <aside className="article-aside">
              <div className="aside-card">
                <h4>Share this article</h4>
                <div className="share-row">
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn"><Linkedin size={18} /></a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(a.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X"><Twitter size={18} /></a>
                  <a href={`mailto:?subject=${encodeURIComponent(a.title)}&body=${encodeURIComponent(pageUrl)}`} aria-label="Share by email"><Mail size={18} /></a>
                  <button type="button" onClick={copyLink} aria-label="Copy link"><Link2 size={18} /></button>
                </div>
                {copied && <p className="copied-note" role="status">Link copied to clipboard</p>}
              </div>
              <div className="aside-card dark">
                <h4>Need support with your next mission?</h4>
                <p>Our operations desk is available 24/7 to coordinate permits, clearances and ground services.</p>
                <SmartLink to={data.settings.cta_link || '#contact'} className="btn btn-red">{data.settings.cta_text || 'Book a Consultation'} <ArrowRight size={16} /></SmartLink>
              </div>
            </aside>
          </div>

          {state.related.length > 0 && (
            <section className="related" aria-labelledby="related-title">
              <div className="container">
                <div className="related-head">
                  <div>
                    <span className="eyebrow">{data.sections.insights?.eyebrow || 'Aviation Insights'}</span>
                    <h2 className="h-section" id="related-title">More from the operations desk.</h2>
                  </div>
                  <SmartLink to="#insights" className="btn btn-outline">View all insights</SmartLink>
                </div>
                <div className="insights-grid">
                  {state.related.map((r) => <InsightCard key={r.id} a={r} readText={data.sections.insights?.btn1_text || 'Read Article'} />)}
                </div>
              </div>
            </section>
          )}
        </article>
      )}
      {data.sections.cta?.is_visible ? <Cta s={data.sections.cta} /> : null}
    </SiteShell>
  );
}
