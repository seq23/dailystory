import { AuthWrapper } from "@/components/AuthWrapper";
import { Link } from "react-router-dom";
import PricingSection from "@/components/PricingSection";

const Index = () => {
  return (
    <div className="homepage">
      <AuthWrapper />
      <div className="mt-6">
        <PricingSection compact />
      </div>
      <div className="mt-6 text-center">
        <Link to="/pricing" className="story-link text-sm">See all plans and roadmap →</Link>
      </div>
    </div>
  );
};

export default Index;
