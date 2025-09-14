import React, { useEffect, useState } from 'react';
import { DebugGateway } from '@/services/DebugGateway';

interface BackendTierCheckerProps {
  onTierFound?: (tier: string, details: any) => void;
}

export const BackendTierChecker: React.FC<BackendTierCheckerProps> = ({ onTierFound }) => {
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=1');
    
    const checkRecentImageCalls = async () => {
      // Silent operation - no errors thrown, no console spam
      const { data } = await DebugGateway.getRecentImagePrompts(5);

      if (data && data.imagePrompts) {
        if (isDebugMode) {
          console.log('🔍 Recent image generation calls:', data);
        }
        setRecentCalls(data.imagePrompts || []);
        
        // Look for tier success information
        data.imagePrompts.forEach((call: any, index: number) => {
          if (call.tier) {
            if (isDebugMode) {
              console.log(`🎯 TIER SUCCESS FOUND: Tier ${call.tier}`, {
                callIndex: index,
                timestamp: call.timestamp,
                prompt: call.promptText?.substring(0, 100),
                success: call.success,
                imageUrl: call.imageURL
              });
            }
            
            onTierFound?.(call.tier, {
              prompt: call.promptText,
              timestamp: call.timestamp,
              imageUrl: call.imageURL,
              success: call.success
            });
          }
        });
      }
    };

    // EMERGENCY: Check only once on mount - no polling to prevent quota burn
    checkRecentImageCalls();
    // Auto-polling disabled - use manual debugging instead
  }, [onTierFound]);

  // This component is invisible - just for debugging
  return null;
};

// Helper function to manually check tier success in console
(window as any).checkImageTier = async () => {
  const { data } = await DebugGateway.getRecentImagePrompts(10);

  console.log('🔍 MANUAL TIER CHECK - Recent image calls:', data);
  
  if (data && data.imagePrompts) {
    data.imagePrompts.forEach((call: any, index: number) => {
      console.log(`Call ${index + 1}:`, {
        timestamp: new Date(call.timestamp).toLocaleTimeString(),
        tier: call.tier || 'Unknown',
        prompt: call.promptText?.substring(0, 150) + '...',
        success: call.success,
        imageUrl: call.imageURL?.substring(0, 50) + '...'
      });
    });
  }
};

console.log('💡 Use window.checkImageTier() to manually check which tier succeeded for recent images');