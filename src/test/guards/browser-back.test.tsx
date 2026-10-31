import React, { useState, useRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useScreenHistory } from '@/hooks/useScreenHistory';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function Reader() {
  const [page, setPage] = useState(1);
  return <><p>The little comet — page {page}</p><button onClick={() => setPage(page + 1)}>Next page</button></>;
}
function Screens() {
  const [view, setView] = useScreenHistory<'home' | 'reading' | 'quiz'>('fixture', 'home');
  const [opened, setOpened] = useState(false);
  return <><p data-testid="view">{view}</p>
    <button onClick={() => { setOpened(true); setView('reading'); }}>Read</button>
    <button onClick={() => setView('quiz')}>Quiz</button>
    {opened && <div hidden={view !== 'reading'}><Reader /></div>}
  </>;
}
function NestedScreens() {
  const [app, setApp] = useScreenHistory<string>('app', 'home');
  const [story, setStory] = useScreenHistory<string>('story', 'library');
  const originalSetApp = useRef(setApp).current;
  return <><p data-testid="nested">{app}/{story}</p>
    <button onClick={() => setStory('reading')}>Open story</button>
    <button onClick={() => originalSetApp('settings')}>Open settings</button>
  </>;
}
afterEach(cleanup);
describe('phone native Back and Forward', () => {
  it('keeps nested reader state when a long-lived navigation callback opens another screen', () => {
    window.history.replaceState(null, '', '/');
    render(<BrowserRouter><NestedScreens /></BrowserRouter>);
    fireEvent.click(screen.getByText('Open story'));
    fireEvent.click(screen.getByText('Open settings'));
    expect(screen.getByTestId('nested')).toHaveTextContent('settings/reading');
  });
  it('pushes reading and quiz entries, returns through screens, and keeps the same story/page', async () => {
    window.history.replaceState(null, '', '/');
    render(<BrowserRouter><Screens /></BrowserRouter>);
    fireEvent.click(screen.getByText('Read'));
    fireEvent.click(screen.getByText('Next page'));
    expect(screen.getByText('The little comet — page 2')).toBeVisible();
    fireEvent.click(screen.getByText('Quiz'));
    expect(screen.getByTestId('view')).toHaveTextContent('quiz');
    window.history.back();
    await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent('reading'));
    expect(screen.getByText('The little comet — page 2')).toBeVisible();
    window.history.back();
    await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent('home'));
    window.history.forward();
    await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent('reading'));
    expect(screen.getByText('The little comet — page 2')).toBeVisible();
    window.history.forward();
    await waitFor(() => expect(screen.getByTestId('view')).toHaveTextContent('quiz'));
  });
  it('connects the actual app, nested reader and quiz to history while retaining the reading trees', () => {
    const read = (p: string) => readFileSync(join(__dirname, '../../..', p), 'utf8');
    const app = read('src/components/AuthenticatedApp.tsx');
    const stories = read('src/components/PremiumMyStoriesView.tsx');
    const ended = read('src/pages/SessionEnded.tsx');
    expect(app).toContain('useScreenHistory<AppView>("app", "stories")');
    expect(app).toContain('<div hidden={currentView !== "stories"}>');
    expect(app).toContain('<div hidden={currentView !== "reading"}');
    expect(app).toContain('navigate(`/session-ended?stats=');
    expect(app).not.toContain('window.location.href = `/session-ended');
    expect(stories).toContain("useScreenHistory<'library' | 'reading'>('stories', 'library')");
    expect(stories).toContain("<div hidden={currentView !== 'reading'}>");
    expect(ended).toContain("('activity', 'summary')");
    expect(ended).toContain('{isQuizAllowed && (');
    expect(read('src/App.tsx')).toContain('<RetainedReader reader={<Index />}><Routes>');
    expect(read('src/components/RetainedReader.tsx')).toContain("hidden={location.pathname !== '/'}");
    const reader = read('src/components/CleanStoryDisplay.tsx');
    expect(reader).toContain('if (!readerVisible)');
    expect(reader).toContain('if (readerVisible && isStoryStable');
    expect(reader).toContain('if (readerVisible && isTimerRunning');
    expect(reader).toContain('const isActivelyReading = readerVisible &&');
    expect(read('src/components/ComprehensionQuiz.tsx')).toContain('loadedStoryRef.current !== storyText');
  });
});
