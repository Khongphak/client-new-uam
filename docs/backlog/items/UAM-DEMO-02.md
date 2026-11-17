---
title: "[UAM-DEMO-02] Demo mock ส่วนที่เหลือ: Menus, SystemToSystem, Reports, role menu ต่อ role + ต่อกับ typed client"
labels: ["feature", "demo", "P2", "wave-3"]
---

# 🎭 UAM-DEMO-02 — Demo mock ส่วนที่เหลือ: Menus, SystemToSystem, Reports, role menu ต่อ role + ต่อกับ typed client

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-DEMO-02` |
| ประเภท | ✨ feature |
| Priority | 🟡 **P2** (score 65) |
| 🌊 Wave (ลำดับการทำ) | 3 |
| 🌿 Branch | `feature/UAM-DEMO-02-demo-mock-remaining` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-DEMO-01](UAM-DEMO-01.md), [UAM-API-01](UAM-API-01.md) |

## 📝 Description
ต่อยอด UAM-DEMO-01: เติมตัวตอบของ endpoint ที่ยังขาดในโหมด demo (Menus, SystemToSystem, Reports, role menu ต่อ role, `get-userRole-byId`, `add-useraccess-history`) และต่อ demo เข้ากับ typed client ของ UAM-API-01 พร้อม test ที่เรียกผ่าน client จริง

## ✅ Expected result
ทุก endpoint ในสัญญาที่หน้าจอใช้มีตัวตอบ; production build ไม่มีโค้ด demo (`npm run check:no-demo`)

## ☑️ Acceptance criteria
- ☑️ ตัวตอบของ endpoint หัวข้อ 1–5 ใน issue #61 + unit test
- ☑️ test เรียกผ่าน clients ของ API-01 กับ demo interceptor
- ☑️ `build:demo` ผ่านและไม่เรียก host ภายนอก; production ไม่มีโค้ด demo
- ☑️ ไม่มีข้อมูลจริง/secret

> 📌 สถานะ: โค้ดเสร็จ merge แล้ว (PR #63) — รายงาน "Excel" ใน demo เป็นไฟล์ข้อความ ไม่ใช่ `.xlsx` จริง
