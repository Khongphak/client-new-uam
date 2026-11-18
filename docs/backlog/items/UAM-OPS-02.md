---
title: "[UAM-OPS-02] สคริปต์สร้าง docs/backlog/status.json จาก label ของ issue"
labels: ["chore", "ops", "P2", "wave-3"]
---

# 🧹 UAM-OPS-02 — สคริปต์สร้าง `status.json` จาก label ของ issue

| ฟิลด์ | ค่า |
|---|---|
| Code | `UAM-OPS-02` |
| ประเภท | 🧹 chore |
| Priority | 🟡 **P2** (score 68) |
| ⭐ Value / 🔓 Unblocks / 💪 Effort | 3 / 4 / 2 pts |
| 🌊 Wave (ลำดับการทำ) | 3 |
| 🌿 Branch | `chore/UAM-OPS-02-gen-status` (แตกจาก `develop`) |
| ⛓️ Depends on | [UAM-OPS-01](UAM-OPS-01.md) |
| 🚧 Blocks | — |

## 📝 Description
`status.json` เป็นสถานะซ้ำกับ label ของ issue และต้องแก้ด้วยมือ ทำให้ไม่ตรงกัน (REVIEW.md ข้อ 7) ให้ label ของ issue เป็นแหล่งจริงแล้วสร้างไฟล์จากมันด้วยสคริปต์

## 🎯 Design reference
- Artboard: -
- ที่มาของ requirement: `docs/workflow/REVIEW.md` ข้อ 7, `docs/workflow/SESSION-PROMPTS.md` หัวข้อ F

## 🐞 Actual result (ปัจจุบัน)
`status.json` อัปเดตด้วยมือหลัง merge; label ของ issue (เช่น #55) อาจค้างไม่ตรงกับสถานะจริง

## ✅ Expected result
`gh issue list ... | node scripts/gen-status.mjs` เขียน `docs/backlog/status.json`; `--check` exit 1 เมื่อ label ไม่ตรงกับสถานะ issue

## 🛠️ แนวทางการแก้ไข
- `scripts/gen-status.mjs` (pure, ไม่แตะ network/token, ไม่เพิ่ม dependency) รับ JSON ของ `gh issue list --state all --limit 200 --json number,state,stateReason,labels` ทาง stdin หรือ path; labels เป็น string หรือ `{name}`
- แมป: `status:done|qa` → done · `status:in-progress|in-review` → doing · `status:backlog|ready|blocked` → todo (blocked เตือน) · ปิดแบบ completed แต่ label ค้าง → done + เตือน · ปิดแบบ not_planned → เตือน ไม่ใส่ done · หลายตัว/ไม่มี/ไม่พบ issue → เตือนแล้ว todo
- คงคีย์ `_comment`, เรียงคีย์ตาม `issue-map.json`, npm script `gen:status`
- test: `scripts/gen-status.test.mjs` (`node:test`) ถูกหยิบโดย `test:scripts`

## ☑️ Acceptance criteria
- ☑️ unit test ผ่านใน `npm run test:ci`
- ☑️ `--check` exit 1 เมื่อพบ label ไม่ตรง
- ☑️ ไม่มี token/secret/dependency ใหม่
- ☑️ อธิบายวิธีรันใน SESSION-PROMPTS.md หัวข้อ F และ REVIEW.md ข้อ 7
