import { useEffect, useState } from "react";
import { AuthWrapper } from "@/components/AuthWrapper";
import { Link } from "react-router-dom";
import PricingSection from "@/components/PricingSection";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      {!isAuthenticated && (
        <>
          <div className="mt-6">
            <PricingSection compact />
          </div>
          <div className="mt-6 text-center">
            <Link to="/pricing" className="story-link text-sm">See all plans and roadmap →</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;