# AGENTS.md

Instruction set for Codex / Agent-based automation

## 1) Project goal
ยกระดับโปรเจกต์ **X API Marketing Control Center** ให้เป็นระบบควบคุมการตลาดสำหรับ X Developer Platform / X API แบบ backend-first (Next.js + Prisma) โดยรองรับ:
- Admin login
- Setup wizard
- Dashboard (search keyword/user/user-posts)
- Analytics เบื้องต้น (posts count, engagement summary, hashtag count, keyword count, top accounts)
- Rate limit monitor (x-rate-limit-limit/remaining/reset)
- Usage monitor (เช่น /2/usage/tweets ในโหมดที่รองรับ)
- Error handler ภาษาไทย (401/403/429/token expired/OAuth callback error)
- Dry-run post composer (preview/character count/policy warning, ห้ามโพสต์จริง)
- Default mock/demo mode และ live-readonly adapter
- Test ครบ (unit + API integration mock + E2E + security baseline)
- Docker (Dockerfile + docker-compose.yml) และ README/QUICKSTART ภาษาไทย

## 2) Repo structure
สิ่งที่คาดหวังใน repository นี้:
- `pages/` : Next.js Pages Router (UI + API routes)
- `lib/` : service/util/security/xApi/safety/store
- `prisma/` : Prisma schema/migrations
- `tests/` : unit/e2e tests
- `scripts/` : smoke scripts
- `Dockerfile`, `docker-compose.yml` : container setup

## 3) Commands
ทุกครั้งที่แก้ไขโค้ด ให้รันตามลำดับ (ถ้า pipeline ไม่ต้องรันทุกอัน ให้รันอย่างน้อยที่เกี่ยวข้อง):
1. `npm.cmd ci` (หรือ `npm.cmd install` ถ้าไม่มี lock install)
2. `npm.cmd test`
3. `npm.cmd run smoke:full`
4. `npm.cmd run build`
5. `npm.cmd run test:e2e`
6. `docker compose config`
7. `docker build .`

ถ้ามี failure ให้แก้จนผ่านก่อนทำขั้นต่อไป

## 4) Security rules
ห้ามทำสิ่งต่อไปนี้เด็ดขาด:
- ห้ามใส่ secret จริงในไฟล์ (เช่น .env, README, tests, Docker build args)
- ห้ามใส่ token/key ใน frontend bundle หรือ client-side code
- ห้าม log token/secret (รวมถึง console.log ของ envelope/decrypted payload)
- Vault ต้อง encrypt ฝั่ง server (เช่น AES-256-GCM) และ frontend เห็นเฉพาะ masked labels เท่านั้น
- ทุก API call ต้องผ่าน server-side service เท่านั้น
- ต้อง parse และ expose rate-limit headers อย่างถูกต้อง (หรือใช้ snapshot ใน mock)
- Error ต้องเป็นภาษาไทยและไม่รั่วรายละเอียด credential

## 5) X API policy rules
- Default ต้องเป็น **mock/demo mode**
- Write actions ต้องปิดไว้เสมอ ยกเว้นมี **flag**:
  - ห้ามโพสต์จริงจนกว่าจะมี `ENABLE_REAL_WRITE_ACTIONS=true`
  - หากไม่ได้ตั้ง flag ให้ block/write ถูกบังคับให้เป็น dry-run เท่านั้น
- ห้ามส่ง DM จริง
- ห้าม follow/unfollow จริง
- ห้าม like/retweet/delete จริง
- ห้าม scrape / bulk spam / browser automation เพื่อเลี่ยง X API

## 6) Testing rules
ต้องมีและต้องรันก่อนปิดงาน:
- Unit tests: encryption/decryption, redactSecrets, safety guard, Thai error normalizer
- API integration tests (mock): เรียก endpoint สำคัญและตรวจ response shape
- E2E tests: setup wizard + login + dashboard flow + composer dry-run
- Security baseline:
  - ตรวจไม่พบ secret ใน source
  - ตรวจไม่พบ secret ใน response/log

## 7) Done definition
ถือว่างาน “Done” เมื่อ:
- ทุกคำสั่งในหัวข้อ 3 ผ่านทั้งหมด
- ครอบคลุม acceptance criteria ตามที่กำหนด
- ไม่มี secret จริงถูกเปิดเผย
- มี README/QUICKSTART ภาษาไทยอัปเดตแล้ว
- มี test ครบและผ่าน

## 8) Forbidden actions
- ห้ามเพิ่ม feature ใหม่ที่เกี่ยวกับ write action ก่อนมี flag `ENABLE_REAL_WRITE_ACTIONS=true`
- ห้ามขอ API key จริงจากผู้ใช้
- ห้าม commit `.env`

## ขั้นตอนการทำงานเพิ่มเติมสำหรับ agent
- หลังแก้ไข/สร้างไฟล์ ให้แสดง **diff** ของไฟล์ที่เปลี่ยน
- หยุดรอการอนุมัติจากผู้ใช้ก่อนทำขั้นต่อไป

