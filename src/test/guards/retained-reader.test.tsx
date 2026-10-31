import React, { useState } from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { RetainedReader } from '@/components/RetainedReader';

afterEach(cleanup);
function Story() {
  const [page, setPage] = useState(1);
  return <><p>Comet page {page}</p><button onClick={() => setPage(page + 1)}>Next page</button></>;
}
it('keeps the reader through summary and other routes, then restores its page on native Back', async () => {
  window.history.replaceState(null, '', '/');
  render(<BrowserRouter><Link to="/pricing">Plans</Link><Link to="/session-ended">Summary</Link>
    <RetainedReader reader={<Story />}><Routes>
      <Route path="/" element={null} />
      <Route path="/pricing" element={<p>Plans screen</p>} />
      <Route path="/session-ended" element={<p>Summary screen</p>} />
    </Routes></RetainedReader></BrowserRouter>);
  fireEvent.click(screen.getByText('Next page'));
  fireEvent.click(screen.getByText('Summary'));
  expect(screen.getByText('Comet page 2')).not.toBeVisible();
  fireEvent.click(screen.getByText('Plans'));
  expect(screen.getByText('Plans screen')).toBeVisible();
  window.history.back();
  await waitFor(() => expect(screen.getByText('Summary screen')).toBeVisible());
  window.history.back();
  await waitFor(() => expect(screen.getByText('Comet page 2')).toBeVisible());
});
