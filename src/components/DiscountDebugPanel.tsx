import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activateSequoiaDiscount, checkSubscriptionStatus } from "@/utils/discountActivation";
import { EnhancedSubscriptionManager } from "@/services/enhancedSubscriptionManager";

export const DiscountDebugPanel = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [message, setMessage] = useState<string>("");

  const handleActivateDiscount = async () => {
    setLoading(true);
    setMessage("Activating SEQUOIA90 discount code...");
    
    try {
      const result = await activateSequoiaDiscount();
      setMessage(result.success ? result.message || "Success!" : result.error || "Failed");
      
      if (result.success) {
        // Refresh subscription status
        await EnhancedSubscriptionManager.forceRefresh();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setMessage("Checking subscription status...");
    
    try {
      const result = await checkSubscriptionStatus();
      setStatus(result.subscriber);
      setMessage(result.success ? "Status retrieved" : result.error || "Failed to get status");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    EnhancedSubscriptionManager.clearCache();
    localStorage.clear();
    sessionStorage.clear();
    setMessage("All caches cleared");
    setStatus(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛠️ Discount Debug Panel
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleActivateDiscount} 
            disabled={loading}
            variant="default"
          >
            Activate SEQUOIA90
          </Button>
          
          <Button 
            onClick={handleCheckStatus} 
            disabled={loading}
            variant="outline"
          >
            Check Status
          </Button>
          
          <Button 
            onClick={handleClearCache}
            variant="destructive"
          >
            Clear All Caches
          </Button>
        </div>

        {message && (
          <div className="p-3 bg-gray-100 rounded-md">
            <strong>Message:</strong> {message}
          </div>
        )}

        {status && (
          <div className="p-3 bg-blue-50 rounded-md">
            <strong>Subscription Status:</strong>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p><strong>Console Commands:</strong></p>
          <code>__activateSequoiaDiscount()</code> - Activate SEQUOIA90<br/>
          <code>__checkSubscriptionStatus()</code> - Check current status
        </div>
      </CardContent>
    </Card>
  );
};