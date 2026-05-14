import { useEffect, useState } from "react";
import { AuthWrapper } from "@/components/AuthWrapper";

import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const isStoryAction = new URLSearchParams(location.search).get('action') === 'new-story';

  useEffect(() => {
    const url = "https://time-2-read.lovable.app/";
    const title = "Time2Read - Interactive Reading Adventures for Kids";
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
        {
          "@type": "Organization",
          name: "Time2Read",
          url,
          logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/dVPwHmSLKid0GwEoF6n0FXqKtvA2/uploads/1757466743772-time2read-logo.png"
        },
        {
          "@type": "WebSite",
          name: "Time2Read",
          url,
          description: desc
        }
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
    </div>
  );
};

export default Index;