# Pick what happens next

An ongoing Premium story shows three choices below its newest page. Each button
is at least 56px tall, wraps its text, and stacks on a phone. A tap writes the
next page along that action. Previous pages can be reread without generating a
new branch. Finish Story keeps its existing confirmation and AI ending.

The page model appends `<choices>["action", "action", "action"]</choices>` to
the same answer. The handler removes this metadata before validating, rewriting,
splitting or returning story text. The response carries a separate `choices`
array; `config.selectedChoice` carries the tapped action into the next request.
The existing provider routing and fallback order are unchanged. No additional
model call generates choices; ongoing page requests reserve 120 output tokens
for the metadata.

Choice limits use the shared reading-grade profile. Early readers get simpler,
shorter options. Missing, malformed, duplicated, empty or oversized options fall
back to three fixed safe actions. Backup and emergency pages offer those same
fixed choices and prepend the selected action when continuing offline content.
Old cached contexts without choices also render the safe options.

Guests retain the existing six-page display limit and next-story action. Choices
are hidden for guests, completed stories and previous pages. Existing story-request
free text remains unchanged.

Coverage: `src/test/guards/story-choices.test.tsx` and the fully mocked phone
journey in `e2e/story-choices.spec.ts`. Parsing, forwarding and button-submission
regressions were each deliberately introduced, observed failing, and restored.
