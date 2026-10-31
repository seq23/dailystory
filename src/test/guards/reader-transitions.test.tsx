import React, { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Link } from 'react-router-dom';

const fixtures = vi.hoisted(() => ({ user: { name: 'Comet Reader', age: 7, grade: '2', nativeLanguage: 'en', difficultyLevel: 'beginner' } }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getUser: async () => ({ data: { user: null } }) } } }));
vi.mock('@/hooks/useSecurityMonitoring', () => ({ useSecurityMonitoring() {} }));
vi.mock('@/hooks/useChildProfiles', () => ({ useChildProfiles: () => ({ activeChild: null }) }));
vi.mock('@/components/WelcomeHero', () => ({ WelcomeHero: ({ onGetStarted }: any) => <button onClick={onGetStarted}>Start fixture</button> }));
vi.mock('@/components/forms/MultiStepUserForm', () => ({ MultiStepUserForm: ({ onSubmit }: any) => <button onClick={() => onSubmit(fixtures.user)}>Read fixture</button> }));
vi.mock('@/components/SpecialRequestDialog', () => ({ SpecialRequestDialog: ({ open, onSubmit }: any) => open ? <button onClick={() => onSubmit('A comet adventure')}>Create fixture</button> : null }));
vi.mock('@/components/PremiumStoryLibrary', () => ({ PremiumStoryLibrary: ({ onLoadStory }: any) => <button onClick={() => onLoadStory({ id: 'story_fixture', segments: [{ text: 'The comet shines.' }] })}>Open saved fixture</button> }));
vi.mock('@/components/CleanStoryDisplay', () => ({ default: function Reader({ onNewStory, isActive }: any) {
  const [page, setPage] = useState(1);
  return <section data-active={String(isActive)}><p>Fixture page {page}</p><button onClick={() => setPage(page + 1)}>Advance fixture</button><button onClick={onNewStory}>New fixture</button></section>;
} }));
import { GuestExperience } from '@/components/GuestExperience';
import { PremiumMyStoriesView } from '@/components/PremiumMyStoriesView';

afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear(); });
it('the guest reader survives native Back/Forward, and a deliberate new request starts a fresh story', async () => {
  window.history.replaceState(null, '', '/');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  render(<BrowserRouter><GuestExperience /></BrowserRouter>);
  fireEvent.click(screen.getByText('Start fixture'));
  fireEvent.click(screen.getByText('Read fixture'));
  await screen.findByText('Fixture page 1');
  fireEvent.click(screen.getByText('Advance fixture'));
  window.history.back();
  await waitFor(() => expect(screen.getByText('Read fixture')).toBeVisible());
  expect(screen.getByText('Fixture page 2')).not.toBeVisible();
  window.history.forward();
  await waitFor(() => expect(screen.getByText('Fixture page 2')).toBeVisible());
  fireEvent.click(screen.getByText('New fixture'));
  fireEvent.click(screen.getByText('Read fixture'));
  expect(screen.getByText('Fixture page 1')).toBeVisible();
  expect(screen.queryByText('Fixture page 2')).toBeNull();
});
it('a retained guest app handles a new-story action link after its first mount', async () => {
  window.history.replaceState(null, '', '/');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  render(<BrowserRouter><Link to="/?action=new-story">Action fixture</Link><GuestExperience /></BrowserRouter>);
  fireEvent.click(screen.getByText('Action fixture'));
  await waitFor(() => expect(screen.getByText('Read fixture')).toBeVisible());
  expect(window.location.search).toBe('');
});
it('a new-story arrival opens the form in the already mounted premium library', async () => {
  window.history.replaceState(null, '', '/');
  const tree = (open: boolean) => <BrowserRouter><PremiumMyStoriesView userInfo={fixtures.user as never} isPremium isSubscriptionActive onSessionEnded={() => {}} openNewStoryOnArrival={open} /></BrowserRouter>;
  const result = render(tree(false));
  fireEvent.click(screen.getByText('Open saved fixture'));
  await screen.findByText('Fixture page 1');
  fireEvent.click(screen.getByText('Advance fixture'));
  result.rerender(tree(true));
  expect(screen.getByText('Create fixture')).toBeInTheDocument();
  expect(screen.getByText('Fixture page 2')).toBeVisible();
});
