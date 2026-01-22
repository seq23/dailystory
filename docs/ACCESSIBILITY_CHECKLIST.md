# Accessibility Checklist

**Time2Read - WCAG 2.1 AA Compliance Checklist**

Last Updated: January 2025

## Overview

This checklist ensures Time2Read meets WCAG 2.1 Level AA accessibility standards. Review this document before major releases and during quarterly audits.

---

## 1. Perceivable

### 1.1 Text Alternatives
- [ ] All images have meaningful `alt` text
- [ ] Decorative images use `alt=""` or CSS backgrounds
- [ ] Complex images (charts, diagrams) have extended descriptions
- [ ] Icon buttons have accessible labels

### 1.2 Time-Based Media
- [ ] Video content has captions (when applicable)
- [ ] Audio content has transcripts (when applicable)
- [ ] Read-aloud feature can be paused/stopped

### 1.3 Adaptable
- [ ] Content is properly structured with headings (h1-h6)
- [ ] Reading order is logical without CSS
- [ ] Form fields have associated labels
- [ ] Tables use proper headers

### 1.4 Distinguishable
- [ ] Color contrast ratio is at least 4.5:1 for normal text
- [ ] Color contrast ratio is at least 3:1 for large text
- [ ] Color is not the only way to convey information
- [ ] Text can be resized up to 200% without loss of content
- [ ] Images of text are avoided (except logos)

---

## 2. Operable

### 2.1 Keyboard Accessible
- [ ] All functionality is keyboard accessible
- [ ] No keyboard traps exist
- [ ] Tab order follows visual layout
- [ ] Custom components have keyboard support
- [ ] Skip links are provided

### 2.2 Enough Time
- [ ] Users can adjust time limits (reading timer)
- [ ] Moving content can be paused
- [ ] Auto-updating content can be paused
- [ ] Session timeouts have warnings

### 2.3 Seizures and Physical Reactions
- [ ] No content flashes more than 3 times per second
- [ ] Animations respect `prefers-reduced-motion`

### 2.4 Navigable
- [ ] Pages have descriptive titles
- [ ] Focus order is logical
- [ ] Link purposes are clear from context
- [ ] Multiple ways to find pages exist
- [ ] Headings describe topic or purpose
- [ ] Focus is visible at all times

### 2.5 Input Modalities
- [ ] Touch targets are at least 44x44 pixels
- [ ] Pointer gestures have alternatives
- [ ] Motion actuation can be disabled

---

## 3. Understandable

### 3.1 Readable
- [ ] Page language is identified (`lang` attribute)
- [ ] Language changes are marked
- [ ] Unusual words are explained
- [ ] Reading level is appropriate for audience

### 3.2 Predictable
- [ ] Navigation is consistent across pages
- [ ] Components behave consistently
- [ ] Context changes are user-initiated

### 3.3 Input Assistance
- [ ] Error messages are clear and helpful
- [ ] Required fields are clearly marked
- [ ] Form submission can be reviewed before sending
- [ ] Error prevention for important actions

---

## 4. Robust

### 4.1 Compatible
- [ ] HTML validates without significant errors
- [ ] ARIA is used correctly
- [ ] Name, role, value are programmatically determined
- [ ] Status messages use ARIA live regions

---

## Component-Specific Checks

### Story Display
- [ ] Story text has sufficient contrast
- [ ] Page navigation is keyboard accessible
- [ ] Current page is announced to screen readers
- [ ] Images have alt text describing the scene

### Forms (User Info, Login)
- [ ] All inputs have visible labels
- [ ] Error messages are associated with fields
- [ ] Autocomplete attributes are used
- [ ] Required fields are indicated

### Timer Component
- [ ] Timer can be paused
- [ ] Time remaining is announced
- [ ] Visual countdown has text alternative

### Navigation/Menus
- [ ] Menus are keyboard navigable
- [ ] Current page is indicated
- [ ] Submenus announce expansion state

### Modals/Dialogs
- [ ] Focus moves to modal on open
- [ ] Focus is trapped within modal
- [ ] ESC closes modal
- [ ] Focus returns to trigger on close

---

## Testing Tools

### Automated Testing
- [ ] axe-core browser extension
- [ ] WAVE evaluation tool
- [ ] Lighthouse accessibility audit
- [ ] eslint-plugin-jsx-a11y (development)

### Manual Testing
- [ ] Keyboard-only navigation test
- [ ] Screen reader testing (VoiceOver, NVDA)
- [ ] Color contrast check (WebAIM)
- [ ] Mobile screen reader testing

### Test Devices/Software
- [ ] VoiceOver on macOS/iOS
- [ ] NVDA on Windows
- [ ] TalkBack on Android
- [ ] Zoom text enlargement
- [ ] High contrast mode

---

## Known Issues

| Issue | Severity | Status | Target Fix |
|-------|----------|--------|------------|
| AI-generated images lack detailed alt text | Medium | In Progress | Q1 2025 |
| Some third-party components need aria-labels | Low | Tracking | Q2 2025 |

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Screen Reader Basics](https://www.youtube.com/watch?v=dEbl5jvLKGQ)

---

## Review Schedule

- **Before Release**: Core functionality checks
- **Monthly**: Automated scan and review
- **Quarterly**: Full manual audit
- **Annually**: Third-party accessibility audit

---

**Document Owner**: Engineering Team
**Review Frequency**: Quarterly
