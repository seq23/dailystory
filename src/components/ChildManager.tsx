import { DebugLogger } from '@/services/DebugLogger';
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { AvatarType, SkinTone } from "@/types";
import { AvatarUtils } from "@/utils/avatarUtils";

// Proper interface for database child records
interface DatabaseChild {
  id: string;
  display_name: string;
  grade_level?: string | null;
  birth_month?: number | null;
  birth_year?: number | null;
  favorite_color?: string | null;
  favorite_animal?: string | null; 
  favorite_food?: string | null;
  hobbies?: string | null;
  avatar?: {
    type: AvatarType;
    skinTone: SkinTone;
  } | null;
}

const gradeOptions = ["Pre-K", "K", "1", "2", "3", "4", "5", "6", "7", "8"];
const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" }
];

export function ChildManager() {
  const { children, loading, addChild, updateChild, deleteChild, refresh } = useChildProfiles();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [form, setForm] = useState({ 
    name: "", 
    grade: "", 
    birthMonth: null as number | null, 
    birthYear: null as number | null,
    avatar: { type: "prefer-not-to-answer" as AvatarType, skinTone: "medium" as SkinTone },
    favoriteColor: "",
    favoriteAnimal: "",
    favoriteFood: "",
    hobbies: ""
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ 
    name: string; 
    grade: string; 
    birthMonth: number | null;
    birthYear: number | null;
    avatar: { type: AvatarType; skinTone: SkinTone };
    favoriteColor: string;
    favoriteAnimal: string;
    favoriteFood: string;
    hobbies: string;
  }>({ 
    name: "", 
    grade: "", 
    birthMonth: null,
    birthYear: null,
    avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
    favoriteColor: "",
    favoriteAnimal: "",
    favoriteFood: "",
    hobbies: ""
  });

  const isValid = useMemo(() => form.name.trim().length > 0, [form.name]);

  // Edit form validation
  const isEditValid = useMemo(() => 
    editingId ? editDraft.name.trim().length > 0 : false, 
    [editingId, editDraft.name]
  );

  // Edit form change detection
  // Type-safe helper to get child data
  // Type-safe helper to get child data
  const getTypedChild = (child: any): DatabaseChild => child as DatabaseChild;

  const hasEditChanges = useMemo(() => {
    if (!editingId) return false;
    const original = children.find(c => c.id === editingId);
    if (!original) return false;
    
    const typedOriginal = getTypedChild(original);
    
    return (
      editDraft.name.trim() !== typedOriginal.display_name ||
      editDraft.grade !== (typedOriginal.grade_level || "") ||
      editDraft.birthMonth !== (typedOriginal.birth_month || null) ||
      editDraft.birthYear !== (typedOriginal.birth_year || null) ||
      editDraft.favoriteColor !== (typedOriginal.favorite_color || "") ||
      editDraft.favoriteAnimal !== (typedOriginal.favorite_animal || "") ||
      editDraft.favoriteFood !== (typedOriginal.favorite_food || "") ||
      editDraft.hobbies !== (typedOriginal.hobbies || "") ||
      JSON.stringify(editDraft.avatar) !== JSON.stringify(typedOriginal.avatar || { type: "prefer-not-to-answer", skinTone: "medium" })
    );
  }, [editingId, editDraft, children]);

  const calculateAge = (birthYear: number | null): string => {
    if (!birthYear) return "—";
    const currentYear = new Date().getFullYear();
    return `${currentYear - birthYear} years old`;
  };

  const handleAdd = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await addChild({ 
        display_name: form.name.trim(), 
        grade_level: form.grade || null, 
        birth_month: form.birthMonth,
        birth_year: form.birthYear,
        avatar: form.avatar,
        favorite_color: form.favoriteColor || null,
        favorite_animal: form.favoriteAnimal || null,
        favorite_food: form.favoriteFood || null,
        hobbies: form.hobbies || null,
      });
      setForm({ 
        name: "", 
        grade: "", 
        birthMonth: null,
        birthYear: null,
        avatar: { type: "prefer-not-to-answer", skinTone: "medium" },
        favoriteColor: "",
        favoriteAnimal: "",
        favoriteFood: "",
        hobbies: ""
      });
      toast({ title: t('parent.manager.toasts.added') });
    } catch (e: any) {
      toast({ title: e?.message || t('parent.manager.toasts.failedAdd'), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (id: string) => {
    const c = children.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    const currentAvatar = c.avatar || { type: "prefer-not-to-answer", skinTone: "medium" };
    setEditDraft({ 
      name: c.display_name, 
      grade: c.grade_level || "", 
      birthMonth: (c as any).birth_month || null,
      birthYear: (c as any).birth_year || null,
      avatar: currentAvatar as { type: AvatarType; skinTone: SkinTone },
      favoriteColor: (c as any).favorite_color || "",
      favoriteAnimal: (c as any).favorite_animal || "",
      favoriteFood: (c as any).favorite_food || "",
      hobbies: (c as any).hobbies || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateChild(editingId, { 
        display_name: editDraft.name.trim(), 
        grade_level: editDraft.grade || null, 
        birth_month: editDraft.birthMonth,
        birth_year: editDraft.birthYear,
        avatar: editDraft.avatar,
        favorite_color: editDraft.favoriteColor || null,
        favorite_animal: editDraft.favoriteAnimal || null,
        favorite_food: editDraft.favoriteFood || null,
        hobbies: editDraft.hobbies || null,
      });
      
      // Success feedback and cleanup
      setEditingId(null);
      refresh(); // Refresh data to show updated state immediately
      toast({ 
        title: t('parent.manager.toasts.saved') || "Saved successfully!", 
        description: `${editDraft.name.trim()}'s profile has been updated.`
      });
      
    } catch (e: any) {
      DebugLogger.error('auth', 'Save edit error', e);
      const errorMessage = e?.message || t('parent.manager.toasts.failedSave');
      
      // Provide helpful feedback for common session issues
      if (errorMessage.includes('Session expired') || errorMessage.includes('Authentication failed')) {
        toast({ 
          title: "Connection Issue", 
          description: "Please refresh the page and try again.", 
          variant: "destructive" 
        });
      } else {
        toast({ title: errorMessage, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await deleteChild(id);
      toast({ title: t('parent.manager.toasts.deleted') });
    } catch (e: any) {
      toast({ title: e?.message || t('parent.manager.toasts.failedDelete'), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('parent.manager.addTitle')}</CardTitle>
          <CardDescription>{t('parent.manager.addDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="child-name">{t('parent.manager.labels.name')}</Label>
              <Input id="child-name" name="child-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g., Sam" />
            </div>
            <div>
              <Label>{t('parent.manager.labels.grade')}</Label>
              <Select value={form.grade} onValueChange={(v) => setForm((f) => ({ ...f, grade: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('parent.manager.labels.grade')} />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Birth Month</Label>
              <Select value={form.birthMonth?.toString() || ""} onValueChange={(v) => setForm((f) => ({ ...f, birthMonth: v ? parseInt(v) : null }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Birth Year</Label>
              <Input 
                type="number" 
                value={form.birthYear || ""} 
                onChange={(e) => setForm((f) => ({ ...f, birthYear: e.target.value ? parseInt(e.target.value) : null }))} 
                placeholder="e.g., 2015"
                min="2000"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Favorite Color (Optional)</Label>
              <Input value={form.favoriteColor} onChange={(e) => setForm((f) => ({ ...f, favoriteColor: e.target.value }))} placeholder="e.g., Blue" />
            </div>
            <div>
              <Label>Favorite Animal (Optional)</Label>
              <Input value={form.favoriteAnimal} onChange={(e) => setForm((f) => ({ ...f, favoriteAnimal: e.target.value }))} placeholder="e.g., Lion" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Favorite Food (Optional)</Label>
              <Input value={form.favoriteFood} onChange={(e) => setForm((f) => ({ ...f, favoriteFood: e.target.value }))} placeholder="e.g., Pizza" />
            </div>
            <div>
              <Label>Hobbies (Optional)</Label>
              <Input value={form.hobbies} onChange={(e) => setForm((f) => ({ ...f, hobbies: e.target.value }))} placeholder="e.g., Drawing, Soccer" />
            </div>
          </div>
          
          <AvatarPicker
            value={form.avatar}
            onChange={(avatar) => setForm((f) => ({ ...f, avatar }))}
          />
          
          <div className="flex justify-end">
            <Button disabled={!isValid || saving} onClick={handleAdd}>{t('parent.manager.actions.add')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('parent.manager.manageTitle')}</CardTitle>
          <CardDescription>{t('parent.manager.manageDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t('parent.manager.loading') || 'Loading children...'}</p>
          ) : children.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('parent.manager.empty')}</p>
          ) : (
            children.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  {editingId === c.id ? (
                     <div className="space-y-4">
                       <div className="grid md:grid-cols-4 gap-3">
                            <div>
                            <Label htmlFor="edit-child-name">Name</Label>
                            <Input
                              id="edit-child-name"
                              name="edit-child-name"
                              value={editDraft.name}
                              onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                              placeholder="Name"
                            />
                          </div>
                         <div>
                           <Label>Grade</Label>
                           <Select value={editDraft.grade} onValueChange={(v) => setEditDraft((d) => ({ ...d, grade: v }))}>
                             <SelectTrigger>
                               <SelectValue placeholder={t('parent.manager.labels.grade')} />
                             </SelectTrigger>
                             <SelectContent>
                               {gradeOptions.map((g) => (
                                 <SelectItem key={g} value={g}>{g}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                         <div>
                           <Label>Birth Month</Label>
                           <Select value={editDraft.birthMonth?.toString() || ""} onValueChange={(v) => setEditDraft((d) => ({ ...d, birthMonth: v ? parseInt(v) : null }))}>
                             <SelectTrigger>
                               <SelectValue placeholder="Select month" />
                             </SelectTrigger>
                             <SelectContent>
                               {monthOptions.map((m) => (
                                 <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                         <div>
                           <Label>Birth Year</Label>
                           <Input 
                             type="number" 
                             value={editDraft.birthYear || ""} 
                             onChange={(e) => setEditDraft((d) => ({ ...d, birthYear: e.target.value ? parseInt(e.target.value) : null }))} 
                             placeholder="e.g., 2015"
                             min="2000"
                             max={new Date().getFullYear()}
                           />
                         </div>
                       </div>
                       
                       <div className="grid md:grid-cols-2 gap-3">
                         <div>
                           <Label>Favorite Color</Label>
                           <Input value={editDraft.favoriteColor} onChange={(e) => setEditDraft((d) => ({ ...d, favoriteColor: e.target.value }))} placeholder="e.g., Blue" />
                         </div>
                         <div>
                           <Label>Favorite Animal</Label>
                           <Input value={editDraft.favoriteAnimal} onChange={(e) => setEditDraft((d) => ({ ...d, favoriteAnimal: e.target.value }))} placeholder="e.g., Lion" />
                         </div>
                       </div>
                       
                       <div className="grid md:grid-cols-2 gap-3">
                         <div>
                           <Label>Favorite Food</Label>
                           <Input value={editDraft.favoriteFood} onChange={(e) => setEditDraft((d) => ({ ...d, favoriteFood: e.target.value }))} placeholder="e.g., Pizza" />
                         </div>
                         <div>
                           <Label>Hobbies</Label>
                           <Input value={editDraft.hobbies} onChange={(e) => setEditDraft((d) => ({ ...d, hobbies: e.target.value }))} placeholder="e.g., Drawing, Soccer" />
                         </div>
                       </div>
                      
                      <AvatarPicker
                        value={editDraft.avatar}
                        onChange={(avatar) => setEditDraft((d) => ({ ...d, avatar }))}
                      />
                      
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setEditingId(null)}>{t('parent.manager.actions.cancel')}</Button>
                         <Button disabled={!isEditValid || !hasEditChanges || saving} onClick={handleSaveEdit}>
                           {saving ? "Saving..." : t('parent.manager.actions.save')}
                         </Button>
                      </div>
                    </div>
                   ) : (
                     <div className="grid md:grid-cols-4 items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border">
                             <img
                               src={AvatarUtils.getAvatarUrl(getTypedChild(c).avatar) || "/avatar-boy-medium.jpg"}
                               alt={`${c.display_name}'s avatar`}
                               className="w-full h-full object-cover"
                             />
                          </div>
                         <div>
                           <div className="font-medium">{c.display_name}</div>
                           <div className="text-xs text-muted-foreground">{calculateAge(getTypedChild(c).birth_year)}</div>
                         </div>
                       </div>
                       <div className="text-sm text-muted-foreground">{c.grade_level || "—"}</div>
                        <div className="text-sm text-muted-foreground">
                          {getTypedChild(c).favorite_color || getTypedChild(c).favorite_animal ? 
                            `${getTypedChild(c).favorite_color || ''}${getTypedChild(c).favorite_color && getTypedChild(c).favorite_animal ? ', ' : ''}${getTypedChild(c).favorite_animal || ''}` : 
                            "—"}
                        </div>
                       <div className="flex gap-2 justify-end">
                         <Button variant="outline" onClick={() => startEdit(c.id)}>{t('parent.manager.actions.edit')}</Button>
                         <Button variant="destructive" onClick={() => handleDelete(c.id)}>{t('parent.manager.actions.delete')}</Button>
                       </div>
                     </div>
                   )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
