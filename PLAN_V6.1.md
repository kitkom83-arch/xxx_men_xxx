# BN9 X Social Real V6.1 - Implementation Plan

## Project Overview

- **Project Type**: Next.js (Pages Router) + Prisma/PostgreSQL
- **Current Mode**: Demo/Mock (default)
- **Security**: AES-256-GCM encryption for credentials, session-based auth
- **Test Framework**: Node.js built-in test runner (not pytest)

---

## Targets & Implementation Plan

### 1. Global Action Switch - Disable Real X Actions

**Current State**:
- `lib/safety.js` has `FORBIDDEN_ACTIONS` list
- `lib/xApi.js` only implements read-only endpoints
- No global flag to enable/disable all write operations

**Plan**:
- Add `REAL_ACTIONS_ENABLED` setting in `lib/store.js` via `getSetting/setSetting`
- Add global check function in `lib/safety.js`: `isRealActionsEnabled()`
- Modify action-related APIs to check this flag before execution
- Default: `false` (disabled - dry-run only)

**Files to Modify**:
- `lib/store.js` - add `REAL_ACTIONS_ENABLED` handling
- `lib/safety.js` - add `isRealActionsEnabled()` and enforcement

---

### 2. Mock/Demo Mode Full Implementation

**Current State**:
- `lib/xApi.js` has mock data for search, users, posts, usage, trends
- Mode controlled via `getSetting('mode')` = 'mock' or 'live-readonly'

**Plan**:
- Ensure all write endpoints return mock responses when mode='mock'
- Add explicit "Demo Mode" indicator in UI and API responses
- Add mock storage for drafts, analytics in demo mode
- Prevent accidental real API calls in mock mode

**Files to Modify**:
- `lib/xApi.js` - enhance mock responses
- `pages/api/composer/dry-run.js` - ensure mock mode enforcement
- UI pages - show demo mode indicator

---

### 3. Test System with Node.js Test Runner

**Current State**:
- `tests/unit.test.js` exists with basic tests
- Uses Node.js built-in `node:test` module

**Plan**:
- Expand test coverage:
  - API endpoint tests (mock requests)
  - Security/encryption tests
  - Safety guard tests
  - Store/prisma fallback tests
  - Session/auth tests
- Add test configuration file
- Add npm scripts for different test modes
- **Note**: Using Node.js test runner (not pytest as mentioned in task - adapting to actual project)

**Files to Create/Modify**:
- `tests/unit.test.js` - expand tests
- `tests/api.test.js` - API endpoint tests
- `tests/security.test.js` - security tests
- `package.json` - add test scripts

---

### 4. Enhanced Secure Token Storage

**Current State**:
- Credentials encrypted with AES-256-GCM in `lib/security.js`
- Stored in Prisma `CredentialVault` table
- Frontend sees only masked metadata

**Plan**:
- Add additional encryption layer using environment key
- Add credential validation for format checking
- Add "last validated" timestamp
- Ensure no credential logs anywhere

**Files to Modify**:
- `lib/security.js` - add extra encryption helpers
- `lib/store.js` - add credential validation
- Add audit logging for credential changes

---

### 5. GitHub Actions CI

**Current State**:
- No CI/CD configuration exists

**Plan**:
- Create `.github/workflows/ci.yml`:
  - Node.js version matrix
  - Install dependencies
  - Lint check (if exists)
  - Run unit tests
  - Build check
  - Optional: E2E tests with Playwright

**Files to Create**:
- `.github/workflows/ci.yml`
- `.github/workflows/ci-full.yml` (optional extended)

---

### 6. Build Script for Distribution

**Current State**:
- Next.js app with `npm run build`
- No standalone .exe (Next.js runs as server)

**Plan**:
- Note: This is a Next.js app, not a Python/Tkinter app
- Create `scripts/build-prod.bat` for Windows:
  - Install dependencies
  - Generate Prisma
  - Build Next.js
  - Copy .env template
- Document that it's a web app, not standalone exe

**Files to Create**:
- `scripts/build-prod.bat`
- `scripts/build-prod.sh` (for consistency)

---

### 7. Release Checklist (Thai)

**Plan**:
- Create `RELEASE_CHECKLIST.md` in Thai:
  - Pre-release checks
  - Security verification steps
  - Test execution steps
  - Build verification
  -Deployment steps
  - Post-release monitoring

**Files to Create**:
- `RELEASE_CHECKLIST.md` (Thai)

---

### 8. Update README (Thai)

**Current State**:
- README.md exists with English and Thai sections
- Last updated June 2026

**Plan**:
- Update README with:
  - New V6.1 features
  - Demo mode setup instructions (Thai)
  - Security features explanation (Thai)
  - Test execution guide (Thai)
  - Quick start for general users
  - Screenshots reference (placeholder)

**Files to Modify**:
- `README.md` - enhance Thai sections, add user guide

---

## Summary of Files to Create/Modify

### New Files:
1. `.github/workflows/ci.yml` - GitHub Actions CI
2. `scripts/build-prod.bat` - Build script
3. `scripts/build-prod.sh` - Build script (Unix)
4. `RELEASE_CHECKLIST.md` - Release checklist
5. `tests/api.test.js` - API tests
6. `tests/security.test.js` - Security tests

### Modified Files:
1. `lib/store.js` - Add REAL_ACTIONS_ENABLED setting
2. `lib/safety.js` - Add isRealActionsEnabled()
3. `lib/xApi.js` - Enhance mock mode
4. `lib/security.js` - Enhanced encryption
5. `package.json` - Add test scripts
6. `tests/unit.test.js` - Expand tests
7. `README.md` - Update Thai guide
8. `TODO.md` - Update status
9. `TEST_REPORT.md` - Update test results

---

## Priority Order

1. **P0** (Safety-Critical):
   - Global action switch (REAL_ACTIONS_ENABLED)
   - Secure token storage enhancement

2. **P1** (Testing):
   - Expand test coverage
   - GitHub Actions CI

3. **P2** (Delivery):
   - Build scripts
   - Release checklist
   - README update

4. **P3** (Polish):
   - Demo mode UI indicators
   - Documentation polish

---

## Notes

- **Python/Tkinter mentioned in task**: Actual project is Next.js - adapting appropriately
- **pytest mentioned in task**: Using Node.js test runner (project uses Node.js, not Python)
- **app.py mentioned in task**: No such file exists - the actual entry is Next.js pages
- **Must preserve**: All existing features, mock mode, dry-run only, Thai UI

---

## Approval Required

Please confirm the plan above before proceeding with implementation.
