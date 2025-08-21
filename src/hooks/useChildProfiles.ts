import { useEffect, useCallback, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

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

export function useChildProfiles() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setChildren([]);
        setActiveChildId(null);
        return;
      }

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
      setChildren(kids || []);
      setActiveChildId((prefs as any)?.active_child_id ?? null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load child profiles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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
      window.dispatchEvent(new CustomEvent('active-child-changed', { detail: { id: childId } }));
    } catch (e: any) {
      setError(e?.message || 'Could not set active child');
      throw e;
    }
  }, []);

  const addChild = useCallback(async (input: NewChildInput) => {
    setError(null);
    try {
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
      return data as ChildProfile;
    } catch (e: any) {
      setError(e?.message || 'Could not add child');
      throw e;
    }
  }, []);

  const updateChild = useCallback(async (id: string, input: Partial<NewChildInput>) => {
    setError(null);
    try {
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
      return data as ChildProfile;
    } catch (e: any) {
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
    } catch (e: any) {
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
