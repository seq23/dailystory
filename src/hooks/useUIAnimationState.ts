import { useState, useRef } from 'react';

export interface UIAnimationState {
  justAdvanced: boolean;
  showManualCelebration: boolean;
  showEndStoryModal: boolean;
  showConfirmEndStory: boolean;
  showEndSessionConfirm: boolean;
  showCoach: boolean;
  showSpecialRequestDialog: boolean;
  finishCTAExpanded: boolean;
  isRewriteMode: boolean;
  isMagicWandAnimating: boolean;
  wandPulse: boolean;
  finishSparkle: boolean;
  finishPressBurst: boolean;
  finishFlashCycle: boolean;
  showEndingBurst: boolean;
  forceLoaderActive: boolean;
  isTimerVisible: boolean;
  highlightSave: boolean;
  isSaving: boolean;
}

export interface UIAnimationActions {
  setJustAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
  setShowManualCelebration: React.Dispatch<React.SetStateAction<boolean>>;
  setShowEndStoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowConfirmEndStory: React.Dispatch<React.SetStateAction<boolean>>;
  setShowEndSessionConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCoach: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSpecialRequestDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setFinishCTAExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRewriteMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMagicWandAnimating: React.Dispatch<React.SetStateAction<boolean>>;
  setWandPulse: React.Dispatch<React.SetStateAction<boolean>>;
  setFinishSparkle: React.Dispatch<React.SetStateAction<boolean>>;
  setFinishPressBurst: React.Dispatch<React.SetStateAction<boolean>>;
  setFinishFlashCycle: React.Dispatch<React.SetStateAction<boolean>>;
  setShowEndingBurst: React.Dispatch<React.SetStateAction<boolean>>;
  setForceLoaderActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTimerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setHighlightSave: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UIAnimationRefs {
  loaderStartRef: React.MutableRefObject<number>;
  finishExpandedOnPageRef: React.MutableRefObject<number | null>;
}

export const useUIAnimationState = () => {
  const [justAdvanced, setJustAdvanced] = useState(false);
  const [showManualCelebration, setShowManualCelebration] = useState(false);
  const [showEndStoryModal, setShowEndStoryModal] = useState(false);
  const [showConfirmEndStory, setShowConfirmEndStory] = useState(false);
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [showSpecialRequestDialog, setShowSpecialRequestDialog] = useState(false);
  const [finishCTAExpanded, setFinishCTAExpanded] = useState(false);
  const [isRewriteMode, setIsRewriteMode] = useState(false);
  const [isMagicWandAnimating, setIsMagicWandAnimating] = useState(false);
  const [wandPulse, setWandPulse] = useState(false);
  const [finishSparkle, setFinishSparkle] = useState(false);
  const [finishPressBurst, setFinishPressBurst] = useState(false);
  const [finishFlashCycle, setFinishFlashCycle] = useState(false);
  const [showEndingBurst, setShowEndingBurst] = useState(false);
  const [forceLoaderActive, setForceLoaderActive] = useState(false);
  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [highlightSave, setHighlightSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for UI timing and state tracking
  const loaderStartRef = useRef<number>(0);
  const finishExpandedOnPageRef = useRef<number | null>(null);

  const state: UIAnimationState = {
    justAdvanced,
    showManualCelebration,
    showEndStoryModal,
    showConfirmEndStory,
    showEndSessionConfirm,
    showCoach,
    showSpecialRequestDialog,
    finishCTAExpanded,
    isRewriteMode,
    isMagicWandAnimating,
    wandPulse,
    finishSparkle,
    finishPressBurst,
    finishFlashCycle,
    showEndingBurst,
    forceLoaderActive,
    isTimerVisible,
    highlightSave,
    isSaving,
  };

  const actions: UIAnimationActions = {
    setJustAdvanced,
    setShowManualCelebration,
    setShowEndStoryModal,
    setShowConfirmEndStory,
    setShowEndSessionConfirm,
    setShowCoach,
    setShowSpecialRequestDialog,
    setFinishCTAExpanded,
    setIsRewriteMode,
    setIsMagicWandAnimating,
    setWandPulse,
    setFinishSparkle,
    setFinishPressBurst,
    setFinishFlashCycle,
    setShowEndingBurst,
    setForceLoaderActive,
    setIsTimerVisible,
    setHighlightSave,
    setIsSaving,
  };

  const refs: UIAnimationRefs = {
    loaderStartRef,
    finishExpandedOnPageRef,
  };

  return { state, actions, refs };
};