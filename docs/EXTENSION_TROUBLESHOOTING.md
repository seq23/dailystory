# Browser Extension Troubleshooting Guide

## Common Extension-Related Console Errors

### "Unchecked runtime.lastError: Could not establish connection"
This error occurs when browser extensions (Chrome, Firefox, etc.) try to communicate with background scripts but the connection is broken due to page navigation or reload.

**System-Level Suppression:**
These errors are now automatically suppressed via the `errorSuppressionManager` to prevent console noise. They do not affect application functionality and are safely filtered out.

**Common Causes:**
- Ad blockers (uBlock Origin, AdBlock Plus)
- Password managers (LastPass, 1Password, Bitwarden)
- Productivity extensions (Grammarly, Honey, etc.)
- Developer tools extensions
- Social media extensions

**Solution:**
The app automatically suppresses these errors in production. If you're seeing them in development:

1. **Enable Debug Mode**: Add `?debug=extensions` to your URL to see which extensions are causing issues
2. **Disable Extensions**: Temporarily disable extensions to identify the culprit
3. **Use Incognito Mode**: Test your app in incognito mode where extensions are disabled

### Extension Detection
You can check which extensions might be interfering with your app:

```javascript
// In browser console
window.detectExtensions()
```

### Debugging Extension Issues
To see suppressed extension errors for debugging:

```javascript
// Check suppression status
window.browserErrorSuppressionStatus()

// Enable extension debug mode
// Add ?debug=extensions to your URL
```

## Best Practices

1. **Test in Clean Environment**: Always test critical functionality in incognito mode
2. **Extension Whitelist**: Maintain a list of tested-compatible extensions
3. **User Communication**: If users report issues, ask them to try incognito mode first

## Technical Implementation

Our error suppression system handles:
- `window.onerror` events from extensions
- Unhandled promise rejections from extension scripts
- Console message filtering for extension noise
- Automatic detection of problematic extension patterns

The suppression is automatically disabled in debug mode to help with development.