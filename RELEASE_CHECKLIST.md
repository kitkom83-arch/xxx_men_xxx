# รายการตรวจสอบก่อนเผยแพร่ (Release Checklist)

## V6.1 Safety + Test + Demo Ready

---

## ขั้นตอนก่อนเผยแพร่ (Pre-Release Checks)

### 1. ตรวจสอบความปลอดภัย (Security Verification)

- [ ] ไม่มี API key จริงใน source code
- [ ] ไม่มี secret จริงใน .env.example
- [ ] ไม่มี token/key/secret ใน log
- [ ] Credentials ถูกเข้ารหัสด้วย AES-256-GCM
- [ ] Session ใช้ HttpOnly, SameSite=Lax cookies

### 2. ตรวจสอบ Safety Switch

- [ ] `ENABLE_REAL_ACTIONS` ค่าเริ่มต้น = 0 (ปิด)
- [ ] `MOCK_MODE` ค่าเริ่มต้น = 1 (เปิด)
- [ ] `DRY_RUN_ONLY` ค่าเริ่มต้น = 1 (เปิด)
- [ ] ทุก action ถูกบล็อกโดย default

### 3. ตรวจสอบการทดสอบ (Test Execution)

```bash
# Run all tests
npm test
node --test tests/safety-config.test.js tests/action-executor.test.js

# Expected: All tests pass
```

- [ ] Unit tests ผ่านทั้งหมด
- [ ] Safety config tests ผ่าน
- [ ] Action executor tests ผ่าน

### 4. ตรวจสอบ Build

```bash
npm run build
```

- [ ] Build สำเร็จโดยไม่มี error
- [ ] ไม่มี warning ที่มีผลกระทบ

---

## ขั้นตอนการ Build (Build Steps)

### Windows (Command Prompt)

```cmd
cd [project-folder]
scripts\build-prod.bat
```

### หรือแบบ Manual

```bash
npm ci
npm run prisma:generate
npm run build
```

---

## ขั้นตอนหลังเผยแพร่ (Post-Release)

### 1. ตรวจสอบ Server

```bash
# Start production server
npm start

# หรือ dev mode
npm run dev
```

- [ ] Server เริ่มทำงานได้
- [ ] เปิด http://localhost:3000 ได้

### 2. ตรวจสอบ功能พื้นฐาน

- [ ] `/setup` - Setup wizard ทำงาน
- [ ] `/login` - Login ทำงาน
- [ ] `/` - Dashboard แสดง

### 3. ตรวจสอบ Demo Mode

- [ ] Mock data แสดง
- [ ] ไม่เรียก X API จริง
- [ ] Dry-run composer ทำงาน

### 4. ตรวจสอบ Safety UI

- [ ] แสดงสถานะโหมดปลอดภัย
- [ ] แสดง "Action จริงปิดอยู่"
- [ ] แสดง "Dry-run only"

---

## รายการตรวจสอบสำหรับ Production

### Environment Variables ที่ต้องตั้งค่า

| Variable | ค่าแนะนำ | หมายเหตุ |
|----------|---------|----------|
| DATABASE_URL | postgresql://... | PostgreSQL connection |
| SESSION_SECRET | [random-string-32+] | สร้างค่าใหม่ |
| ENCRYPTION_KEY | [random-hex-64] | สร้างค่าใหม่ |
| APP_BASE_URL | http://localhost:3000 | หรือ domain จริง |
| ENABLE_REAL_ACTIONS | 0 | ค่าเริ่มต้นปลอดภัย |
| MOCK_MODE | 1 | ค่าเริ่มต้น |
| DRY_RUN_ONLY | 1 | ค่าเริ่มต้น |

### สิ่งที่ต้องทำก่อนเปิด Real Actions

1. **อ่านเอกสาร X API** ข้อกำหนดและราคาใน X Developer Console
2. **ทดสอบในโหมด Mock** ให้แน่ใจว่าทุกอย่างทำงาน
3. **ตั้ง ENABLE_REAL_ACTIONS=1** เฉพาะเมื่อพร้อม
4. **ตั้ง MOCK_MODE=0** เพื่อใช้ X API จริง
5. **ตั้ง DRY_RUN_ONLY=0** ถ้าต้องการโพสต์จริง

### คำเตือน

> ⚠️ **อันตราย**: การเปิด real actions จะทำให้ระบบส่งโพสต์, DM, follow จริงไปยัง X
> 
> - ควรทดสอบใน demo mode ให้ครบก่อน
> - ต้องมี X API credentials ที่ถูกต้อง
> - ระวัง rate limits และค่าใช้จ่าย

---

## Quick Reference

```bash
# Development
npm run dev
# เปิด http://localhost:3000

# Production build
npm run build
npm start

# Tests
npm test
node --test tests/safety-config.test.js tests/action-executor.test.js
```

---

## Version History

- **V6.1** (Current): Safety + Test + Demo Ready
  - เพิ่ม Global Safety Switch (ENABLE_REAL_ACTIONS)
  - เพิ่ม Mock/Demo Mode เต็มรูปแบบ
  - เพิ่ม Test Coverage
  - เพิ่ม GitHub Actions CI

---

*อัปเดตล่าสุด: มกราคม 2569*
