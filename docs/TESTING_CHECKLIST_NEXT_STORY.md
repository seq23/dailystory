# Testing Checklist: Next Story Button

## Manual Testing

### Guest User - Page 6 Experience
- [ ] Start a new story as a guest user
- [ ] Navigate to page 6
- [ ] Count "Next Story" or similar buttons
  - ✅ Expected: ONE button (Magic Wand below image)
  - ❌ Fail if: Two or more buttons found
- [ ] Verify Magic Wand button location
  - ✅ Expected: Below story image, above story text
  - ❌ Fail if: In navigation controls area
- [ ] Verify Magic Wand button appearance
  - ✅ Has sparkle animations
  - ✅ Has "Get the next story!" text
  - ✅ Has wand icon
- [ ] Verify navigation controls
  - ✅ Shows "Previous" button (enabled)
  - ✅ Shows "Next" button (disabled - page 6 is limit)
  - ✅ Shows "Page 6 of [total]"
  - ❌ Fail if: Shows "Next Story" button

### Guest User - Pages 1-5
- [ ] Navigate to pages 1-5
- [ ] Verify NO "Next Story" button anywhere
  - ✅ Expected: No Magic Wand button
  - ✅ Expected: No "Next Story" in navigation

### Premium User - All Pages
- [ ] Start story as premium user
- [ ] Navigate through multiple pages
- [ ] Verify NO "Next Story" button on any page
  - ✅ Expected: "Finish Story" button in navigation (when ready)
  - ✅ Expected: "Rewrite Story" magic wand (when available)
  - ❌ Fail if: "Next Story" button appears anywhere

## Automated Testing

### Unit Tests
```typescript
// Test file: StoryNavigationControls.test.tsx

describe('StoryNavigationControls - Next Story Button Prevention', () => {
  test('does not render Next Story button for guest on page 6', () => {
    render(
      <StoryNavigationControls
        currentPage={5}
        totalPages={12}
        isPremium={false}
        onGenerateNewStory={mockFn}
        {...otherProps}
      />
    );
    
    const nextStoryButton = screen.queryByText(/next story/i);
    expect(nextStoryButton).toBeNull();
  });

  test('renders only Previous and Next navigation buttons', () => {
    render(<StoryNavigationControls {...guestUserProps} />);
    
    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(btn => btn.textContent);
    
    expect(buttonTexts).toContain('Previous');
    expect(buttonTexts).toContain('Next');
    expect(buttonTexts).not.toContain('Next Story');
  });

  test('renders navigation buttons for all page numbers', () => {
    for (let page = 0; page < 12; page++) {
      const { unmount } = render(
        <StoryNavigationControls
          currentPage={page}
          totalPages={12}
          isPremium={false}
          {...otherProps}
        />
      );
      
      const nextStoryButton = screen.queryByText(/next story/i);
      expect(nextStoryButton).toBeNull();
      
      unmount();
    }
  });

  test('premium user never sees Next Story in navigation', () => {
    render(
      <StoryNavigationControls
        currentPage={5}
        totalPages={12}
        isPremium={true}
        {...otherProps}
      />
    );
    
    const nextStoryButton = screen.queryByText(/next story/i);
    expect(nextStoryButton).toBeNull();
  });
});
```

### Integration Tests
```typescript
// Test file: CleanStoryDisplay.test.tsx

describe('CleanStoryDisplay - Next Story Button Integration', () => {
  test('guest user on page 6 sees exactly one Next Story button', () => {
    render(<CleanStoryDisplay userInfo={guestUser} currentPage={5} />);
    
    const nextStoryButtons = screen.getAllByRole('button', {
      name: /next story|get the next story/i
    });
    
    expect(nextStoryButtons).toHaveLength(1);
  });

  test('Magic Wand button has correct attributes', () => {
    render(<CleanStoryDisplay userInfo={guestUser} currentPage={5} />);
    
    const magicWand = screen.getByTestId('magic-wand-free');
    expect(magicWand).toBeInTheDocument();
    expect(magicWand).toHaveTextContent(/get the next story/i);
    
    // Verify it's in CleanStoryDisplay, not navigation
    const navControls = screen.getByRole('navigation');
    expect(navControls).not.toContainElement(magicWand);
  });

  test('guest users on pages 1-5 see no Next Story button', () => {
    for (let page = 0; page < 5; page++) {
      const { unmount } = render(
        <CleanStoryDisplay userInfo={guestUser} currentPage={page} />
      );
      
      const nextStoryButtons = screen.queryAllByRole('button', {
        name: /next story|get the next story/i
      });
      
      expect(nextStoryButtons).toHaveLength(0);
      
      unmount();
    }
  });

  test('premium user never sees Next Story button', () => {
    render(<CleanStoryDisplay userInfo={premiumUser} currentPage={5} />);
    
    const nextStoryButtons = screen.queryAllByRole('button', {
      name: /next story|get the next story/i
    });
    
    expect(nextStoryButtons).toHaveLength(0);
  });

  test('Magic Wand button triggers correct handler', () => {
    const mockGenerateNewStory = jest.fn();
    render(
      <CleanStoryDisplay 
        userInfo={guestUser} 
        currentPage={5}
        onGenerateNewStory={mockGenerateNewStory}
      />
    );
    
    const magicWand = screen.getByTestId('magic-wand-free');
    fireEvent.click(magicWand);
    
    expect(mockGenerateNewStory).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Tests
```typescript
// Test file: story-navigation.spec.ts

describe('Story Navigation - Next Story Button Flow', () => {
  test('guest user completes 6-page story flow', async ({ page }) => {
    await page.goto('/story?user=guest');
    
    // Navigate to page 6
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(500);
    }
    
    // Verify on page 6
    await expect(page.locator('text=Page 6 of')).toBeVisible();
    
    // Count "Next Story" buttons
    const nextStoryButtons = page.locator('button:has-text("Next Story"), button:has-text("Get the next story")');
    await expect(nextStoryButtons).toHaveCount(1);
    
    // Verify it's the Magic Wand button
    const magicWand = page.locator('[data-id="magic-wand-free"]');
    await expect(magicWand).toBeVisible();
    await expect(magicWand).toHaveText(/get the next story/i);
    
    // Verify navigation has no Next Story
    const navArea = page.locator('.story-navigation-controls');
    const navNextStory = navArea.locator('button:has-text("Next Story")');
    await expect(navNextStory).toHaveCount(0);
  });

  test('guest user on pages 1-5 has no Next Story button', async ({ page }) => {
    await page.goto('/story?user=guest');
    
    for (let i = 1; i <= 5; i++) {
      // Verify page number
      await expect(page.locator(`text=Page ${i} of`)).toBeVisible();
      
      // Verify no Next Story button
      const nextStoryButtons = page.locator('button:has-text("Next Story"), button:has-text("Get the next story")');
      await expect(nextStoryButtons).toHaveCount(0);
      
      // Go to next page if not on page 5
      if (i < 5) {
        await page.click('button:has-text("Next")');
        await page.waitForTimeout(500);
      }
    }
  });

  test('premium user never sees Next Story button', async ({ page }) => {
    await page.goto('/story?user=premium');
    
    // Navigate through multiple pages
    for (let i = 0; i < 10; i++) {
      const nextStoryButtons = page.locator('button:has-text("Next Story"), button:has-text("Get the next story")');
      await expect(nextStoryButtons).toHaveCount(0);
      
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(500);
    }
  });

  test('Magic Wand button click generates new story', async ({ page }) => {
    await page.goto('/story?user=guest');
    
    // Navigate to page 6
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(500);
    }
    
    // Click Magic Wand button
    await page.click('[data-id="magic-wand-free"]');
    
    // Verify new story generation started
    await expect(page.locator('text=Creating Magic')).toBeVisible();
    
    // Wait for new story to load
    await expect(page.locator('text=Page 1 of')).toBeVisible({ timeout: 10000 });
  });
});
```

### Visual Regression Tests
```typescript
// Test file: visual-regression.spec.ts

describe('Visual Regression - Next Story Button', () => {
  test('guest user page 6 screenshot - single Magic Wand button', async ({ page }) => {
    await page.goto('/story?user=guest');
    
    // Navigate to page 6
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(500);
    }
    
    // Take screenshot
    await expect(page).toHaveScreenshot('guest-page-6-next-story-button.png', {
      fullPage: true
    });
  });

  test('navigation controls never show Next Story', async ({ page }) => {
    await page.goto('/story?user=guest');
    
    const navControls = page.locator('.story-navigation-controls');
    
    // Screenshot navigation area on page 6
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(500);
    }
    
    await expect(navControls).toHaveScreenshot('navigation-controls-page-6.png');
  });
});
```

## Performance Tests
- [ ] Button click response time < 200ms
- [ ] No layout shift when button animates
- [ ] Sparkle animations run smoothly (60fps)
- [ ] Magic Wand button loading state appears within 100ms

## Accessibility Tests
- [ ] Magic Wand button has proper ARIA label
- [ ] Keyboard navigation reaches button (Tab key)
- [ ] Screen reader announces button correctly
- [ ] Focus visible on keyboard navigation
- [ ] Button has adequate color contrast ratio (WCAG AA)
- [ ] Button is clickable target size (44x44px minimum)

## Cross-Browser Testing
- [ ] Chrome/Edge - Magic Wand animations work
- [ ] Firefox - Single button appears correctly
- [ ] Safari - No duplicate buttons
- [ ] Mobile browsers - Touch targets appropriate size

## Regression Test Frequency
- **Pre-deployment**: Run full test suite
- **Weekly**: Automated E2E tests
- **Monthly**: Visual regression comparison
- **Per PR**: Unit and integration tests

## Related Documentation
- `docs/NEXT_STORY_BUTTON_REGRESSION_FIX.md` - Fix history
- `docs/UI_COMPONENT_RESPONSIBILITIES.md` - Component roles
- `docs/REGRESSION_PREVENTION_GUIDE.md` - Overall strategy
