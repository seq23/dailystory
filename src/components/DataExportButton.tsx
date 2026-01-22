import { useState } from "react";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function DataExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Please sign in to export your data");
        return;
      }

      const { data, error } = await supabase.functions.invoke("export-user-data", {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `time2read-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      toast.success("Your data has been exported successfully!");

      // Reset the complete state after 3 seconds
      setTimeout(() => setExportComplete(false), 3000);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : exportComplete ? (
        <>
          <CheckCircle className="w-4 h-4 text-[hsl(var(--green))]" />
          Downloaded!
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download My Data
        </>
      )}
    </Button>
  );
}
