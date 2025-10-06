import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useCachedSubscriptionStatus } from "@/hooks/useCachedSubscriptionStatus";

interface NonBlockingSubscriptionBannerProps {
  userId: string;
}

export const NonBlockingSubscriptionBanner = ({ userId }: NonBlockingSubscriptionBannerProps) => {
  const { isPremium, loading } = useCachedSubscriptionStatus(userId);

  // Don't show banner while loading or if user is premium
  if (loading || isPremium) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4 border-red-500 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Your subscription is inactive. Please update your billing to continue.</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = '/account'}
          className="ml-4"
        >
          Manage Billing
        </Button>
      </AlertDescription>
    </Alert>
  );
};
