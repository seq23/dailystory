/**
 * TestRunCostReadout — what a specific test run actually cost.
 *
 * Reads `cost_tracking` rows for the given session ids. RLS only exposes rows
 * where `user_id = auth.uid()`, so this shows the spend attributable to the
 * signed-in tester. Rows an edge function logged without a user id (guest
 * paths) are not visible here — they still land in the all-time totals on the
 * Spend tab.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, RefreshCw } from 'lucide-react';

interface Row {
  provider: string | null;
  operation_type: string;
  model_used: string;
  cost: number;
}

export const TestRunCostReadout: React.FC<{ sessionIds: string[] }> = ({ sessionIds }) => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);

  const measure = async () => {
    if (sessionIds.length === 0) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('cost_tracking')
        .select('provider, operation_type, model_used, cost')
        .in('session_id', sessionIds);
      setRows((data as Row[]) || []);
    } finally {
      setLoading(false);
    }
  };

  const total = (rows || []).reduce((sum, r) => sum + Number(r.cost || 0), 0);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm border-t pt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={measure}
        disabled={loading || sessionIds.length === 0}
      >
        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Receipt className="h-4 w-4 mr-2" />}
        Cost of this run
      </Button>

      {rows && (
        <>
          <Badge variant="secondary">${total.toFixed(6)}</Badge>
          <span className="text-muted-foreground">
            {rows.length} logged call{rows.length === 1 ? '' : 's'} across {sessionIds.length} session
            {sessionIds.length === 1 ? '' : 's'}
          </span>
          {rows.length === 0 && (
            <span className="text-muted-foreground">
              (no rows visible to your user — costs logged without a user id appear in all-time totals only)
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default TestRunCostReadout;