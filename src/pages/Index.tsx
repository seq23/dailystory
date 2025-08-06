import { AuthWrapper } from "@/components/AuthWrapper";
import { TemplateDebugDashboard } from "@/components/TemplateDebugDashboard";

const Index = () => {
  return (
    <div className="homepage">
      <AuthWrapper />
      <TemplateDebugDashboard />
    </div>
  );
};

export default Index;
