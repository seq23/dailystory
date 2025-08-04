import { AuthWrapper } from "@/components/AuthWrapper";
import { DifficultyTestComponent } from "@/components/DifficultyTestComponent";

const Index = () => {
  return (
    <div className="homepage">
      <AuthWrapper />
      {process.env.NODE_ENV === 'development' && (
        <DifficultyTestComponent />
      )}
    </div>
  );
};

export default Index;
