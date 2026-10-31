import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EMPTY_WORKSPACE, type Workspace } from "./report";

// Institutional tables have their own DTOs until the deployed schema is regenerated.
export const institutionDb: SupabaseClient = supabase;
const tables = {
  schools: "institution_schools",
  members: "institution_members",
  classes: "institution_classes",
  students: "institution_students",
  enrollments: "institution_enrollments",
  readings: "institution_readings",
  assessments: "institution_assessments",
  scores: "institution_quiz_results",
} as const;

/** Fetch every page; reports must never silently stop at PostgREST's row cap. */
export async function loadWorkspace(db = institutionDb): Promise<Workspace> {
  const result = { ...EMPTY_WORKSPACE };
  await Promise.all(
    Object.entries(tables).map(async ([key, table]) => {
      const rows: unknown[] = [];
      const order =
        key === "members"
          ? ["school_id", "user_id"]
          : key === "enrollments"
            ? ["class_id", "student_id"]
            : key === "scores"
              ? ["assessment_id", "skill"]
              : ["id"];
      for (let offset = 0; ; offset += 500) {
        let query = db.from(table).select("*");
        for (const column of order) query = query.order(column);
        const { data, error } = await query.range(offset, offset + 499);
        if (error)
          throw new Error(
            "School records could not be loaded. Ask your administrator to check access and the institutions migration.",
          );
        rows.push(...(data ?? []));
        if ((data?.length ?? 0) < 500) break;
      }
      Object.assign(result, { [key]: rows });
    }),
  );
  return result;
}
export async function institutionRpc(
  name: string,
  args: Record<string, unknown>,
) {
  const { data, error } = await institutionDb.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}
