// Children are profiles inside the grown-up's account. ONE shared store for every
// component (header, switcher, children list, story form): before, each component
// kept its own copy, so a child added in one place did not show in the header and
// the dashboard carried a "try refreshing the page" warning.
//
// The reader is always a real child: when none is chosen, the first child is.
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { LeanErrorService } from "@/utils/LeanErrorService";
import { DebugLogger } from "@/services/DebugLogger";
import { normalizeGrade } from "@/lib/grades";

export type ChildProfile = Tables<"child_profiles">;

export interface NewChildInput {
  display_name: string;
  birth_month?: number | null;
  birth_year?: number | null;
  grade_level?: string | null;
  /** "Reads at": the grade the story words are written at (Pre-K–10th). Starts at the school grade. */
  reading_grade?: string | null;
  avatar?: Record<string, any> | null;
  favorite_color?: string | null;
  favorite_animal?: string | null;
  favorite_food?: string | null;
  hobbies?: string | null;
}

interface StoreState {
  children: ChildProfile[];
  activeChildId: string | null;
  /** The child being switched to while the choice is saved; null when no switch is pending. */
  switchingToId: string | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
}

export const MAX_CHILD_PROFILES = 40;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let state: StoreState = { children: [], activeChildId: null, switchingToId: null, loading: true, error: null, userId: null };
/**
 * Bumped on every switch. A load that started before the latest switch must not put the
 * old stored child back (27 Oct 2026, live: "Story for:" reverted to the previous child).
 */
let activeVersion = 0;
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;
let authWired = false;

function set(patch: Partial<StoreState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

/** The child who is reading: the chosen one, else the first child, else nobody. */
export function effectiveActiveChild(children: ChildProfile[], activeChildId: string | null): ChildProfile | null {
  return children.find((c) => c.id === activeChildId) ?? children[0] ?? null;
}

async function persistActive(userId: string, childId: string | null) {
  // One atomic upsert on user_id (the table's unique key): a select-then-insert raced
  // the default-preferences insert at sign-in and hit user_preferences_user_id_key.
  // Only active_child_id is sent, so the rest of an existing row is kept.
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, active_child_id: childId } as TablesInsert<"user_preferences">, { onConflict: "user_id" });
  if (error) throw error;
}

async function load(force = false): Promise<void> {
  if (inflight && !force) return inflight;
  // Read before any await: a switch made while this load waits must win.
  const versionAtStart = activeVersion;
  inflight = (async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        set({ children: [], activeChildId: null, switchingToId: null, loading: false, error: null, userId: null });
        return;
      }
      if (state.userId !== user.id) set({ loading: true, userId: user.id });
      const [{ data: prefs }, { data: kids, error: kidsErr }] = await Promise.all([
        supabase.from("user_preferences").select("active_child_id").eq("user_id", user.id).maybeSingle(),
        supabase.from("child_profiles").select("*").eq("parent_user_id", user.id).order("created_at", { ascending: true }),
      ]);
      if (kidsErr) throw kidsErr;
      const children = (kids || []) as ChildProfile[];
      const stored = ((prefs as { active_child_id?: string | null } | null)?.active_child_id ?? null) as string | null;
      // A switch made while this load was in flight wins over what the database said.
      const switchedMeanwhile = activeVersion !== versionAtStart || state.switchingToId !== null;
      const effective = effectiveActiveChild(children, switchedMeanwhile ? state.activeChildId : stored);
      set({ children, activeChildId: effective?.id ?? null, loading: false, error: null });
      // Keep the saved pointer on a real child (it was null, or pointed at a deleted child).
      if (!switchedMeanwhile && effective && effective.id !== stored) {
        persistActive(user.id, effective.id).catch((e) => DebugLogger.warn("auth", "Could not save the active child", e));
      }
    } catch (e: any) {
      LeanErrorService.logError(e, "useChildProfiles");
      set({ loading: false, error: "We couldn't load your children just now. Please try again." });
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function wireAuth() {
  if (authWired) return;
  authWired = true;
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") set({ children: [], activeChildId: null, switchingToId: null, loading: false, error: null, userId: null });
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION") void load(true);
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => state;

/** Test hook: start from a clean store. */
export function __resetChildProfilesStore(next?: Partial<StoreState>) {
  state = { children: [], activeChildId: null, switchingToId: null, loading: true, error: null, userId: null, ...next };
  inflight = null;
  activeVersion = 0;
  listeners.forEach((l) => l());
}

export function useChildProfiles() {
  const s = useSyncExternalStore(subscribe, snapshot, snapshot);

  useEffect(() => {
    wireAuth();
    if (s.loading && !inflight) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requireUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Please sign in again.");
    return session.user;
  };

  const setActiveChild = useCallback(async (childId: string | null) => {
    if (childId !== null && (!UUID.test(childId) || !state.children.some((c) => c.id === childId))) {
      throw new Error("That child wasn't found. Please try again.");
    }
    // Switch on screen first, then save: the session check alone took seconds live, and
    // the name did not change until it was done (27 Oct 2026).
    const previous = state.activeChildId;
    const version = ++activeVersion;
    set({ activeChildId: childId, switchingToId: childId, error: null });
    try {
      const user = await requireUser();
      await persistActive(user.id, childId);
      window.dispatchEvent(new CustomEvent("active-child-changed", { detail: { id: childId } }));
    } catch (e) {
      if (version === activeVersion) set({ activeChildId: previous });
      DebugLogger.error("auth", "setActiveChild error", e);
      throw new Error("We couldn't switch just now. Please try again.");
    } finally {
      if (version === activeVersion) set({ switchingToId: null });
    }
  }, []);

  const addChild = useCallback(async (input: NewChildInput) => {
    if (state.children.length >= MAX_CHILD_PROFILES) {
      throw new Error(`You can add up to ${MAX_CHILD_PROFILES} children.`);
    }
    const user = await requireUser();
    const payload: TablesInsert<"child_profiles"> & { reading_grade?: string | null } = {
      parent_user_id: user.id,
      display_name: input.display_name,
      birth_month: input.birth_month ?? null,
      birth_year: input.birth_year ?? null,
      grade_level: input.grade_level ?? null,
      // Reads at starts at the school grade (owner, 26 Oct 2026).
      reading_grade: normalizeGrade(input.reading_grade) ?? normalizeGrade(input.grade_level) ?? null,
      avatar: (input.avatar as any) ?? null,
      favorite_color: input.favorite_color ?? null,
      favorite_animal: input.favorite_animal ?? null,
      favorite_food: input.favorite_food ?? null,
      hobbies: input.hobbies ?? null,
    };
    const { data, error } = await supabase.from("child_profiles").insert(payload as any).select("*").single();
    if (error || !data) {
      DebugLogger.error("auth", "addChild error", error);
      throw new Error("We couldn't save that child just now. Please try again.");
    }
    const child = data as ChildProfile;
    set({ children: [...state.children, child], activeChildId: child.id });
    // The child just added is the one reading now.
    persistActive(user.id, child.id).catch((e) => DebugLogger.warn("auth", "Could not save the active child", e));
    window.dispatchEvent(new CustomEvent("active-child-changed", { detail: { id: child.id } }));
    return child;
  }, []);

  const updateChild = useCallback(async (id: string, input: Partial<NewChildInput>) => {
    const patch: TablesUpdate<"child_profiles"> & { reading_grade?: string | null } = {
      display_name: input.display_name,
      birth_month: input.birth_month ?? undefined,
      birth_year: input.birth_year ?? undefined,
      grade_level: input.grade_level,
      ...(input.reading_grade !== undefined ? { reading_grade: normalizeGrade(input.reading_grade) } : {}),
      avatar: input.avatar as any,
      favorite_color: input.favorite_color ?? undefined,
      favorite_animal: input.favorite_animal ?? undefined,
      favorite_food: input.favorite_food ?? undefined,
      hobbies: input.hobbies ?? undefined,
    };
    const { data, error } = await supabase.from("child_profiles").update(patch as any).eq("id", id).select("*").single();
    if (error || !data) {
      DebugLogger.error("auth", "updateChild error", error);
      throw new Error("We couldn't save the changes just now. Please try again.");
    }
    set({ children: state.children.map((c) => (c.id === id ? (data as ChildProfile) : c)) });
    return data as ChildProfile;
  }, []);

  /** Keep the story page's reading level on the child (migration 20261026221000). */
  const setChildReadingGrade = useCallback(async (id: string, readingGrade: string | null) => {
    // The generated types predate reading_grade.
    const { data, error } = await supabase
      .from("child_profiles")
      .update({ reading_grade: readingGrade } as any)
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data) {
      DebugLogger.error("auth", "setChildReadingGrade error", error);
      throw new Error("We couldn't save the reading level just now.");
    }
    set({ children: state.children.map((c) => (c.id === id ? (data as ChildProfile) : c)) });
    return data as ChildProfile;
  }, []);

  const deleteChild = useCallback(async (id: string) => {
    const { error } = await supabase.from("child_profiles").delete().eq("id", id);
    if (error) {
      DebugLogger.error("auth", "deleteChild error", error);
      throw new Error("We couldn't remove that child just now. Please try again.");
    }
    const children = state.children.filter((c) => c.id !== id);
    const wasActive = state.activeChildId === id;
    const next = wasActive ? (children[0]?.id ?? null) : state.activeChildId;
    set({ children, activeChildId: next });
    if (wasActive && state.userId) persistActive(state.userId, next).catch(() => {});
  }, []);

  const activeChild = useMemo(() => effectiveActiveChild(s.children, s.activeChildId), [s.children, s.activeChildId]);

  return {
    children: s.children,
    activeChildId: activeChild?.id ?? null,
    activeChild,
    loading: s.loading,
    /** True while a new reader is being saved (show "Switching…"). */
    switching: s.switchingToId !== null,
    switchingToId: s.switchingToId,
    error: s.error,
    refresh: () => load(true),
    setActiveChild,
    addChild,
    updateChild,
    setChildReadingGrade,
    deleteChild,
  };
}
