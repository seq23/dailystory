import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DialogAccessibilityFixProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function DialogAccessibilityFix({
  isOpen,
  onOpenChange,
  children,
  title = "Dialog",
  description,
  className
}: DialogAccessibilityFixProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={className} aria-describedby={description ? undefined : "dialog-description"}>
        {title ? (
          <DialogTitle>{title}</DialogTitle>
        ) : (
          <VisuallyHidden>
            <DialogTitle>Dialog</DialogTitle>
          </VisuallyHidden>
        )}
        
        {description ? (
          <DialogDescription>{description}</DialogDescription>
        ) : (
          <VisuallyHidden>
            <DialogDescription id="dialog-description">
              Dialog content
            </DialogDescription>
          </VisuallyHidden>
        )}
        
        {children}
      </DialogContent>
    </Dialog>
  );
}