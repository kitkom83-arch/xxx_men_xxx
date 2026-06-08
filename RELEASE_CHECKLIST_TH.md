# รายการตรวจสำหรับ Release - V6.1

## ⚠️ ความปลอดภัยก่อน Release

### 1. การตรวจ Code Quality

- [ ] `node --check lib/*.js` - ผ่าน (ไม่มี syntax error)
- [ ] `node --check pages/**/*.js` - ผ่าน
- [ ] `npm test` - ผ่านทั้งหมด
- [ ] `npm run build` - ผ่าน (build ได้สำเร็จ)

### 2. การตรวจไฟล์ที่ห้ามแนบ

ตรวจสอบว่าไฟล์เหล่านี้ **ไม่ถูก commit** ขึ้น Git:

- [ ] `.env` - ต้องไม่มี token จริง
- [ ] `.env.*` - ต้องไม่ถูก track
- [ ] `outputs/` - ต้องไม่ถูก track
- [ ] `action_audit.jsonl` - ถ้ามี ต้องไม่มี token
- [ ] `dist/` - ถ้ามี ต้องไม่ถูก track
- [ ] `node_modules/` - ต้องไม่ถูก track

### 3. การตรวจ Environment Defaults

ตรวจสอบไฟล์ `.env.example` หรือ code:

- [ ] `ENABLE_REAL_ACTIONS=0` เป็นค่าเริ่มต้น
- [ ] `MOCK_MODE=1` เป็นค่าเริ่มต้น  
- [ ] `DRY_RUN_ONLY=1` เป็นค่าเริ่มต้น

### 4. การตรวจ UI

เปิด browser และตรวจหน้า UI:

- [ ] **Start Here** แสดงสถานะ Safety ชัดเจน
- [ ] **Settings** แสดง token แบบ masked (ไม่เปิดเผย)
- [ ] **Social Listening** ใช้ mock mode ได้
- [ ] **Trend Radar** ใช้ mock mode ได้
- [ ] **Action** ถูก block/queue ถ้ายังไม่เปิด ENABLE_REAL_ACTIONS=1
- [ ] **Policy Guard** แสดงคำเตือนความเสี่ยง
- [ ] **Scope Guard** แสดง scope ที่ขาด
- [ ] **Health Check** แสดงภาษาไทยอ่านง่าย

### 5. การตรวจ Test

รัน test ทั้งหมดและบันทึกผล:

```bash
# Unit tests
npm test

# Health check
node --check pages/api/health.js

# Build
npm run build
```

ผลลัพธ์ที่คาดหวัง:
- Unit tests: PASS
- Syntax check: PASS
- Build: PASS

---

## ขั้นตอน Release

### 1. Pre-release Checklist

```bash
# ตรวจสอบว่าไม่มี secret ใน code
npm run scan:secrets

# รัน full smoke test
npm run smoke:full
```

### 2. Create Release Branch

```bash
git checkout -b release/v6.1
git push origin release/v6.1
```

### 3. Tag Release

```bash
git tag -a v6.1.0 -m "Version 6.1 Release"
git push origin v6.1.0
```

---

## สิ่งที่ห้ามทำใน Release

1. ❌ **ห้ามแนบ `.env` จริง** ขึ้น repo
2. ❌ **ห้ามแนบ token จริง** ใน code หรือ comment
3. ❌ **ห้ามแนบ outputs/** ข้อมูลจริง
4. ❌ **ห้ามเปิด ENABLE_REAL_ACTIONS=1** เป็น default
5. ❌ **ห้ามเปิด real action** โดยไม่แจ้ง user ก่อน

---

## ข้อมูลสำหรับ User ใหม่

หลัง release ให้แจ้ง:
- วิธีติดตั้ง
- วิธีใช้ demo mode
- คำเตือนความปลอดภัย
- วิธี enable real actions (ถ้าต้องการ)

---

*อัปเดตล่าสุด: มกราคม 2569*
