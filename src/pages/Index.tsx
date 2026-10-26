import { useEffect, useState } from "react";
import { AuthWrapper } from "@/components/AuthWrapper";
import { ReadingCollectionsLinks } from "@/components/ReadingCollectionsLinks";
import { HomeIntro } from "@/components/HomeIntro";
import { SiteFooterNav } from "@/components/SiteFooterNav";
import { useOnPlainHomepage } from "@/lib/guestScreen";
import { ORGANIZATION, WEBSITE } from "@/seo/schema";

import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SITE_URL } from "@/config/site";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const isStoryAction = new URLSearchParams(location.search).get('action') === 'new-story';
  const onPlainHomepage = useOnPlainHomepage();

  useEffect(() => {
    const url = `${SITE_URL}/`;
    const title = "Time-2-Read - Interactive Reading Adventures for Kids";
    const desc = "Personalized AI reading adventures for kids 3-15. Interactive stories with illustrations, phonics, and text-to-speech to build reading confidence.";

    document.title = title;
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        const [k, v] = selector.replace(/[\[\]"]/g, '').split('=');
        el.setAttribute(k, v);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:url"]', 'content', url);

    const ldId = 'ld-website-org';
    document.getElementById(ldId)?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = ldId;
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        ORGANIZATION,
        { ...WEBSITE, description: desc }
      ]
    });
    document.head.appendChild(script);
    return () => { document.getElementById(ldId)?.remove(); };
  }, []);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) setIsAuthenticated(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="homepage">
      <AuthWrapper />
      {/* Marketing text is for visitors and crawlers (prerendered signed out);
          a signed-in family reading a story never scrolls into it, and neither does a
          visitor on the sign-in/sign-up screen or a guest story (onPlainHomepage). */}
      {!isAuthenticated && onPlainHomepage && (
        <>
          <HomeIntro />
          <ReadingCollectionsLinks />
          <SiteFooterNav />
        </>
      )}
    </div>
  );
};

export default Index;