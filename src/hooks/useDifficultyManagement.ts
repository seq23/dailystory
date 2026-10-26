import { useState, useCallback } from 'react';
import type { UserInfo } from '@/types';
import { DifficultyLevelMapper } from '@/services/DifficultyLevelMapper';
import { EXPERT_GRADES, type ExpertGrade, expertGradeForGrade, isExpertGrade } from '@/lib/grades';

export interface DifficultyManagementState {
  currentDifficulty: string;
  isChangingDifficulty: boolean;
  changeDirection: 'increase' | 'decrease' | 'badge' | undefined;
  expertGradeLevel: ExpertGrade;
  lockDifficulty: boolean;
  minDifficulty: string;
  minExpertGrade: ExpertGrade;
  allowDecreaseBelowMin: boolean;
}

export interface DifficultyManagementActions {
  setCurrentDifficulty: React.Dispatch<React.SetStateAction<string>>;
  setIsChangingDifficulty: React.Dispatch<React.SetStateAction<boolean>>;
  setChangeDirection: React.Dispatch<React.SetStateAction<'increase' | 'decrease' | 'badge' | undefined>>;
  setExpertGradeLevel: React.Dispatch<React.SetStateAction<ExpertGrade>>;
  setLockDifficulty: React.Dispatch<React.SetStateAction<boolean>>;
  setMinDifficulty: React.Dispatch<React.SetStateAction<string>>;
  setMinExpertGrade: React.Dispatch<React.SetStateAction<ExpertGrade>>;
  setAllowDecreaseBelowMin: React.Dispatch<React.SetStateAction<boolean>>;
  resetDifficultyToInitial: () => void;
}

interface UseDifficultyManagementProps {
  userInfo: UserInfo;
}

export const useDifficultyManagement = ({ userInfo }: UseDifficultyManagementProps) => {
  // ERROR-016 FIX: Defensive initialization with comprehensive validation
  const safeUserInfo = userInfo || ({} as UserInfo);
  // Validate and default expert grade level: the stored one, else the child's own
  // grade (7th–10th start at their grade, not clamped to 6th), else the first.
  const safeExpertGradeLevel: ExpertGrade =
    isExpertGrade(safeUserInfo.expertGradeLevel)
      ? safeUserInfo.expertGradeLevel
      : (expertGradeForGrade(safeUserInfo.grade ?? safeUserInfo.gradeLevel) ?? EXPERT_GRADES[0]);
  
  // Normalize difficulty for consistent UI initialization
  const normalizedBackend = DifficultyLevelMapper.normalizeLevel((safeUserInfo.difficultyLevel as any) || "easy");
  const initialFrontend = DifficultyLevelMapper.toFrontend(normalizedBackend);

  const [currentDifficulty, setCurrentDifficulty] = useState<string>(initialFrontend);
  const [isChangingDifficulty, setIsChangingDifficulty] = useState(false);
  const [changeDirection, setChangeDirection] = useState<'increase' | 'decrease' | 'badge' | undefined>();
  const [expertGradeLevel, setExpertGradeLevel] = useState<ExpertGrade>(safeExpertGradeLevel);
  const [lockDifficulty, setLockDifficulty] = useState(false);
  const [minDifficulty, setMinDifficulty] = useState<string>('beginner');
  const [minExpertGrade, setMinExpertGrade] = useState<ExpertGrade>(EXPERT_GRADES[0]);
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