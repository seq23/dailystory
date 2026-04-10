# 🧠 AI-Powered Comprehension Quizzes

## Overview

Quizzes are a **premium-only** feature. When a premium user finishes a story, they can take a comprehension quiz with AI-generated questions that are specific to the story they just read.

## Architecture

### Edge Function: `generate-quiz`
- **Location:** `supabase/functions/generate-quiz/index.ts`
- **Model:** Google Gemini 3 Flash (via Lovable AI Gateway)
- **Auth:** Uses `LOVABLE_API_KEY` (auto-provisioned)
- **Method:** Structured output via tool calling (not raw JSON)

### Flow
1. User clicks "Start Quiz" on the session-ended screen
2. `ComprehensionQuiz.tsx` or `VoiceQuiz.tsx` calls the `generate-quiz` edge function
3. Edge function sends story text + user age + difficulty to AI
4. AI returns 3-5 story-specific questions with answers, distractors, and explanations
5. Questions are cached in `sessionStorage` by story hash (retry = no re-call)
6. Quiz results are persisted via `saveQuizAttempt` to Supabase

### Question Types
- Character identification (from actual story characters)
- Plot comprehension (real events from the story)
- Setting/detail recall
- Character emotions (AI reads tone/context)
- Cause/effect reasoning

### Cost
- ~500 tokens per quiz call
- Cached per story hash — retries are free
- Only generated when quiz modal opens (lazy)

## Access Control

| User Type | Quiz Access |
|-----------|------------|
| Guest     | ❌ No — quiz buttons hidden |
| Premium   | ✅ Yes — AI-generated questions |

Quiz buttons are gated in `src/pages/SessionEnded.tsx` behind `userIsPremium`.

## Files

| File | Role |
|------|------|
| `supabase/functions/generate-quiz/index.ts` | Edge function — calls Lovable AI |
| `src/components/ComprehensionQuiz.tsx` | Text-based quiz UI |
| `src/components/VoiceQuiz.tsx` | Voice-based quiz UI (uses Buddy) |
| `src/pages/SessionEnded.tsx` | Renders quiz buttons (premium-gated) |

## Error Handling

- If AI call fails → shows error UI with "Try Again" button
- Rate limit (429) → "Rate limited, please try again shortly"
- Credits exhausted (402) → "AI credits exhausted"
- No questions returned → shows error with retry option

*Last updated: April 2026*
