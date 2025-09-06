# Package.json Scripts to Add

Add these scripts to your package.json to integrate the export validation system:

```json
{
  "scripts": {
    "validate-exports": "node scripts/validate-exports.js",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run validate-exports && npm run lint",
    "pre-build": "npm run validate",
    "build": "npm run pre-build && vite build"
  }
}
```

## Integration Steps:

1. **Add the scripts above** to your package.json
2. **Run validation**: `npm run validate-exports`
3. **Type checking**: `npm run type-check` 
4. **Full validation**: `npm run validate`
5. **Pre-build check**: `npm run pre-build`

## Pre-commit Integration (Optional):

```json
{
  "devDependencies": {
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0"
  }
}
```

Then add to package.json:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "npm run validate-exports"
    ]
  }
}
```