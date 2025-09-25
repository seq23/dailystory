import { useState, useCallback } from 'react';
import type { UserInfo } from '@/types';
import { DifficultyLevelMapper } from '@/services/DifficultyLevelMapper';

export interface DifficultyManagementState {
  currentDifficulty: string;
  isChangingDifficulty: boolean;
  changeDirection: 'increase' | 'decrease' | 'badge' | undefined;
  expertGradeLevel: "6th" | "7th" | "8th" | "9th" | "10th";
  lockDifficulty: boolean;
  minDifficulty: string;
  minExpertGrade: "6th" | "7th" | "8th" | "9th" | "10th";
  allowDecreaseBelowMin: boolean;
}

export interface DifficultyManagementActions {
  setCurrentDifficulty: React.Dispatch<React.SetStateAction<string>>;
  setIsChangingDifficulty: React.Dispatch<React.SetStateAction<boolean>>;
  setChangeDirection: React.Dispatch<React.SetStateAction<'increase' | 'decrease' | 'badge' | undefined>>;
  setExpertGradeLevel: React.Dispatch<React.SetStateAction<"6th" | "7th" | "8th" | "9th" | "10th">>;
  setLockDifficulty: React.Dispatch<React.SetStateAction<boolean>>;
  setMinDifficulty: React.Dispatch<React.SetStateAction<string>>;
  setMinExpertGrade: React.Dispatch<React.SetStateAction<"6th" | "7th" | "8th" | "9th" | "10th">>;
  setAllowDecreaseBelowMin: React.Dispatch<React.SetStateAction<boolean>>;
  resetDifficultyToInitial: () => void;
}

interface UseDifficultyManagementProps {
  userInfo: UserInfo;
}

export const useDifficultyManagement = ({ userInfo }: UseDifficultyManagementProps) => {
  // ERROR-016 FIX: Defensive initialization with comprehensive validation
  const safeUserInfo = userInfo || ({} as UserInfo);
  const validGradeLevels: ("6th" | "7th" | "8th" | "9th" | "10th")[] = ["6th", "7th", "8th", "9th", "10th"];

  // Validate and default expert grade level
  const safeExpertGradeLevel =
    validGradeLevels.includes(safeUserInfo.expertGradeLevel as any)
      ? (safeUserInfo.expertGradeLevel || "6th")
      : "6th";
  
  // Normalize difficulty for consistent UI initialization
  const normalizedBackend = DifficultyLevelMapper.normalizeLevel((safeUserInfo.difficultyLevel as any) || "easy");
  const initialFrontend = DifficultyLevelMapper.toFrontend(normalizedBackend);

  const [currentDifficulty, setCurrentDifficulty] = useState<string>(initialFrontend);
  const [isChangingDifficulty, setIsChangingDifficulty] = useState(false);
  const [changeDirection, setChangeDirection] = useState<'increase' | 'decrease' | 'badge' | undefined>();
  const [expertGradeLevel, setExpertGradeLevel] = useState<"6th" | "7th" | "8th" | "9th" | "10th">(safeExpertGradeLevel);
  const [lockDifficulty, setLockDifficulty] = useState(false);
  const [minDifficulty, setMinDifficulty] = useState<string>('beginner');
  const [minExpertGrade, setMinExpertGrade] = useState<"6th" | "7th" | "8th" | "9th" | "10th">("6th");
  const [allowDecreaseBelowMin, setAllowDecreaseBelowMin] = useState(false);

  const resetDifficultyToInitial = useCallback(() => {
    // ERROR-016 FIX: Use the same defensive validation in reset
    setCurrentDifficulty(initialFrontend);
    setExpertGradeLevel(safeExpertGradeLevel);
    setIsChangingDifficulty(false);
    setChangeDirection(undefined);
  }, [initialFrontend, safeExpertGradeLevel]);

  const state: DifficultyManagementState = {
    currentDifficulty,
    isChangingDifficulty,
    changeDirection,
    expertGradeLevel,
    lockDifficulty,
    minDifficulty,
    minExpertGrade,
    allowDecreaseBelowMin,
  };

  const actions: DifficultyManagementActions = {
    setCurrentDifficulty,
    setIsChangingDifficulty,
    setChangeDirection,
    setExpertGradeLevel,
    setLockDifficulty,
    setMinDifficulty,
    setMinExpertGrade,
    setAllowDecreaseBelowMin,
    resetDifficultyToInitial,
  };

  return { state, actions };
};