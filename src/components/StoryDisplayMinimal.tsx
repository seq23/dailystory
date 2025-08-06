// Minimal test to isolate syntax issue
import { useState } from "react";

const StoryDisplayMinimal = () => {
  const [test, setTest] = useState(0);
  
  return (
    <div>
      <span>Test component</span>
    </div>
  );
};

export default StoryDisplayMinimal;