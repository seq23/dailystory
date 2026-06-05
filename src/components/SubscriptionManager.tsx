import { useState, useEffect } from "react";
import { DebugLogger } from '@/services/DebugLogger';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, CreditCard, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tag } from "lucide-react";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export const SubscriptionManager = ({ showComparison = true }: { showComparison?: boolean }) => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const checkSubscription = async () => {
    try {
      setRefreshing(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to check subscription status");
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        DebugLogger.error('error', 'Subscription check API error', { error });
        if (error.message?.includes("STRIPE_SECRET_KEY")) {
          toast.info("Payment system not configured yet");
        } else {
          toast.error("Failed to check subscription status");
        }
        return;
      }

      setSubscriptionData(data);
    } catch (error) {
      DebugLogger.error('error', 'Subscription check operation failed', { error });
      toast.error("Failed to check subscription status");
    } finally {
      setRefreshing(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to manage subscription");
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        if (error.message?.includes("STRIPE_SECRET_KEY")) {
          toast.error("Payment system not configured yet");
        } else {
          toast.error(error.message || "Failed to open customer portal");
        }
        return;
      }

      if (data?.url) {
        // Open customer portal in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error("Failed to open customer portal");
      DebugLogger.error('error', 'Customer portal operation failed', { error });
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async (plan: "monthly" | "annual") => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to subscribe");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        if (error.message?.includes("STRIPE_SECRET_KEY")) {
          toast.error("Payment system not configured yet");
        } else {
          toast.error(error.message || "Failed to start checkout");
        }
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error("Failed to start checkout process");
      DebugLogger.error('error', 'Stripe checkout operation failed', { error });
    } finally {
      setLoading(false);
    }
  };

  const redeemDiscountCode = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a discount code");
      return;
    }
    try {
      setRedeeming(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to redeem a discount code");
        return;
      }

      // Validate first for a clear message, then activate via the service-role function.
      const { data: validation } = await supabase.functions.invoke('validate-discount-code', {
        body: { code },
      });
      if (validation && validation.valid === false) {
        toast.error(validation.message || "Invalid discount code");
        return;
      }

      const { data, error } = await supabase.functions.invoke('apply-discount-code', {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
        body: { discountCode: code },
      });

      if (error || !data?.activated) {
        toast.error(data?.message || error?.message || "Could not apply discount code");
        return;
      }

      toast.success(data.message || "Discount applied! Your premium access is now active.");
      setDiscountCode("");
      await checkSubscription();
    } catch (err) {
      DebugLogger.error('error', 'Discount redemption failed', { error: err });
      toast.error("Could not apply discount code");
    } finally {
      setRedeeming(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkSubscription}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {subscriptionData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {subscriptionData.subscribed ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Active Subscription
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    No Active Subscription
                  </>
                )}
              </CardTitle>
              {subscriptionData.subscription_tier && (
                <Badge variant="secondary">
                  {subscriptionData.subscription_tier}
                </Badge>
              )}
            </div>
            <CardDescription>
              {subscriptionData.subscribed
                ? "You have access to all premium features"
                : "Subscribe to unlock unlimited stories and advanced features"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionData.subscribed ? (
              <div className="space-y-4">
                {subscriptionData.subscription_end && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Renewal Date: {formatDate(subscriptionData.subscription_end)}</span>
                  </div>
                )}
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={openCustomerPortal} disabled={loading}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {loading ? "Opening..." : "Manage Subscription"}
                  </Button>
                  <Button variant="outline" onClick={() => setCancelOpen(true)}>
                    Cancel Subscription
                  </Button>
                  <Button variant="secondary" onClick={() => window.open('mailto:sales@time2read.example?subject=Enterprise%20Inquiry','_blank')}>
                    Upgrade to Enterprise
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Monthly Plan</h3>
                    <div className="text-2xl font-bold text-primary mb-4">
                      $10<span className="text-sm text-gray-500">/month</span>
                    </div>
                    <Button 
                      onClick={() => startCheckout("monthly")} 
                      disabled={loading}
                      className="w-full"
                    >
                      Subscribe Monthly
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-green-500/20 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Annual Plan</h3>
                      <Badge className="bg-green-500">Save $20</Badge>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-4">
                      $100<span className="text-sm text-gray-500">/year</span>
                    </div>
                    <Button 
                      onClick={() => startCheckout("annual")} 
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Subscribe Annually
                    </Button>
                  </CardContent>
                </Card>
              </div>
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Have a discount code?</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Redeem a code for free premium access — no credit card required.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === 'Enter') redeemDiscountCode(); }}
                        disabled={redeeming}
                        className="uppercase"
                      />
                      <Button onClick={redeemDiscountCode} disabled={redeeming || !discountCode.trim()}>
                        {redeeming ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}

{showComparison && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Free vs Premium</CardTitle>
            <CardDescription>What you get with Premium compared to Free</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-2 text-sm">
              <li>• Unlimited stories vs. daily limit</li>
              <li>• Live page-by-page generation</li>
              <li>• Save stories to your library</li>
              <li>• Vocabulary tracking and progress</li>
              <li>• Parent / Teacher dashboard insights</li>
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why are you cancelling?</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Optional: Your feedback helps us improve"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Back</Button>
            <Button
              onClick={async () => {
                try {
                  if (cancelReason.trim()) {
                    await supabase.from('feedback').insert({
                      message: cancelReason.trim(),
                      category: 'cancellation',
                      user_agent: navigator.userAgent,
                      page_url: window.location.href,
                    });
                  }
                } catch (e) {
                  DebugLogger.error('error', 'Failed to record cancellation feedback', { error: e });
                } finally {
                  setCancelOpen(false);
                  openCustomerPortal();
                }
              }}
            >
              Continue to Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};