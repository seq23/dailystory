import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  csvRosterAdapter,
  type RosterRow,
} from "../../supabase/functions/_shared/institutionRoster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [status, setStatus] = useState<Record<string, string>>({
    clever: "not_connected",
    classlink: "not_connected",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<"clever" | "classlink">("clever");
  const [providerClassId, setProviderClassId] = useState("");
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
            else setStatus(data);
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
            Clever:{" "}
            {status.clever === "configured"
              ? "Configured (not yet verified)"
              : "Not connected"}{" "}
            · ClassLink:{" "}
            {status.classlink === "configured"
              ? "Configured (not yet verified)"
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
                      provider,
                      providerClassId,
                    },
                  },
                );
                if (error)
                  throw new Error(
                    "Could not retrieve roster. Check the provider connection and class ID.",
                  );
                setRows(data.rows);
              });
            }}
          >
            <label>
              Provider
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as typeof provider)}
              >
                <option value="clever">Clever</option>
                <option value="classlink">ClassLink</option>
              </select>
            </label>
            <label>
              Provider class ID
              <Input
                required
                value={providerClassId}
                onChange={(e) => setProviderClassId(e.target.value)}
                maxLength={200}
              />
            </label>
            <Button disabled={busy || status[provider] !== "configured"}>
              Preview provider roster
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
          <div className="school-table">
            <table>
              <caption>Roster preview</caption>
              <thead>
                <tr>
                  <th>Roster ID</th>
                  <th>Display name</th>
                  <th>School grade</th>
                  <th>Reads at</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.external_id}>
                    <td>{r.external_id}</td>
                    <td>{r.display_name}</td>
                    <td>{r.school_grade ?? "Not recorded"}</td>
                    <td>{r.reading_grade ?? "Not recorded"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
