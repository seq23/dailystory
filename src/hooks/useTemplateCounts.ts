import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TemplateCounts {
  [key: string]: number;
}

export function useTemplateCounts() {
  const [counts, setCounts] = useState<TemplateCounts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplateCounts = async () => {
      try {
        const levels = ['beginner', 'easy', 'medium', 'hard', 'expert', 'grade6', 'grade7', 'grade8', 'grade9', 'grade10'];
        const countPromises = levels.map(async (level) => {
          const { data } = await supabase.functions.invoke('template-service', {
            body: {
              difficulty: level,
              explore: true,
              userInfo: { name: 'Test' }
            }
          });
          return { level, count: data?.templateCount || 0 };
        });

        const results = await Promise.all(countPromises);
        const newCounts: TemplateCounts = {};
        results.forEach(({ level, count }) => {
          newCounts[level] = count;
        });
        
        setCounts(newCounts);
      } catch (error) {
        // Fallback to hardcoded counts if fetch fails
        setCounts({
          beginner: 100,
          easy: 5,
          medium: 5,
          hard: 5,
          expert: 5,
          grade6: 3,
          grade7: 3,
          grade8: 3,
          grade9: 3,
          grade10: 3
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateCounts();
  }, []);

  return { counts, loading };
}