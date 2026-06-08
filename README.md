# X API Marketing Control Center

ระบบควบคุมการตลาดสำหรับ X API แบบ backend-first ใช้ Next.js Pages Router เดิม แต่เพิ่ม admin login, setup wizard, credential vault, dashboard, mock mode, rate/usage monitor, analytics และ composer แบบ dry-run เท่านั้น

## หลักความปลอดภัย

- ไม่ขอ API key จริงจากผู้ใช้
- ไม่ใส่ secret จริงใน source code, README, tests หรือ Docker config
- X credentials ต้องใส่ผ่าน setup wizard หรือ admin API เท่านั้น และจะถูกเข้ารหัสฝั่ง server ด้วย AES-256-GCM
- frontend เห็นเฉพาะสถานะ เช่น `configured`, `maskedLabel`, `lastUpdatedAt`, `mode`
- write action ทั้งหมดถูกล็อกเป็น dry-run: ไม่โพสต์จริง, ไม่ส่ง DM จริง, ไม่ follow/unfollow, ไม่ like/retweet/delete
- ไม่มี browser automation หรือ scraping เพื่อเลี่ยง X API

## โหมดการทำงาน

### Demo / Mock mode

เป็นค่าเริ่มต้นของระบบ ใช้ข้อมูลจำลองสำหรับ search keyword, search user, user posts, analytics, rate limit และ usage monitor เหมาะสำหรับทดสอบ dashboard โดยไม่ต้องมี X credential

### Live read-only mode

ใช้ X Bearer Token ที่ถูกเก็บแบบ encrypted ฝั่ง server เพื่อเรียกเฉพาะ read endpoints เช่น recent search, user lookup, user posts และ usage monitor เท่านั้น ระบบยังไม่อนุญาต write action จริงทุกกรณี

## หน้าหลัก

- `/setup` ตั้งค่าครั้งแรก สร้าง admin เลือกโหมด และใส่ credential แบบ optional
- `/login` เข้าสู่ระบบผู้ดูแล
- `/` dashboard หลักหลัง login

## API หลัก

ทุก protected API ตอบกลับรูปแบบ:

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "meta": {}
}
```

รายการ endpoint:

- `GET /api/setup/status`
- `POST /api/setup/complete`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET|POST|DELETE /api/admin/credentials`
- `GET /api/dashboard`
- `GET /api/x/search?query=...`
- `GET /api/x/user?username=...`
- `GET /api/x/user-posts?userId=...`
- `GET /api/x/usage`
- `POST /api/composer/dry-run`

## ติดตั้งแบบ local

```bash
npm install
npm run prisma:generate
```

สร้าง `.env` จาก `.env.example` แล้วใส่เฉพาะค่า runtime placeholder ของระบบ เช่น `DATABASE_URL`, `SESSION_SECRET`, `ENCRYPTION_KEY`, `APP_BASE_URL`

```bash
npm run prisma:migrate
npm run dev
```

เปิด `http://localhost:3000/setup`

## Docker

```bash
docker compose up --build
```

บริการประกอบด้วย:

- `postgres` สำหรับ database
- `app` สำหรับ Next.js production server

ค่าใน `docker-compose.yml` เป็นค่า dev placeholder เท่านั้น ควรเปลี่ยน `SESSION_SECRET` และ `ENCRYPTION_KEY` ก่อนใช้งานจริง

## Test

```bash
npm test
npm run smoke:full
npm run build
npm run test:e2e
```

สิ่งที่ test ครอบคลุม:

- encryption/decryption และ redaction
- password hashing และ session primitives
- Thai error catalog
- safety guard สำหรับ forbidden write actions
- mock X adapter
- setup state และ public credential metadata
- smoke flow แบบ demo: setup, search, user lookup, user posts, usage, dry-run draft

## Database

ใช้ PostgreSQL + Prisma โดย schema อยู่ที่ `prisma/schema.prisma`

ตารางหลัก:

- `AdminUser`
- `AppSetting`
- `CredentialVault`
- `SearchHistory`
- `PostDraft`
- `RateLimitSnapshot`
- `UsageSnapshot`
- `AuditEvent`

## เมนูและฟีเจอร์ (Menu and Features)

ระบบรองรับ 2 ภาษา: ไทย (ค่าเริ่มต้น) และ English

### วิธีเปลี่ยนภาษา

กดปุ่ม TH/EN ที่มุมขวาบนของแต่ละหน้าเพื่อสลับภาษา
ภาษาจะถูกจำไว้ใน localStorage (key: `xmc_locale`)

### รายการเมนู (Menu List)

| ไทย | English | คำอธิบาย |
|---|---|---|
| แดชบอร์ด | Dashboard | ภาพรวมระบบ |
| ค้นหาโพสต์ | Search Posts | ค้นหาโพสต์จาก keyword |
| ผู้ใช้ | Users | ค้นหาผู้ใช้จาก username |
| โพสต์ของผู้ใช้ | User Posts | ดูโพสต์ของผู้ใช้ |
| เทรนด์ | Trends | หัวข้อที่กำลังเป็นกระแส |
| ตัวช่วยร่างโพสต์ | Composer | ร่างโพสต์แบบ dry-run |
| ขีดจำกัด API | Rate Limits | ตรวจ rate limit |
| การใช้งาน | Usage | ดูการใช้งาน API |
| คีย์ X API | X API Keys | จัดการ API keys |
| ตั้งค่าระบบ | System Settings | ตั้งค่าระบบ |
| คู่มือฟีเจอร์ | Feature Guide | คำอธิบายฟีเจอร์ |

### สถานะฟีเจอร์ (Feature Status)

- **Demo Mode**: ใช้ข้อมูลจำลอง ไม่เรียก X API จริง
- **Read-only**: เฉพาะการอ่านข้อมูล ไม่ทำ write action
- **Dry-run only**: ทดสอบเท่านั้น ไม่โพสต์จริง
- **Protected**: ต้อง login ก่อนเข้าใช้งาน

## หมายเหตุการใช้งานจริง

ก่อนเปิด live-readonly mode ให้ตรวจสิทธิ์และราคาใน X Developer Console เอง ระบบนี้ไม่ส่ง credential ไป frontend และไม่ใช้ credential เพื่อ action จริงใด ๆ บน X

---

## V6.1: ความปลอดภัยเพิ่มเติม (Thai)

### สวิตช์ความปลอดภัยสำหรับ Action จริง

V6.1 เพิ่มระบบป้องกัน Action จริงทั้งระบบ:

| ตัวแปร | ค่าเริ่มต้น | คำอธิบาย |
|--------|------------|----------|
| `ENABLE_REAL_ACTIONS` | `0` | ปิด - ต้องตั้งเป็น `1` จึงจะยิง Action จริงได้ |
| `MOCK_MODE` | `1` | เปิด - ใช้ข้อมูลจำลอง |
| `DRY_RUN_ONLY` | `1` | เปิด - ไม่โพสต์จริง |

### วิธีเปิดใช้งาน Action จริง (⚠️ อันตราย!)

**คำเตือน**: การเปิด Action จริงมีความเสี่ยงสูง!

```bash
# ตั้งค่าใน .env หรือ command line
ENABLE_REAL_ACTIONS=1
MOCK_MODE=0
DRY_RUN_ONLY=0
```

หลังจากนั้นระบบจะอนุญาต:
- `publish_post()` - โพสต์จริงไป X
- `delete_post()` - ลบโพสต์จริง
- `like_post()` - like จริง
- `follow_user()` - follow จริง
- `send_dm()` - ส่ง DM จริง

### วิธีทดสอบ

```bash
# ทดสอบทั้งหมด
npm test

# ทดสอบเฉพาะ safety
node --test tests/safety-config.test.js
node --test tests/action-executor.test.js
```

ผลทดสอบ V6.1: **39/39 PASS**

### ไฟล์ใหม่ (V6.1)

- `lib/safety-config.js` - สวิตช์ความปลอดภัย
- `lib/action-executor.js` - Action gate
- `tests/safety-config.test.js` - ทดสอบ safety
- `tests/action-executor.test.js` - ทดสอบ executor
- `.github/workflows/ci.yml` - GitHub Actions CI
- `scripts/build-prod.bat` - Build script
- `RELEASE_CHECKLIST.md` - รายการตรวจสำหรับ release

---

## Quick Start (English)

1. **Clone & Install**:
   ```bash
   npm install
   npm run prisma:generate
   ```

2. **Setup .env**:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Run**:
   ```bash
   npm run dev
   # Open http://localhost:3000/setup
   ```

4. **First Login**:
   - Username: `admin`
   - Password: (what you set in setup)

### Demo Mode (Default)

- No real X API calls
- Mock data for all features
- Safe for development and testing

### Enable Real Actions (Danger!)

```bash
ENABLE_REAL_ACTIONS=1 MOCK_MODE=0 DRY_RUN_ONLY=0 npm run dev
```

**WARNING**: Only for production use with real X credentials!
