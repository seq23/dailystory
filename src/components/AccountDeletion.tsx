import { uiText, useUiLanguage } from "@/i18n/uiText";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DebugLogger } from "@/services/DebugLogger";

interface AccountDeletionProps {
  userEmail?: string;
}

export const AccountDeletion = ({ userEmail }: AccountDeletionProps) => {
  useUiLanguage();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const CONFIRM_PHRASE = "DELETE";
  const isConfirmValid = confirmText.toUpperCase() === CONFIRM_PHRASE;

  const handleDeleteAccount = async () => {
    if (!isConfirmValid) return;

    setIsDeleting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error(uiText("You must be logged in to delete your account"));
        return;
      }

      // Call the delete-user-account edge function
      const { data, error } = await supabase.functions.invoke("delete-user-account", {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        DebugLogger.error("auth", "Account deletion failed", error);
        toast.error(error.message || "Failed to delete account. Please try again.");
        return;
      }

      if (data?.success) {
        toast.success(uiText("Your account has been deleted. You will be signed out."));
        // Sign out the user
        await supabase.auth.signOut();
        // Redirect to home page
        window.location.href = "/";
      } else {
        toast.error(data?.error || "Failed to delete account. Please try again.");
      }
    } catch (err) {
      DebugLogger.error("auth", "Account deletion error", err);
      toast.error(uiText("An unexpected error occurred. Please try again."));
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
      setConfirmText("");
    }
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="w-5 h-5" />
          {uiText("Delete Account")}
        </CardTitle>
        <CardDescription>
          {uiText("Permanently delete your account and all associated data")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{uiText("Warning:")}</strong> {uiText("This action cannot be undone. All your data will be permanently deleted, including:")}
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              <li>{uiText("Your profile and preferences")}</li>
              <li>{uiText("All child profiles")}</li>
              <li>{uiText("Saved stories and reading progress")}</li>
              <li>{uiText("Quiz and game history")}</li>
              <li>{uiText("Subscription information")}</li>
            </ul>
          </AlertDescription>
        </Alert>

        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="w-4 h-4 mr-2" />
              {uiText("Delete My Account")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                {uiText("Confirm Account Deletion")}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  {uiText("You are about to permanently delete your account")}
                  {userEmail && (
                    <span className="font-medium"> ({userEmail})</span>
                  )}
                  {uiText(". This action cannot be reversed.")}
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-delete">
                    {uiText("Type")} <strong>{CONFIRM_PHRASE}</strong> {uiText("to confirm:")}
                  </Label>
                  <Input
                    id="confirm-delete"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={CONFIRM_PHRASE}
                    className="font-mono"
                    disabled={isDeleting}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>{uiText("Cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteAccount();
                }}
                disabled={!isConfirmValid || isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uiText("Deleting...")}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {uiText("Delete Forever")}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-xs text-muted-foreground">
          {uiText("If you have an active subscription, please cancel it before deleting your account. Need help?")}{" "}
          <a href="mailto:hello@time-2-read.com" className="text-primary hover:underline">
            {uiText("Contact us")}
          </a>
        </p>
      </CardContent>
    </Card>
  );
};

export default AccountDeletion;
