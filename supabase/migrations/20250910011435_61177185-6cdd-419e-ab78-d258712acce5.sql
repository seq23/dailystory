-- Security Fix: Secure subscription_status_view with proper RLS policies
-- This addresses the security vulnerability where subscription data could be publicly accessible

-- Enable RLS on the view
ALTER TABLE public.subscription_status_view ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only access their own subscription status
CREATE POLICY "Users can only view their own subscription status" 
ON public.subscription_status_view
FOR SELECT
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Create policy for service role to access all subscription data (for edge functions)
CREATE POLICY "Service role can access all subscription status" 
ON public.subscription_status_view
FOR SELECT
USING (auth.role() = 'service_role'::text);