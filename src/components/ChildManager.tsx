import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useToast } from "@/hooks/use-toast";

const gradeOptions = ["Pre-K", "K", "1", "2", "3", "4", "5", "6", "7", "8"];
const langOptions = ["en", "es", "fr", "zh"];

export function ChildManager() {
  const { children, addChild, updateChild, deleteChild, refresh } = useChildProfiles();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", grade: "", lang: "en" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; grade: string; lang: string }>({ name: "", grade: "", lang: "en" });

  const isValid = useMemo(() => form.name.trim().length > 0, [form.name]);

  const handleAdd = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await addChild({ display_name: form.name.trim(), grade_level: form.grade || null, story_language_preference: form.lang });
      setForm({ name: "", grade: "", lang: "en" });
      toast({ title: "Child added" });
    } catch (e: any) {
      toast({ title: e?.message || "Failed to add child", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (id: string) => {
    const c = children.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setEditDraft({ name: c.display_name, grade: c.grade_level || "", lang: c.story_language_preference || "en" });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateChild(editingId, { display_name: editDraft.name.trim(), grade_level: editDraft.grade || null, story_language_preference: editDraft.lang });
      setEditingId(null);
      toast({ title: "Saved changes" });
    } catch (e: any) {
      toast({ title: e?.message || "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await deleteChild(id);
      toast({ title: "Deleted child" });
    } catch (e: any) {
      toast({ title: e?.message || "Failed to delete", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add a child</CardTitle>
          <CardDescription>Create a profile to personalize reading</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g., Sam" />
          </div>
          <div>
            <Label>Grade</Label>
            <Select value={form.grade} onValueChange={(v) => setForm((f) => ({ ...f, grade: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Language</Label>
            <Select value={form.lang} onValueChange={(v) => setForm((f) => ({ ...f, lang: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {langOptions.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button disabled={!isValid || saving} onClick={handleAdd}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage children</CardTitle>
          <CardDescription>Edit or remove profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {children.length === 0 ? (
            <p className="text-sm text-muted-foreground">No child profiles yet.</p>
          ) : (
            children.map((c) => (
              <div key={c.id} className="grid md:grid-cols-4 items-center gap-3 border rounded-md p-3">
                {editingId === c.id ? (
                  <>
                    <Input
                      value={editDraft.name}
                      onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Name"
                    />
                    <Select value={editDraft.grade} onValueChange={(v) => setEditDraft((d) => ({ ...d, grade: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={editDraft.lang} onValueChange={(v) => setEditDraft((d) => ({ ...d, lang: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {langOptions.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button disabled={saving} onClick={handleSaveEdit}>Save</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-medium">{c.display_name}</div>
                    <div className="text-sm text-muted-foreground">{c.grade_level || "—"}</div>
                    <div className="text-sm text-muted-foreground">{c.story_language_preference || "en"}</div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => startEdit(c.id)}>Edit</Button>
                      <Button variant="destructive" onClick={() => handleDelete(c.id)}>Delete</Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
