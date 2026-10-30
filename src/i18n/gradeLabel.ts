import i18n from './config';
import { gradeLabel, normalizeGrade } from '@/lib/grades';

/** Display only: the shared grade values and English generation prompts stay unchanged. */
export function uiGradeLabel(value: unknown): string {
  const grade = normalizeGrade(value);
  if (!grade) return '';
  const key = grade === 'PreK' ? 'preK' : grade === 'K' ? 'k' : gradeLabel(grade, 'short');
  return String(i18n.t(`formStep1.grade.${key}`));
}
