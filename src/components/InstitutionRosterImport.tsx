import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  csvRosterAdapter,
  type RosterRow,
} from "../../supabase/functions/_shared/institutionRoster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SchoolTable } from "@/components/SchoolTable";
import { institutionRpc } from "@/lib/institutions/api";

export function InstitutionRosterImport({
  schoolId,
  classId,
  admin,
  onSaved,
}: {
  schoolId: string;
  classId: string;
  admin: boolean;
  onSaved: () => Promise<void>;
}) {
  const [rows, setRows] = useState<RosterRow[]>([]);
  // "unknown" until the status check answers; never assumed connected.
  const [classlink, setClasslink] = useState<string>("unknown");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [providerClassId, setProviderClassId] = useState("");
  const [providerClasses, setProviderClasses] = useState<
    Array<{ id: string; name: string }>
  >([]);
  useEffect(() => {
    let active = true;
    if (admin)
      void supabase.functions
        .invoke("institution-roster", { body: { action: "status", schoolId } })
        .then(({ data, error }) => {
          if (active) {
            if (error)
              setError(
                "Roster connections could not be checked. CSV import is available.",
              );
            else setClasslink(data?.classlink === "configured" ? "configured" : "not_connected");
          }
        });
    return () => {
      active = false;
    };
  }, [schoolId, admin]);
  async function act(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Roster import failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details>
      <summary>Import a roster</summary>
      <p>
        CSV columns: external_id,display_name,school_grade,reading_grade. Only
        ID and display name are required. Use aliases where possible. Up to 1000
        children; imported grades are profile settings, not growth assessments.
      </p>
      <label>
        CSV roster
        <Input
          type="file"
          accept=".csv,text/csv"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setRows([]);
            if (file)
              void act(async () => {
                if (file.size > 1_000_000)
                  throw new Error("CSV must be at most 1 MB.");
                setRows(await csvRosterAdapter.read(await file.text()));
              });
          }}
        />
      </label>
      {admin && (
        <>
          <p>
            ClassLink:{" "}
            {classlink === "configured"
              ? "Configured (not yet verified)"
              : classlink === "unknown"
                ? "Checking…"
                : "Not connected"}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setRows([]);
              void act(async () => {
                const { data, error } = await supabase.functions.invoke(
                  "institution-roster",
                  {
                    body: {
                      action: "preview",
                      schoolId,
                      providerClassId,
                    },
                  },
                );
                if (error)
                  throw new Error(
                    "Could not retrieve the ClassLink roster. Try again later; CSV import still works.",
                  );
                setRows(data.rows);
              });
            }}
          >
            <Button
              type="button"
              variant="outline"
              disabled={busy || classlink !== "configured"}
              onClick={() =>
                void act(async () => {
                  setRows([]);
                  const { data, error } = await supabase.functions.invoke(
                    "institution-roster",
                    { body: { action: "classes", schoolId } },
                  );
                  if (error)
                    throw new Error(
                      "Could not list ClassLink classes. Try again later; CSV import still works.",
                    );
                  const classes = Array.isArray(data?.classes)
                    ? data.classes
                    : [];
                  if (!classes.length)
                    throw new Error(
                      "ClassLink lists no classes for this school yet.",
                    );
                  setProviderClasses(classes);
                  setProviderClassId(classes[0].id);
                })
              }
            >
              Find classes
            </Button>
            {!!providerClasses.length && (
              <label>
                ClassLink class
                <select
                  required
                  value={providerClassId}
                  onChange={(e) => setProviderClassId(e.target.value)}
                >
                  {providerClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Button
              disabled={
                busy ||
                classlink !== "configured" ||
                !providerClassId
              }
            >
              Preview ClassLink roster
            </Button>
          </form>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {!!rows.length && (
        <>
          <p>
            {rows.length} students ready for this class. Existing profiles stay
            unchanged; missing enrollments are added.
          </p>
          <SchoolTable
            caption="Roster preview"
            title="Roster ID"
            columns={["Display name", "School grade", "Reads at"]}
            rows={rows.map((r) => ({
              key: r.external_id,
              title: r.external_id,
              cells: [r.display_name, r.school_grade ?? "Not recorded", r.reading_grade ?? "Not recorded"],
            }))}
          />
          <Button
            disabled={busy}
            onClick={() =>
              void act(async () => {
                const count = await institutionRpc(
                  "institution_import_roster",
                  { p_class: classId, p_rows: rows },
                );
                setRows([]);
                await onSaved();
                setMessage(
                  `${count} enrollments added. No login accounts created.`,
                );
              })
            }
          >
            {busy ? "Importing…" : "Import into this class"}
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => setRows([])}>
            Cancel preview
          </Button>
        </>
      )}
    </details>
  );
}
