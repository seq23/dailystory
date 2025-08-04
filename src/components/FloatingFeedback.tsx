import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileTooltip } from "./MobileTooltip";
import { FeedbackForm } from "./FeedbackForm";

export function FloatingFeedback() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <MobileTooltip content={t("feedback.tooltip")} side="left">
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          size="icon"
          aria-label={t("feedback.tooltip")}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </MobileTooltip>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("feedback.title")}</DialogTitle>
          </DialogHeader>
          <FeedbackForm onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}