# 🤖 UAM E2E Bot (Python + Playwright)

> ⏸️ **สถานะ: ร่างโครง — ยังไม่ใช้งานจริง** รอ build Phase 1 เสร็จก่อน (ดู [docs/testing/PHASES.md](../docs/testing/PHASES.md)) แล้วค่อยปรับ `cases/*.yaml` ให้ตรงกับ test case ใน `docs/testing/test-cases/` (ต้นฉบับ) และแอปที่รันได้จริง ตอนนี้เก็บไว้เป็นโครง/selftest เท่านั้น

บอทรัน E2E **ของแอปใหม่ใน repo นี้** (ไม่ผูกกับโค้ดโปรเจกต์เก่า — ชี้ด้วย `--base-url`) แล้วสร้าง:
- 📊 รายงาน `report.html` / `report.md` / `results.json`
- 🧭 คัดแยกเคสที่ไม่ผ่าน (`triage.json`) ว่า **เปิด bug issue / เสนอ backlog ใหม่ / คาดว่ายังไม่ผ่านเพราะ backlog ยังไม่เสร็จ / flaky / ปัญหา env** + ร่าง issue พร้อมหลักฐานใน `issues/`
- 📸 Screenshot ทุก step ที่ระบุ (`screenshots/<case>/<viewport>/`) + ร่างคู่มือผู้ใช้ `manual/MANUAL.md`

## ติดตั้ง
```bash
cd e2e-bot
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
playwright install chromium        # หรือตั้ง UAM_CHROMIUM=/path/to/chrome
```

## ใช้งาน
```bash
python -m uam_e2e selftest                      # ตรวจว่าบอทเองทำงาน (แอปจำลองในเครื่อง)
python -m uam_e2e list                          # ดู case ทั้งหมด
```
```bash
export UAM_ADMIN_USER=... UAM_ADMIN_PASS=...    # ต่อ role (ดู config.yaml) ห้าม commit
python -m uam_e2e run --base-url http://localhost:4200
```
ตัวเลือก: `--epic SYS USR` · `--backlog UAM-SYS-02` · `--id 'E2E-ROL'` · `--viewport phone` · `--retries 2` · `--shots-all --hires` (เก็บภาพทำคู่มือ) · `--headed`
Exit code = 1 ถ้ามีเคสล้ม (ใช้ใน CI ได้)

## เขียน case (YAML ใน `cases/`)
```yaml
- id: E2E-SYS-003                 # E2E-<EPIC>-nnn
  title: "เปิด drawer ผ่าน deep link"
  backlog: [UAM-SYS-02]           # ผูก backlog → ใช้คัดแยก issue
  severity: critical              # critical | major | minor
  role: ADMIN                     # ล็อกอินล่วงหน้า (ไม่ใส่ = ยังไม่ล็อกอิน)
  viewports: [desktop, phone]     # 1440×900 และ 390×844
  requires_env: [UAM_ADMIN_USER]  # ไม่มี env → skipped
  depends_on: [E2E-SYS-001]       # ล้ม → blocked
  manual: {section: "System Setting", title: "ดูรายละเอียด"}   # ใส่แล้วภาพจะเข้าคู่มือ
  steps:
    - goto: /setting/system-setting
    - click: "@row-open-first"
    - shot: drawer
      caption: รายละเอียดเปิดในแถบด้านขวา
```
Actions: `goto click dblclick hover fill press check uncheck select drag wait resize reload` · `expect_visible expect_hidden expect_enabled expect_disabled expect_text expect_no_text expect_value expect_count expect_url` · `mock mock_abort download shot`

## 🧱 สัญญาถึงแอปใหม่: `data-testid`
selector `@name` = `[data-testid="name"]` ทีมพัฒนาต้องใส่ `data-testid` ตามที่ case ใช้ (ดูจาก `grep -oh '"@[a-z0-9-]*"' cases/*.yaml | sort -u`) — ควรเพิ่มเป็นข้อตกลงใน Definition of Done ของแต่ละ backlog

## การคัดแยก (triage)
| หมวด | ความหมาย | action |
|---|---|---|
| `env` | เชื่อมต่อไม่ได้/เซิร์ฟเวอร์ไม่ขึ้น | ไม่เปิด issue |
| flaky | ล้มรอบแรกแต่ผ่านตอน retry | เฝ้าดู |
| `ui-missing` / `assertion` / `js-error` / `server` | element/ข้อความ/JS error/HTTP 5xx | **bug** ถ้า backlog เสร็จหรือไม่ทราบสถานะ; **expected** ถ้า backlog เป็น `todo/doing` ใน `docs/backlog/status.json` |
| case ไม่มี backlog | ไม่มีงานรองรับ | **เสนอ backlog ใหม่** |

ร่าง issue (`issues/*.md`) มี front matter `title`/`labels`/`fingerprint` (กันเปิดซ้ำ) — บอท**ยังไม่สร้าง issue เอง**; ตรวจร่างแล้วค่อยเปิด

## ข้อจำกัด
- case ในโฟลเดอร์ `cases/` เขียนตามสเปก/ดีไซน์ ยังไม่เคยรันกับแอปจริง (ยังไม่มีแอป) — selector และ flow ต้องปรับให้ตรงเมื่อมีแอป
- ไฟล์ `.dc.html` ในดีไซน์เรนเดอร์เองไม่ได้ จึงไม่ใช้เป็นเป้าหมายทดสอบ
