# BN9 X Social Real V6.1 - TODO

## Status: Phase 5-7 Implementation

---

## IMPLEMENTATION PLAN (Adapted for Node.js)

### Phase 5: Rate Limit & Usage Monitor

- [ ] 1. Create lib/rate-limit-store.js
  - [ ] recordRateLimit(endpoint, headers) 
  - [ ] loadRateLimitHistory(limit=100)
  - [ ] latestRateLimitText()
  - Save to: outputs/rate_limit_history.jsonl
  
- [ ] 2. Modify lib/xApi.js (already has recordRateLimit)
  - [ ] Filter out Authorization/token from rate limit records
  - [ ] Ensure safe logging

- [ ] 3. Create lib/usage-monitor.js
  - [ ] recordUsageSnapshot(payload)
  - [ ] loadUsageHistory(limit=100)
  - [ ] usageWarningText(payload)
  - Save to: outputs/usage_history.jsonl

- [ ] 4. Update UI pages/dashboard/rate-limits.js
  - [ ] Show latest rate limit in Start Here tab
  - [ ] Add "ดู Rate Limit ล่าสุด" button
  - [ ] Add "ดู Usage ล่าสุด" button

- [ ] 5. Warning Logic
  - [ ] Display Thai warning when remaining near 0
  - [ ] Block rapid retry
  - [ ] Suggest wait for reset

- [ ] 6. Create tests
  - [ ] tests/test-rate-limit-store.js
  - [ ] tests/test-usage-monitor.js

### Phase 6: GitHub Actions CI Update

- [ ] 1. Update .github/workflows/ci.yml
  - [ ] Add windows-latest, ubuntu-latest
  - [ ] Use mock mode env vars properly
  - [ ] Add MOCK_MODE=1, ENABLE_REAL_ACTIONS=0, DRY_RUN_ONLY=1

- [ ] 2. Update README.md
  - [ ] Add CI badge or section

### Phase 7: Build EXE / Release Package

- [ ] 1. Update requirements-dev.txt (or package.json devDependencies)
  - [ ] Add pyinstaller equivalent (unlikely for Next.js) or build tools

- [ ] 2. Update build-exe.bat or create new script
  - [ ] Already exists: scripts/build-prod.bat
  - [ ] May need update for release packaging

- [ ] 3. Create RELEASE_CHECKLIST_TH.md
  - [ ] Include checklist items from task

- [ ] 4. Update .gitignore
  - [ ] Add: dist/, build/, *.spec (if needed)

- [ ] 5. Update README.md and README_TH.md
  - [ ] Add build instructions
  - [ ] Add distribution notes

---

## QA Final Checklist (Node.js adapted)

Commands to run:
```bash
node --check lib/*.js pages/**/*.js
npm test
npm run build
node scripts/smoke-full.js
```

Verify:
- .env not tracked
- outputs/ not tracked
- No real tokens in repo
- action_audit.jsonl (if exists) has no tokens
- ENABLE_REAL_ACTIONS default = 0
- MOCK_MODE default = 1
- DRY_RUN_ONLY default = 1

UI checks:
- Start Here shows Safety status
- Settings shows masked token
- Social Listening works in mock mode
- Trend Radar works in mock mode
- Real action blocked/queued if ENABLE_REAL_ACTIONS != 1
- Policy Guard shows risk warnings
- Scope Guard shows missing scopes
- Health Check shows Thai status

---

*อัปเดตล่าสุด: มกราคม 2569 (Phase 5-7 Implementation)*
