import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscountActivationDetail {
  code: string;
  description: string;
  endDate: string;
  durationDays: number;
}

export const DiscountActivationBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [discountDetails, setDiscountDetails] = useState<DiscountActivationDetail | null>(null);

  useEffect(() => {
    const handleDiscountActivated = (event: CustomEvent<DiscountActivationDetail>) => {
      setDiscountDetails(event.detail);
      setIsVisible(true);
    };

    window.addEventListener('discount-activated', handleDiscountActivated as EventListener);
    
    return () => {
      window.removeEventListener('discount-activated', handleDiscountActivated as EventListener);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !discountDetails) return null;

  const formattedEndDate = new Date(discountDetails.endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Alert className="bg-green-50 border-green-200 mb-4 relative">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800 pr-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <span className="font-medium">🎉 Welcome to Premium!</span> {discountDetails.description} activated successfully. 
            <span className="text-green-700"> Your {discountDetails.durationDays} days of premium access expires on {formattedEndDate}.</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-green-600 hover:text-green-800 hover:bg-green-100 p-1 h-auto ml-4"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
