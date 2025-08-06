import { AuthWrapper } from "@/components/AuthWrapper";
import { TemplateDebugDashboard } from "@/components/TemplateDebugDashboard";
import { EnhancedTemplateDebugDashboard } from "@/components/EnhancedTemplateDebugDashboard";

const Index = () => {
  return (
    <div className="homepage">
      <AuthWrapper />
      <EnhancedTemplateDebugDashboard />
    </div>
  );
};

export default Index;
