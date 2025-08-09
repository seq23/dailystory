import { AuthWrapper } from "@/components/AuthWrapper";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="homepage">
      <AuthWrapper />
      <div className="mt-4 text-center">
        <Link to="/style-preview" className="story-link text-sm">Preview reader styles</Link>
      </div>
    </div>
  );
};

export default Index;
