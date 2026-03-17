import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { LeanErrorService } from "@/utils/LeanErrorService";
import { DebugLogger } from "@/services/DebugLogger";

export type ChildProfile = Tables<'child_profiles'>;

interface NewChildInput {
  display_name: string;
  birth_month?: number | null;
  birth_year?: number | null;
  grade_level?: string | null;
  avatar?: Record<string, any> | null;
  favorite_color?: string | null;
  favorite_animal?: string | null;
  favorite_food?: string | null;
  hobbies?: string | null;
}

// Simplified per-instance caching to prevent race conditions
const CACHE_DURATION = 5000; // 5 seconds

// Helper: Only log for authenticated users or when ?debug=1 is present
const shouldLog = () => {
  if (typeof window !== 'undefined' && window.location.search.includes('debug=1')) {
    return true;
  }
  // Check for authenticated user via supabase singleton (non-async check)
  return false; // Default to silent for guest users
};

export function useChildProfiles() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Per-instance cache to prevent race conditions
  const lastRequestRef = useRef<{ userId: string; promise: Promise<any>; timestamp: number } | null>(null);

  const load = useCallback(async () => {
    if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Starting load');
    
    // Check if we have a recent request for the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      if (shouldLog()) DebugLogger.warn('auth', 'Auth error in useChildProfiles', authError);
      setError(authError.message);
      setLoading(false);
      return;
    }
    
    if (!user) {
      if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: No authenticated user, clearing child profiles');
      setChildren([]);
      setActiveChildId(null);
      setLoading(false);
      return;
    }
    
    // Use per-instance cache to prevent duplicate requests
    const now = Date.now();
    if (lastRequestRef.current && 
        lastRequestRef.current.userId === user.id && 
        now - lastRequestRef.current.timestamp < CACHE_DURATION) {
      if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Using cached request');
      try {
        await lastRequestRef.current.promise;
        return;
      } catch (e) {
        // Cache failed, continue with fresh request
      }
    }
    
    if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Setting loading to true');
    setLoading(true);
    setError(null);
    
    const loadPromise = (async () => {
      try {
        if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Fetching fresh data from database');
        const [{ data: prefs }, { data: kids, error: kidsErr }] = await Promise.all([
          supabase
            .from('user_preferences')
            .select('active_child_id')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('child_profiles')
            .select('*')
            .eq('parent_user_id', user.id)
            .order('created_at', { ascending: true })
        ]);

        if (kidsErr) throw kidsErr;
        
        const resultData = { children: kids || [], activeChildId: (prefs as any)?.active_child_id ?? null };
        
        if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Data loaded successfully', {
          childrenCount: resultData.children.length,
          activeChildId: resultData.activeChildId
        });
        
        setChildren(resultData.children);
        setActiveChildId(resultData.activeChildId);
        
      } catch (e: any) {
        if (shouldLog()) DebugLogger.error('auth', 'useChildProfiles: Load failed', e);
        LeanErrorService.logError(e, 'useChildProfiles');
        setError(e?.message || 'Failed to load child profiles');
      } finally {
        if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Setting loading to false');
        setLoading(false);
      }
    })();
    
    // Cache this request per instance
    lastRequestRef.current = {
      userId: user.id,
      promise: loadPromise,
      timestamp: now
    };
    
    return loadPromise;
  }, []);

  // Auth state subscription and initial load - wait for auth to be ready
  useEffect(() => {
    let hasInitialLoad = false;
    if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Setting up auth state listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Auth state changed', { event, hasUser: !!session?.user });
      
      if (event === 'SIGNED_IN') {
        // Clear any stale state and reload fresh data for this user
        lastRequestRef.current = null;
        await load();
        hasInitialLoad = true;
      }
      if (event === 'SIGNED_OUT') {
        // Clear state on sign out
        if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: User signed out, clearing state');
        setChildren([]);
        setActiveChildId(null);
        setLoading(false);
        lastRequestRef.current = null;
        hasInitialLoad = true;
      }
    });

    // Check for existing session after setting up listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Initial session check', { hasUser: !!session?.user, hasInitialLoad });
      
      if (!hasInitialLoad) {
        if (session?.user) {
          if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Found existing session, loading');
          load();
        } else {
          // No session, clear state and stop loading
          if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: No session, clearing state');
          setChildren([]);
          setActiveChildId(null);
          setLoading(false);
        }
        hasInitialLoad = true;
      }
    });

    return () => {
      if (shouldLog()) DebugLogger.log('auth', 'useChildProfiles: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [load]);

  // Sync active child across components via CustomEvent
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent<{ id: string | null }>).detail;
        setActiveChildId(detail?.id ?? null);
      } catch {}
    };
    window.addEventListener('active-child-changed', handler as EventListener);
    return () => {
      window.removeEventListener('active-child-changed', handler as EventListener);
    };
  }, []);

  const setActiveChild = useCallback(async (childId: string | null) => {
    setError(null);
    try {
      // Validate UUID if not null
      if (childId !== null && childId !== undefined) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(childId)) {
          throw new Error('Invalid child profile ID format');
        }
        // Ensure selected child exists in current list (prevents bad pointers)
        if (!children.some((c) => c.id === childId)) {
          throw new Error('Selected child not found');
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      // Check if preferences row exists for this user
      const { data: existing, error: fetchErr } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      if (existing?.id) {
        const { error } = await supabase
          .from('user_preferences')
          .update({ active_child_id: childId })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const insertPayload: TablesInsert<'user_preferences'> = {
          user_id: user.id,
          active_child_id: childId,
        } as any;
        const { error } = await supabase
          .from('user_preferences')
          .insert(insertPayload);
        if (error) throw error;
      }

      setActiveChildId(childId);
      
      // Clear cache to ensure fresh data on next load
      lastRequestRef.current = null;
      
      window.dispatchEvent(new CustomEvent('active-child-changed', { detail: { id: childId } }));
    } catch (e: any) {
      DebugLogger.error('auth', 'setActiveChild error', e);
      setError(e?.message || 'Could not set active child');
      throw e;
    }
  }, [children]);

  const MAX_CHILD_PROFILES = 40;

  const addChild = useCallback(async (input: NewChildInput) => {
    setError(null);
    try {
      if (children.length >= MAX_CHILD_PROFILES) {
        throw new Error(`Maximum of ${MAX_CHILD_PROFILES} child profiles allowed per account`);
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const payload: TablesInsert<'child_profiles'> = {
        parent_user_id: user.id,
        display_name: input.display_name,
        birth_month: input.birth_month ?? null,
        birth_year: input.birth_year ?? null,
        grade_level: input.grade_level ?? null,
        avatar: (input.avatar as any) ?? null,
        favorite_color: input.favorite_color ?? null,
        favorite_animal: input.favorite_animal ?? null,
        favorite_food: input.favorite_food ?? null,
        hobbies: input.hobbies ?? null,
      } as any;
      const { data, error } = await supabase
        .from('child_profiles')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;
      setChildren((prev) => [...prev, data as ChildProfile]);
      
      // Clear cache to ensure fresh data on next load
      lastRequestRef.current = null;
      
      return data as ChildProfile;
    } catch (e: any) {
      DebugLogger.error('auth', 'addChild error', e);
      setError(e?.message || 'Could not add child');
      throw e;
    }
  }, []);

  const updateChild = useCallback(async (id: string, input: Partial<NewChildInput>) => {
    setError(null);
    try {
      // Ensure session is fresh before database operation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        DebugLogger.log('auth', 'Session expired or invalid, attempting refresh');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw new Error('Session expired. Please refresh the page and try again.');
        }
        // Verify session after refresh
        const { data: { session: newSession } } = await supabase.auth.getSession();
        if (!newSession) {
          throw new Error('Authentication failed. Please refresh the page and try again.');
        }
      }

      const patch: TablesUpdate<'child_profiles'> = {
        display_name: input.display_name,
        birth_month: input.birth_month ?? undefined,
        birth_year: input.birth_year ?? undefined,
        grade_level: input.grade_level,
        avatar: input.avatar as any,
        favorite_color: input.favorite_color ?? undefined,
        favorite_animal: input.favorite_animal ?? undefined,
        favorite_food: input.favorite_food ?? undefined,
        hobbies: input.hobbies ?? undefined,
      } as any;
      const { data, error } = await supabase
        .from('child_profiles')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      setChildren((prev) => prev.map((c) => (c.id === id ? (data as ChildProfile) : c)));
      
      // Clear cache to ensure fresh data on next load
      lastRequestRef.current = null;
      
      return data as ChildProfile;
    } catch (e: any) {
      DebugLogger.error('auth', 'updateChild error', e);
      setError(e?.message || 'Could not update child');
      throw e;
    }
  }, []);

  const deleteChild = useCallback(async (id: string) => {
    setError(null);
    try {
      const { error } = await supabase
        .from('child_profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setChildren((prev) => prev.filter((c) => c.id !== id));
      setActiveChildId((prev) => (prev === id ? null : prev));
      
      // Clear cache to ensure fresh data on next load
      lastRequestRef.current = null;
      
    } catch (e: any) {
      DebugLogger.error('auth', 'deleteChild error', e);
      setError(e?.message || 'Could not delete child');
      throw e;
    }
  }, []);

  const activeChild = useMemo(() => children.find((c) => c.id === activeChildId) || null, [children, activeChildId]);

  return {
    children,
    activeChildId,
    activeChild,
    loading,
    error,
    refresh: load,
    setActiveChild,
    addChild,
    updateChild,
    deleteChild,
  };
}