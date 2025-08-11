import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useChildProfiles } from "@/hooks/useChildProfiles";

interface ChildSwitcherProps {
  className?: string;
}

export function ChildSwitcher({ className }: ChildSwitcherProps) {
  const { children, activeChildId, setActiveChild, loading, error } = useChildProfiles();
  const { toast } = useToast();

  const onChange = async (value: string) => {
    try {
      await setActiveChild(value || null);
      toast({ title: "Active child updated" });
    } catch (e: any) {
      toast({ title: e?.message || "Failed to update", variant: "destructive" });
    }
  };

  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium">Active child</Label>
      <Select value={activeChildId ?? ""} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? "Loading..." : children.length ? "Select child" : "No children yet"} />
        </SelectTrigger>
        <SelectContent>
          {children.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.display_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="mt-2 text-xs text-muted-foreground">{error}</p> : null}
    </div>
  );
}
