import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Volume2, HelpCircle, Layers, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserInfo } from "@/types";

interface MobileTTSModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  onHearIt: () => void;
  onExplain: () => void;
  onSyllables: () => void;
  userInfo?: UserInfo;
  isPlaying?: boolean;
  isLoadingWordData?: boolean;
}

export const MobileTTSModal = ({
  isOpen,
  onClose,
  word,
  onHearIt,
  onExplain,
  onSyllables,
  userInfo,
  isPlaying = false,
  isLoadingWordData = false,
}: MobileTTSModalProps) => {
  const { t } = useTranslation();
  
  const cleanWord = word.replace(/[.,!?;:'"()]/g, '');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-modal-content w-[90vw] max-w-md mx-auto rounded-lg p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-center flex items-center justify-between">
            <span className="flex-1 text-center">"{cleanWord}"</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {/* Hear It Button */}
          <Button
            onClick={onHearIt}
            disabled={isPlaying || isLoadingWordData}
            className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Volume2 className="mr-3 h-5 w-5" />
            {isPlaying ? "Playing..." : "Hear It"}
          </Button>

          {/* Explain Button */}
          <Button
            onClick={onExplain}
            disabled={isPlaying || isLoadingWordData}
            className="w-full h-12 text-lg font-medium bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            size="lg"
            variant="secondary"
          >
            <HelpCircle className="mr-3 h-5 w-5" />
            {isLoadingWordData ? "Loading..." : "Explain"}
          </Button>

          {/* Syllables Button */}
          <Button
            onClick={onSyllables}
            disabled={isPlaying || isLoadingWordData}
            className="w-full h-12 text-lg font-medium bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
            variant="outline"
          >
            <Layers className="mr-3 h-5 w-5" />
            Break into Syllables
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};