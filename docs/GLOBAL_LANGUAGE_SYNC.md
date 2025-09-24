# Global Language Sync in Prompt Testing

This document explains how the Native Language preference is synchronized across the testing tools on the `/prompt-testing` page.

- Storage key: `selectedLanguagePreference`
- Hook: `useLanguageSync` (handles localStorage + i18n UI language)

What writes the preference:
- `AudioE2ETestingPanel` writes the selected native language whenever the dropdown changes.

What reads the preference:
- `StoryPromptTester` reads the preference:
  - On mount: initializes the Custom User form `nativeLanguage` field from the stored preference.
  - On test run: applies the stored preference to all predefined test profiles so generation uses the selected language.

Expected behavior:
- Changing the Native Language in AudioE2E immediately updates UI language and stores the preference.
- Running tests in StoryPromptTester uses that stored language for `userInfo.nativeLanguage` for every profile (unless using Custom User, which will use the custom value).

Notes:
- No visible UI was added; the sync is silent and deterministic.
- This mirrors real user flows: a single saved preference affects story generation and UI language consistently.
