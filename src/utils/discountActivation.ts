import { supabase } from "@/integrations/supabase/client";

/**
 * Manually activate the SEQUOIA90 discount code for the current user
 * This is a utility function to fix the current user's account
 */
export const activateSequoiaDiscount = async () => {
  try {
    console.log("🎯 Attempting to activate SEQUOIA90 discount code...");
    
    const { data, error } = await supabase.functions.invoke("activate-discount-code", {
      body: { discountCode: "SEQUOIA90" },
    });
    
    if (error) {
      console.error("❌ Failed to activate discount code:", error);
      return { success: false, error: error.message };
    }
    
    if (data?.success) {
      console.log("✅ SEQUOIA90 discount code activated successfully:", data.message);
      
      // Force subscription cache refresh
      const { EnhancedSubscriptionManager } = await import("@/services/enhancedSubscriptionManager");
      await EnhancedSubscriptionManager.forceRefresh();
      
      return { 
        success: true, 
        message: data.message,
        activated: data.activated,
        alreadyActivated: data.alreadyActivated
      };
    }
    
    return { success: false, error: "Unknown error occurred" };
  } catch (error) {
    console.error("❌ Error activating discount code:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

/**
 * Check current user's subscription status including discount codes
 */
export const checkSubscriptionStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.log("No subscriber record found");
      return { success: true, subscriber: null };
    }

    return { success: true, subscriber };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

// Global function to activate discount for debugging
if (typeof window !== 'undefined') {
  (window as any).__activateSequoiaDiscount = activateSequoiaDiscount;
  (window as any).__checkSubscriptionStatus = checkSubscriptionStatus;
}