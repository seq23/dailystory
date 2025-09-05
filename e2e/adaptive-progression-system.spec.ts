import { test, expect } from '@playwright/test';

const SUPABASE_HOST = 'https://cpzeuogomaixamrtnnmj.supabase.co';

// E2E tests for Adaptive Progression System V2
test.beforeEach(async ({ page }) => {
  // Stub Supabase calls to keep tests deterministic
  await page.route(`${SUPABASE_HOST}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({ status: 204, body: '' });
  });
});

test.describe('Premium User Adaptive Progression', () => {
  test.beforeEach(async ({ page }) => {
    // Mock premium user state
    await page.evaluate(() => {
      localStorage.setItem('user-premium-status', 'true');
    });
  });

  test('shows current grade level toast on story start', async ({ page }) => {
    await page.goto('/');
    
    // Mock expert difficulty selection
    await page.evaluate(() => {
      // Set expert difficulty and grade level
      localStorage.setItem('story-difficulty', 'expert');
      localStorage.setItem('expert_difficulty_progress_testuser', JSON.stringify({
        currentGradeLevel: '7th',
        sessionsCompleted: 5,
        successfulSessions: 2,
        comprehensionScores: [],
        averageReadingSpeed: 110,
        totalReadingTime: 1200,
        lastUpdated: Date.now()
      }));
    });
    
    // Start a story
    await page.click('[data-testid="start-story"]');
    
    // Should show current grade level toast
    await expect(page.locator('text=Reading at 7th Grade Level')).toBeVisible();
  });

  test('advances grade level with high performance', async ({ page }) => {
    await page.goto('/');
    
    // Mock initial 6th grade user
    await page.evaluate(() => {
      localStorage.setItem('story-difficulty', 'expert');
      localStorage.setItem('expert_difficulty_progress_testuser', JSON.stringify({
        currentGradeLevel: '6th',
        sessionsCompleted: 1,
        successfulSessions: 0,
        averageReadingSpeed: 0,
        totalReadingTime: 0,
        lastUpdated: Date.now()
      }));
    });
    
    // Simulate high performance session (6 pages, 125 WPM)
    await page.evaluate(() => {
      window.mockSessionData = {
        readingSpeed: 125,
        pagesCompleted: 6,
        completed: true
      };
    });
    
    // End session to trigger progression
    await page.click('[data-testid="end-session"]');
    
    // Should show advancement toast
    await expect(page.locator('text=🎉 Congratulations!')).toBeVisible();
    await expect(page.locator('text=Advanced to 7th Grade Level!')).toBeVisible();
  });

  test('does not advance with insufficient performance', async ({ page }) => {
    await page.goto('/');
    
    // Mock 7th grade user
    await page.evaluate(() => {
      localStorage.setItem('story-difficulty', 'expert');
      localStorage.setItem('expert_difficulty_progress_testuser', JSON.stringify({
        currentGradeLevel: '7th',
        sessionsCompleted: 2,
        successfulSessions: 1,
        averageReadingSpeed: 90,
        totalReadingTime: 800,
        lastUpdated: Date.now()
      }));
    });
    
    // Simulate poor performance session (3 pages, 60 WPM)
    await page.evaluate(() => {
      window.mockSessionData = {
        readingSpeed: 60,
        pagesCompleted: 3,
        completed: true
      };
    });
    
    // End session
    await page.click('[data-testid="end-session"]');
    
    // Should show encouragement toast, not advancement
    await expect(page.locator('text=Keep Practicing')).toBeVisible();
    await expect(page.locator('text=Continue reading at 7th Grade Level')).toBeVisible();
    
    // Should NOT show advancement toast
    await expect(page.locator('text=🎉 Congratulations!')).not.toBeVisible();
  });

  test('standard reader progression path (10 pages, 85 WPM)', async ({ page }) => {
    await page.goto('/');
    
    // Mock 8th grade user
    await page.evaluate(() => {
      localStorage.setItem('story-difficulty', 'expert');
      localStorage.setItem('expert_difficulty_progress_testuser', JSON.stringify({
        currentGradeLevel: '8th',
        sessionsCompleted: 3,
        successfulSessions: 1,
        averageReadingSpeed: 95,
        totalReadingTime: 1500,
        lastUpdated: Date.now()
      }));
    });
    
    // Simulate standard reader performance (10 pages, 85 WPM)
    await page.evaluate(() => {
      window.mockSessionData = {
        readingSpeed: 85,
        pagesCompleted: 10,
        completed: true
      };
    });
    
    // End session
    await page.click('[data-testid="end-session"]');
    
    // Should advance to 9th grade
    await expect(page.locator('text=Advanced to 9th Grade Level!')).toBeVisible();
  });

  test('cannot advance beyond 10th grade', async ({ page }) => {
    await page.goto('/');
    
    // Mock 10th grade user
    await page.evaluate(() => {
      localStorage.setItem('story-difficulty', 'expert');
      localStorage.setItem('expert_difficulty_progress_testuser', JSON.stringify({
        currentGradeLevel: '10th',
        sessionsCompleted: 10,
        successfulSessions: 8,
        averageReadingSpeed: 180,
        totalReadingTime: 5000,
        lastUpdated: Date.now()
      }));
    });
    
    // Simulate excellent performance
    await page.evaluate(() => {
      window.mockSessionData = {
        readingSpeed: 200,
        pagesCompleted: 12,
        completed: true
      };
    });
    
    // End session
    await page.click('[data-testid="end-session"]');
    
    // Should NOT show advancement toast (already at max level)
    await expect(page.locator('text=🎉 Congratulations!')).not.toBeVisible();
    await expect(page.locator('text=Advanced to')).not.toBeVisible();
  });
});

test.describe('Free User Random Grade Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Mock free user state
    await page.evaluate(() => {
      localStorage.removeItem('user-premium-status');
    });
  });

  test('shows random grade level notification for expert difficulty', async ({ page }) => {
    await page.goto('/');
    
    // Mock expert difficulty selection
    await page.evaluate(() => {
      localStorage.setItem('story-difficulty', 'expert');
    });
    
    // Start a story
    await page.click('[data-testid="start-story"]');
    
    // Should show random grade level toast (any 6th-10th grade)
    const gradeToastVisible = await page.waitForSelector(
      'text=/You\\\'re reading a (6th|7th|8th|9th|10th) Grade story today!/'
    );
    expect(gradeToastVisible).toBeTruthy();
  });

  test('does not show progression toasts for free users', async ({ page }) => {
    await page.goto('/');
    
    // Mock expert difficulty and session completion
    await page.evaluate(() => {
      localStorage.setItem('story-difficulty', 'expert');
      window.mockSessionData = {
        readingSpeed: 150,
        pagesCompleted: 8,
        completed: true
      };
    });
    
    // Start and complete story
    await page.click('[data-testid="start-story"]');
    await page.click('[data-testid="end-session"]');
    
    // Should NOT show any progression toasts
    await expect(page.locator('text=🎉 Congratulations!')).not.toBeVisible();
    await expect(page.locator('text=Advanced to')).not.toBeVisible();
    await expect(page.locator('text=Keep Practicing')).not.toBeVisible();
  });

  test('gets new random grade each session', async ({ page }) => {
    await page.goto('/');
    
    let firstGrade: string | null = null;
    let secondGrade: string | null = null;
    
    // First session
    await page.evaluate(() => {
      localStorage.setItem('story-difficulty', 'expert');
    });
    await page.click('[data-testid="start-story"]');
    
    // Capture first grade
    const firstToast = await page.waitForSelector('text=/reading a (\\w+) Grade story/');
    firstGrade = await firstToast.textContent();
    
    // Complete session and start new one
    await page.click('[data-testid="end-session"]');
    await page.click('[data-testid="next-story"]');
    
    // Capture second grade
    const secondToast = await page.waitForSelector('text=/reading a (\\w+) Grade story/');
    secondGrade = await secondToast.textContent();
    
    // Grades could be the same (random), but system should handle multiple selections
    expect(firstGrade).toBeTruthy();
    expect(secondGrade).toBeTruthy();
  });
});

test.describe('Data Persistence and Migration', () => {
  test('migrates sessionStorage to localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Mock legacy sessionStorage data
    await page.evaluate(() => {
      const legacyData = {
        currentGradeLevel: '8th',
        sessionsCompleted: 3,
        successfulSessions: 2,
        averageReadingSpeed: 120,
        totalReadingTime: 1800,
        lastUpdated: Date.now() - 86400000 // 1 day ago
      };
      sessionStorage.setItem('expert_difficulty_progress_testuser', JSON.stringify(legacyData));
      localStorage.removeItem('expert_difficulty_progress_testuser');
    });
    
    // Trigger grade level retrieval (should cause migration)
    await page.evaluate(() => {
      return window.ExpertDifficultyManager.getCurrentGradeLevel({ name: 'testuser' });
    });
    
    // Check that data was migrated to localStorage
    const migratedData = await page.evaluate(() => {
      return localStorage.getItem('expert_difficulty_progress_testuser');
    });
    
    expect(migratedData).toBeTruthy();
    
    // Check that sessionStorage was cleared
    const sessionData = await page.evaluate(() => {
      return sessionStorage.getItem('expert_difficulty_progress_testuser');
    });
    
    expect(sessionData).toBeNull();
  });

  test('handles corrupted progress data gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Mock corrupted localStorage data
    await page.evaluate(() => {
      localStorage.setItem('expert_difficulty_progress_testuser', 'invalid-json-data');
    });
    
    // Should handle gracefully and return default 6th grade
    const gradeLevel = await page.evaluate(() => {
      return window.ExpertDifficultyManager.getCurrentGradeLevel({ name: 'testuser' });
    });
    
    expect(gradeLevel).toBe('6th');
  });
});

test.describe('Performance and Error Handling', () => {
  test('progression calculation performance', async ({ page }) => {
    await page.goto('/');
    
    // Measure progression calculation time
    const executionTime = await page.evaluate(() => {
      const start = performance.now();
      
      window.ExpertDifficultyManager.updateProgress(
        { name: 'testuser' },
        '7th',
        {
          readingSpeed: 120,
          pagesCompleted: 6,
          completed: true
        }
      );
      
      return performance.now() - start;
    });
    
    // Should complete in under 5ms
    expect(executionTime).toBeLessThan(5);
  });

  test('toast notification reliability', async ({ page }) => {
    await page.goto('/');
    
    // Mock console error tracking
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Trigger multiple toast notifications
    await page.evaluate(() => {
      localStorage.setItem('story-difficulty', 'expert');
      localStorage.setItem('user-premium-status', 'true');
    });
    
    await page.click('[data-testid="start-story"]');
    await page.click('[data-testid="end-session"]');
    
    // Check no toast-related errors occurred
    const toastErrors = errors.filter(error => 
      error.includes('toast') || error.includes('Toast')
    );
    expect(toastErrors).toHaveLength(0);
  });
});
