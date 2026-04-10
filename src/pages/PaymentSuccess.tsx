import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-foreground">
          Welcome to Premium! <Sparkles className="inline w-6 h-6 text-yellow-500" />
        </h1>

        <p className="text-muted-foreground text-lg">
          Your subscription is now active. Enjoy unlimited stories, saving to your library, and AI-powered quizzes.
        </p>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-foreground flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            What's unlocked
          </h2>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li>✅ Unlimited story sessions — no timer</li>
            <li>✅ Live page-by-page generation</li>
            <li>✅ Save stories to your library</li>
            <li>✅ AI comprehension quizzes</li>
            <li>✅ "Finish Story" with AI endings</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button onClick={() => navigate("/")} className="w-full" size="lg">
            Start Reading Now
          </Button>
          <p className="text-xs text-muted-foreground">
            Redirecting in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
