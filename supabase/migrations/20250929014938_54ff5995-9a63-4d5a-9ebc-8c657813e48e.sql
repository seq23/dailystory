-- Enhance cost_tracking table to support all service providers
ALTER TABLE cost_tracking 
ADD COLUMN provider text DEFAULT 'openai',
ADD COLUMN api_endpoint text,
ADD COLUMN pricing_model text DEFAULT 'tokens',
ADD COLUMN quantity_used integer DEFAULT 0,
ADD COLUMN unit_cost numeric DEFAULT 0;

-- Add simple indexes for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_cost_tracking_provider ON cost_tracking(provider);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_session_provider ON cost_tracking(session_id, provider);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_timestamp ON cost_tracking(timestamp);

-- Update existing records to have proper provider
UPDATE cost_tracking SET provider = 'openai' WHERE provider IS NULL;