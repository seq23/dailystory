
-- Daily country stats: anonymous geo tracking aggregated by day
CREATE TABLE public.daily_country_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_date date NOT NULL DEFAULT CURRENT_DATE,
  country text NOT NULL DEFAULT 'Unknown',
  region text DEFAULT NULL,
  city text DEFAULT NULL,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (stat_date, country, region, city)
);

ALTER TABLE public.daily_country_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages daily_country_stats"
  ON public.daily_country_stats FOR ALL
  USING (auth.role() = 'service_role'::text);

CREATE INDEX idx_daily_country_stats_date ON public.daily_country_stats(stat_date DESC);

-- Daily usage stats: AI call tracking by operation type
CREATE TABLE public.daily_usage_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_date date NOT NULL DEFAULT CURRENT_DATE,
  operation_type text NOT NULL DEFAULT 'unknown',
  call_count integer NOT NULL DEFAULT 1,
  total_input_tokens integer NOT NULL DEFAULT 0,
  total_output_tokens integer NOT NULL DEFAULT 0,
  estimated_cost numeric NOT NULL DEFAULT 0,
  provider text DEFAULT 'openai',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (stat_date, operation_type, provider)
);

ALTER TABLE public.daily_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages daily_usage_stats"
  ON public.daily_usage_stats FOR ALL
  USING (auth.role() = 'service_role'::text);

CREATE INDEX idx_daily_usage_stats_date ON public.daily_usage_stats(stat_date DESC);
