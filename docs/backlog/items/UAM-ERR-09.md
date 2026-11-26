---
title: "[UAM-ERR-09] dialog error ไม่ขึ้นทันทีเมื่อ rxResource ของหน้า Home/Report ล้ม (ต้องคลิก/กด Esc ก่อน) — BUG-1 จาก QA"
labels: ["bug", "err", "P1", "wave-5"]
---

# 🐞 UAM-ERR-09 — dialog error ไม่ขึ้นทันทีเมื่อ resource ของหน้าล้ม

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-ERR-09` |
| ประเภท | 🐞 bug |
| Priority | 🟠 **P1** (score 78) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 4 / 4 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 5 |
| 🌿 Branch | `fix/UAM-ERR-09-dialog-on-resource-error` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-ERR-03](UAM-ERR-03.md) (done) |
| 🚧 Blocks | — |
| 🔗 Issue | #106 |
| 🧪 Test case | TC-ERR-002, TC-ERR-003, TC-ERR-004 |

## 📝 Description
BUG-1 (Medium) จาก QA รอบ 2026-11-26 บน develop `eafa0d8` (รายงาน `docs/qa/results/2026-11-26-wave4-HOM-01.md`) — ผู้ใช้อนุมัติให้เปิด issue ใหม่ ไม่ตีกลับ UAM-ERR-03

## 🎯 Design reference
- Artboard: DlgSession, DlgNetwork, DlgServer (ไม่เปลี่ยนดีไซน์)

## 🐞 Actual result (ปัจจุบัน)
เมื่อ request ที่ล้ม (40102 / status 0 / 5000x) เป็น `rxResource` ของหน้า Home หรือ Report หน้าว่างและ dialog ไม่ขึ้น (ตรวจ 30 วินาที) จนกว่าผู้ใช้จะคลิกหรือกด Esc 1 ครั้ง (Tab/พิมพ์/เลื่อน/resize ไม่ทำให้ขึ้น) ส่วน request ที่ผู้เรียกจัดการ error เอง (login) ขึ้นทันที
Console: `API error: network at … computation`
สมมติฐาน (ยังไม่ยืนยัน): template อ่าน `systems.value()` ขณะ resource อยู่ในสถานะ error → throw ระหว่าง render

## ✅ Expected result
dialog (session/network/server) ขึ้นทันทีเมื่อ API ล้ม ทุกหน้า

## 🛠️ แนวทางการแก้ไข
- Senior ตัดสินว่าแก้ที่หน้า (อ่าน resource อย่างปลอดภัยตอน error — เกี่ยวกับ HOM-02/RPT-02/ERR-05) หรือที่ dialog host ให้ทนต่อ error ทุกหน้า
- ห้ามเปลี่ยน logic retry/refresh/logout; ห้ามเปลี่ยน payload/ฟิลด์
- reproduce: `prod8.mjs` / `prod10.mjs` / `prod11.mjs` ใน `docs/qa/results/2026-11-26-playwright/` (production build + `page.route`)

## ☑️ Acceptance criteria
- ☑️ unit test: resource ล้มแล้ว dialog ขึ้นโดยไม่ต้อง interact
- ☑️ TC-ERR-002/003/004 ผ่านผ่านหน้า Home และ Report (QA รันซ้ำ)
- ☑️ ไม่มี `API error … computation` ใน console
- ☑️ ใช้เฉพาะฟิลด์ใน `shared/interfaces/**` และ payload ไม่เปลี่ยน
- ☑️ ผ่าน lint/build/test ใน CI
