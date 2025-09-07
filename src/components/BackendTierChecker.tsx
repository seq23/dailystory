import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BackendTierCheckerProps {
  onTierFound?: (tier: string, details: any) => void;
}

export const BackendTierChecker: React.FC<BackendTierCheckerProps> = ({ onTierFound }) => {
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  useEffect(() => {
    const checkRecentImageCalls = async () => {
      try {
        // Check recent edge function calls for image generation
        const { data, error } = await supabase.functions.invoke('debug-recent-image-prompts', {
          body: { limit: 5 }
        });

        if (data && !error) {
          console.log('🔍 Recent image generation calls:', data);
          setRecentCalls(data.recentCalls || []);
          
          // Look for tier success information
          if (data.recentCalls) {
            data.recentCalls.forEach((call: any, index: number) => {
              if (call.tier || call.success_tier) {
                const tier = call.tier || call.success_tier;
                console.log(`🎯 TIER SUCCESS FOUND: Tier ${tier}`, {
                  callIndex: index,
                  timestamp: call.timestamp,
                  prompt: call.prompt?.substring(0, 100),
                  success: call.success,
                  imageUrl: call.imageUrl
                });
                
                onTierFound?.(tier, {
                  prompt: call.prompt,
                  timestamp: call.timestamp,
                  imageUrl: call.imageUrl,
                  success: call.success
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn('Failed to check recent image calls:', error);
      }
    };

    // Check immediately and then every 3 seconds
    checkRecentImageCalls();
    const interval = setInterval(checkRecentImageCalls, 3000);
    
    return () => clearInterval(interval);
  }, [onTierFound]);

  // This component is invisible - just for debugging
  return null;
};

// Helper function to manually check tier success in console
(window as any).checkImageTier = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('debug-recent-image-prompts', {
      body: { limit: 10 }
    });

    if (data && !error) {
      console.log('🔍 MANUAL TIER CHECK - Recent image calls:', data);
      
      if (data.recentCalls) {
        data.recentCalls.forEach((call: any, index: number) => {
          console.log(`Call ${index + 1}:`, {
            timestamp: new Date(call.timestamp).toLocaleTimeString(),
            tier: call.tier || call.success_tier || 'Unknown',
            prompt: call.prompt?.substring(0, 150) + '...',
            success: call.success,
            imageUrl: call.imageUrl?.substring(0, 50) + '...'
          });
        });
      }
    }
  } catch (error) {
    console.error('Manual tier check failed:', error);
  }
};

console.log('💡 Use window.checkImageTier() to manually check which tier succeeded for recent images');