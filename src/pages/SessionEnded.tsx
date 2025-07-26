import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, BookOpen, Clock } from "lucide-react";

interface SessionEndedProps {
  onHome: () => void;
  onNewStory: () => void;
}

const SessionEnded = ({ onHome, onNewStory }: SessionEndedProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-amber-200">
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-amber-100 rounded-full p-4">
              <Clock className="w-12 h-12 text-amber-600" />
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Session Ended
            </h1>
            <p className="text-gray-600">
              Great job on completing your reading session!
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={onHome}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
            
            <Button
              onClick={onNewStory}
              variant="outline"
              className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-medium py-3"
              size="lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start New Story
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionEnded;