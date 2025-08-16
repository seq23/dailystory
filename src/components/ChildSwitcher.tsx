import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useTranslation } from "react-i18next";

interface ChildSwitcherProps {
  className?: string;
}

export function ChildSwitcher({ className }: ChildSwitcherProps) {
  const { children, activeChildId, setActiveChild, loading, error } = useChildProfiles();
  const { toast } = useToast();
  const { t } = useTranslation();

  const onChange = async (value: string) => {
    try {
      await setActiveChild(value === "default" ? null : (value || null));
      toast({ title: t('parent.children.updated') });
    } catch (e: any) {
      toast({ title: e?.message || t('parent.manager.toasts.failedSave'), variant: "destructive" });
    }
  };

  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium">{t('parent.children.activeLabel')}</Label>
      <Select value={activeChildId ?? "default"} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? t('parent.children.loading') : (children.length ? t('parent.children.selectChild') : t('parent.children.noChildren'))} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default (Account Holder)</SelectItem>
          {children.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.display_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="mt-2 text-xs text-muted-foreground">{error}</p> : null}
    </div>
  );
}
