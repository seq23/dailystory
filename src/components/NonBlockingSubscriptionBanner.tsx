import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useCachedSubscriptionStatus } from "@/hooks/useCachedSubscriptionStatus";
import { EnhancedSubscriptionManager } from "@/services/enhancedSubscriptionManager";

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
        <div className="flex gap-2 ml-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              await EnhancedSubscriptionManager.forceRefresh();
              window.location.reload();
            }}
          >
            Refresh Status
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/account'}
          >
            Manage Billing
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
