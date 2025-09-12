import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BackendTierCheckerProps {
  onTierFound?: (tier: string, details: any) => void;
}

export const BackendTierChecker: React.FC<BackendTierCheckerProps> = ({ onTierFound }) => {
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  useEffect(() => {
    const isDebugMode = typeof window !== 'undefined' && window.location.search.includes('debug=1');
    
    const checkRecentImageCalls = async () => {
      try {
        // Check recent edge function calls for image generation using URL parameters
        const { data, error } = await supabase.functions.invoke('unified-debug-service?operation=recent-image-prompts&global=true&limit=5');

        if (data && !error) {
          if (isDebugMode) {
            console.log('🔍 Recent image generation calls:', data);
          }
          setRecentCalls(data.imagePrompts || []);
          
          // Look for tier success information
          if (data.imagePrompts) {
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
        } else if (error && isDebugMode) {
          console.warn('🚫 Failed to check recent image calls:', error?.message || 'Unknown error');
        }
      } catch (error) {
        if (isDebugMode) {
          // Suppress 400 errors to reduce console spam
          if (error?.message?.includes('400')) {
            console.log('🔇 Debug function temporarily unavailable');
          } else {
            console.warn('⚠️ Image tier check error:', error?.message || 'Unknown error');
          }
        }
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
  try {
    const { data, error } = await supabase.functions.invoke('unified-debug-service?operation=recent-image-prompts&global=true&limit=10');

    if (data && !error) {
      console.log('🔍 MANUAL TIER CHECK - Recent image calls:', data);
      
      if (data.imagePrompts) {
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
    } else if (error) {
      console.warn('🚫 Manual tier check failed:', error?.message || 'Unknown error');
    }
  } catch (error) {
    if (error?.message?.includes('400')) {
      console.log('🔇 Debug function temporarily unavailable');
    } else {
      console.error('⚠️ Manual tier check error:', error?.message || 'Unknown error');
    }
  }
};

console.log('💡 Use window.checkImageTier() to manually check which tier succeeded for recent images');