import { useEffect, useState } from "react";
import { AuthWrapper } from "@/components/AuthWrapper";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const isStoryAction = new URLSearchParams(location.search).get('action') === 'new-story';

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