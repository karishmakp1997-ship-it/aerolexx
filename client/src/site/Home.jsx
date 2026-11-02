import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteData } from './SiteData.jsx';
import { SiteShell } from './Layout.jsx';
import { scrollToId } from './nav.jsx';
import { About, Contact, Cta, Hero, Insights, Process, Services, Vip } from './Sections.jsx';
import { LoadingState, ErrorState } from './States.jsx';

export default function Home() {
  const { data, loading, error, reload } = useSiteData();
  const { hash } = useLocation();
  const [preselect, setPreselect] = useState(null);

  useEffect(() => {
    if (!data) return;
    document.title = data.settings.meta_title || data.settings.site_name || 'Aerolex Advisors';
    if (hash) {
      const id = hash.slice(1);
      // wait for layout/images to settle before jumping
      requestAnimationFrame(() => setTimeout(() => scrollToId(id, 'auto'), 60));
    }
  }, [data, hash]);

  if (loading && !data) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} onRetry={reload} />;

  const S = data.sections;
  const show = (k) => S[k] && S[k].is_visible;
  const onEnquire = (service) => {
    setPreselect({ service, at: Date.now() });
    scrollToId('contact');
  };

  return (
    <SiteShell data={data}>
      {show('hero') && <Hero s={S.hero} highlights={data.highlights} />}
      {show('about') && <About s={S.about} features={data.aboutFeatures} />}
      {show('services') && <Services s={S.services} categories={data.categories} services={data.services} onEnquire={onEnquire} />}
      {show('vip') && <Vip s={S.vip} items={data.vip} />}
      {show('process') && <Process s={S.process} steps={data.process} />}
      {show('insights') && data.insights.length > 0 && <Insights s={S.insights} items={data.insights} />}
      {show('cta') && <Cta s={S.cta} />}
      {show('contact') && <Contact s={S.contact} settings={data.settings} services={data.services} preselect={preselect} />}
    </SiteShell>
  );
}
