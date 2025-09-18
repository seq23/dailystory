/**
 * LEAN DIALOG ACCESSIBILITY FIX
 * Fixes DialogContent accessibility errors permanently
 * Wraps common dialog components with proper titles
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface LeanDialogProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  hideTitle?: boolean;
  hideDescription?: boolean;
  className?: string;
  [key: string]: any;
}

export const LeanDialogContent: React.FC<LeanDialogProps> = ({ 
  children, 
  title, 
  description,
  hideTitle = false,
  hideDescription = false,
  className,
  ...props 
}) => {
  const dialogTitle = title || "Dialog";
  const dialogDescription = description || "Dialog content";

  return (
    <DialogContent className={className} {...props}>
      <DialogHeader>
        {hideTitle ? (
          <VisuallyHidden>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </VisuallyHidden>
        ) : (
          <DialogTitle>{dialogTitle}</DialogTitle>
        )}
        {hideDescription ? (
          <VisuallyHidden>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </VisuallyHidden>
        ) : description ? (
          <DialogDescription>{dialogDescription}</DialogDescription>
        ) : (
          <VisuallyHidden>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </VisuallyHidden>
        )}
      </DialogHeader>
      {children}
    </DialogContent>
  );
};