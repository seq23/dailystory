import React from 'react';
import { TierCascadeViewer } from '@/components/TierCascadeViewer';
import { Card, CardContent } from '@/components/ui/card';

interface DebugDataViewerTierTabProps {
  tierCascadeData: any[] | null;
  sessionId: string;
}

export function DebugDataViewerTierTab({ tierCascadeData, sessionId }: DebugDataViewerTierTabProps) {
  if (tierCascadeData && tierCascadeData.length > 0) {
    return <TierCascadeViewer tierData={tierCascadeData} sessionId={sessionId} />;
  }

  if (tierCascadeData && tierCascadeData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            No tier routing data found for session: {sessionId}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Tier routing data is only available for sessions with image generation attempts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}