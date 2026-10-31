import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { StoryChoices } from '@/components/story/StoryChoices';
import { useStoryLogic } from '@/hooks/useStoryLogic';
import { GRADES } from '@/lib/grades';
import { backupChoiceLead, normalizeStoryChoices, parseStoryChoices, safeStoryChoices, storyChoiceInstruction } from '../../../supabase/functions/_shared/storyChoices';
import { livePageProblem } from '../../../supabase/functions/_shared/livePage';

const { generateStory, invoke } = vi.hoisted(() => ({ generateStory: vi.fn(), invoke: vi.fn() }));
vi.mock('@/services/storyGenerationService', () => ({ StoryGenerationService: { generateStory } }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke }, auth: { getUser: vi.fn() } } }));
import { LiveGenerationService, type LiveGenerationContext } from '@/services/LiveGenerationService';

const PAGE = 'The little fox walks to a big tree. A bird sits on a low branch. The fox sees a blue door and a small red key.';
const OPTIONS = ['Open the door', 'Talk to the bird', 'Look at the key'];
const user = { name: 'Pip', age: 5, grade: 'K', readingGrade: 'K', difficultyLevel: 'pre-reader', avatar: { type: 'prefer-not-to-answer' } } as any;
const context = (page = 1): LiveGenerationContext => ({ userInfo: user, difficulty: 'pre-reader', storyContext: [PAGE], currentPage: page, totalExpectedPages: 999, characters: ['Pip'] });
const read = (p: string) => readFileSync(join(__dirname, '../../..', p), 'utf8');

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('three choices from the same page answer', () => {
  it('separates metadata before story validation, narration and page splitting', () => {
    const result = parseStoryChoices(`${PAGE}\n<choices>${JSON.stringify(OPTIONS)}</choices>`, 'K');
    expect(result).toEqual({ text: PAGE, choices: OPTIONS });
    expect(livePageProblem(result.text, 'stop', { minWords: 5 })).toBeNull();
  });

  it.each(['', '<choices>', '<choices>["Look"]</choices>', '<choices>not json</choices>',
    '<choices>{"a":"Look"}</choices>', '<choices>[null,2,{}]</choices>',
    '<choices>["Go","go!","Stay"]</choices>', '<choices>["", "Go", "Stay"]</choices>',
    '<choices>["Look", "Go", "Stay", "Wait"]</choices>', '<choices>["Look", "Go",'])('keeps the page and three safe options for malformed metadata: %s', (suffix) => {
    const result = parseStoryChoices(PAGE + suffix, 'K');
    expect(result.text).toBe(PAGE);
    expect(result.choices).toEqual(['Look around', 'Ask for help', 'Try a new way']);
  });

  it('uses the reading grade, including every supported grade, and rejects long/empty/markup options', () => {
    for (const grade of GRADES) {
      const options = normalizeStoryChoices(undefined, grade);
      expect(options).toHaveLength(3);
      expect(new Set(options).size).toBe(3);
      expect(options.every((s) => s.trim() && s.length <= 72)).toBe(true);
      expect(storyChoiceInstruction(grade)).toContain('<choices>');
    }
    expect(storyChoiceInstruction('PreK')).toContain('simple short words');
    expect(safeStoryChoices('10')).not.toEqual(safeStoryChoices('K'));
    for (const malformed of [null, ['<img>', 'Go', 'Stay'], ['x'.repeat(73), 'Go', 'Stay'],
      ['Investigate the mysterious archaeological excavation in the distance', 'Go', 'Stay']]) {
      expect(normalizeStoryChoices(malformed, 'K')).toEqual(safeStoryChoices('K'));
    }
  });

  it('the handler requests and returns choices only on ongoing Premium pages; the provider chain is retained', () => {
    const handler = read('supabase/functions/generate-adaptive-story/streamlined-handler.ts');
    expect(handler).toMatch(/if \(!config\.isEndingPage\) finalSystemPrompt \+= storyChoiceInstruction\(pageGrade\)/);
    expect(handler).toMatch(/const choices = config\.sessionType === 'premium' && !config\.isEndingPage \? generated\.choices : undefined/);
    expect(handler).toMatch(/: livePageProblem\(parseStoryChoices\(text, pageGrade\)\.text, finishReason/);
    expect(handler).toMatch(/Make this action happen on the next page/);
    expect(handler).toMatch(/pages: pages,[\s\S]{0,80}choices,/);
    expect(handler).toMatch(/choices: config\.sessionType === 'premium' && !config\.isEndingPage \? retryGenerated\.choices : undefined/);
    expect(handler).toContain('await chatCompletionWithFallback(apiBody, {');
    expect(read('src/services/storyGenerationService.ts')).toMatch(/selectedChoice: config\.selectedChoice/);
    expect(read('src/services/storyGenerationService.ts')).toMatch(/choices: data\.choices/);
    expect(read('.github/workflows/journey.yml')).toMatch(/playwright test e2e\/parent-journey\.spec\.ts e2e\/story-choices\.spec\.ts --project=chromium/);
  });
});

describe('live continuation, backups and Finish Story', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    generateStory.mockReset().mockResolvedValue({ success: true, pages: [PAGE], choices: OPTIONS });
    invoke.mockReset().mockResolvedValue({ data: { pages: [PAGE] }, error: null });
  });

  it('first page exposes its choices; a tapped choice reaches the next request once, beyond page six too', async () => {
    const first = await LiveGenerationService.generateFirstPage(user);
    expect(first.nextContext?.nextChoices).toEqual(OPTIONS);
    const next = await LiveGenerationService.generateNextPage(context(12), undefined, false, 'fixture-session', OPTIONS[1]);
    expect(generateStory.mock.calls[generateStory.mock.calls.length - 1]?.[1]).toMatchObject({ sessionType: 'premium', pageNumber: 13, selectedChoice: OPTIONS[1], existingStory: PAGE });
    expect(next.isComplete).toBe(false);
    expect(next.nextContext?.nextChoices).toEqual(OPTIONS);
    expect(generateStory).toHaveBeenCalledTimes(2);
  });

  it('malformed API choices still leave a page and exactly three usable actions', async () => {
    generateStory.mockResolvedValue({ success: true, pages: [PAGE], choices: ['', null] });
    const result = await LiveGenerationService.generateNextPage(context());
    expect(result.content).toBe(PAGE);
    expect(result.nextContext?.nextChoices).toEqual(safeStoryChoices('K'));
  });

  it('backup first and next pages have three fixed choices, and the selected action changes the backup', async () => {
    generateStory.mockResolvedValue({ success: false });
    const first = await LiveGenerationService.generateFirstPage(user);
    expect(first.choices).toEqual(safeStoryChoices('K'));
    for (const choice of safeStoryChoices('K')) {
      const next = await LiveGenerationService.generateNextPage(context(), undefined, false, 'fixture-session', choice);
      expect(next.content).toBe(backupChoiceLead(choice) + PAGE);
      expect(next.nextContext?.storyContext[next.nextContext.storyContext.length - 1]).toBe(next.content);
      expect(next.nextContext?.nextChoices).toEqual(safeStoryChoices('K'));
      expect(next.isComplete).toBe(false);
    }
    expect(new Set(safeStoryChoices('K').map(backupChoiceLead)).size).toBe(3);
  });

  it('Finish Story still requests an AI conclusion with context and level and returns no continuation or choices', async () => {
    const ending = 'The fox waves to the bird and walks home. The end.';
    generateStory.mockResolvedValue({ success: true, pages: [ending] });
    const result = await LiveGenerationService.generateEndingPage(context());
    expect(generateStory).toHaveBeenCalledTimes(1);
    expect(generateStory.mock.calls[0][1]).toMatchObject({ sessionType: 'premium', isEndingPage: true, existingStory: PAGE, difficulty: 'beginner' });
    expect(result).toMatchObject({ content: ending, isComplete: true });
    expect(result.nextContext).toBeUndefined();
    expect(result.choices).toBeUndefined();
  });
});

describe('tap targets and unchanged guest boundary', () => {
  it('renders three wrapping buttons and sends one selected action even on rapid taps', async () => {
    let done!: () => void;
    const onChoose = vi.fn(() => new Promise<void>((resolve) => { done = resolve; }));
    render(<StoryChoices choices={OPTIONS} grade="K" disabled={false} onChoose={onChoose} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveClass('min-h-14', 'whitespace-normal', 'w-full');
    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);
    expect(onChoose).toHaveBeenCalledExactlyOnceWith(OPTIONS[1]);
    expect(buttons.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    await act(async () => done());
    expect(buttons[0]).not.toBeDisabled();
  });

  it('malformed metadata renders safe buttons; blocked controls cannot submit', () => {
    const onChoose = vi.fn();
    render(<StoryChoices choices={null} grade="PreK" disabled onChoose={onChoose} />);
    for (const label of safeStoryChoices('PreK')) {
      const button = screen.getByRole('button', { name: label });
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(onChoose).not.toHaveBeenCalled();
  });

  it('guest display and navigation still stop at page six and show the next-story action', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useStoryLogic({ userInfo: user, isPremium: false, initialDifficulty: 'beginner' }));
    act(() => result.current.actions.setStory(Array.from({ length: 6 }, () => PAGE)));
    for (let i = 0; i < 8; i++) act(() => result.current.handlers.handleNext());
    expect(result.current.state.currentPage).toBe(5);
    const display = read('src/components/CleanStoryDisplay.tsx');
    expect(display).toContain('const displayedStory = !isPremium ? safeStory.slice(0, 6) : safeStory;');
    expect(display).toMatch(/isPremium && !isStoryComplete && liveContext && currentPage === displayedStory\.length - 1 && \(\s*<StoryChoices/);
    expect(display).toContain('Get the next story!');
    expect(display).toMatch(/onChoose=\{handleGenerateNextPageAndAdvance\}/);
    expect(display).toMatch(/generateNextPage\(contextAtLevel, vocabularyData, false, sessionId, selectedChoice\)/);
    expect(display).toContain('LiveGenerationService.generateEndingPage(liveContext)');
  });
});
