import { SKILLS, type Skill } from "./report";
export function assessmentScores(
  form: FormData,
): Array<{ skill: Skill; correct: number; total: number }> {
  return SKILLS.flatMap((skill) => {
    const correct = String(form.get(`${skill}_correct`) ?? "").trim();
    const total = String(form.get(`${skill}_total`) ?? "").trim();
    if (!correct && !total) return [];
    if (!correct || !total)
      throw new Error(
        `Enter both correct answers and questions for ${skill}, or leave both empty.`,
      );
    const c = Number(correct);
    const t = Number(total);
    if (
      !Number.isInteger(c) ||
      !Number.isInteger(t) ||
      c < 0 ||
      t < 1 ||
      t > 1000 ||
      c > t
    )
      throw new Error(
        `Invalid ${skill} score. Correct answers must be between zero and the question count.`,
      );
    return [{ skill, correct: c, total: t }];
  });
}
