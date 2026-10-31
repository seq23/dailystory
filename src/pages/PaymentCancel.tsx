import { uiText } from "@/i18n/uiText";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-orange-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
           {uiText("Payment Cancelled")} </h1>

        <p className="text-muted-foreground">
           {uiText("No worries — you weren't charged. You can upgrade to premium anytime.")} </p>

        <div className="space-y-3">
          <Button onClick={() => navigate("/pricing")} variant="default" className="w-full" size="lg">
             {uiText("View Plans")} </Button>
          <Button onClick={() => navigate("/")} variant="outline" className="w-full" size="lg">
             {uiText("Continue as Guest")} </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
