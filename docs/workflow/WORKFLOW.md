# 🔄 Workflow การทำงานของ agent (PM · Senior Dev · Junior Dev · QA)

เอกสารนี้อธิบายภาพรวม — กติกาที่ agent ต้องทำตามจริงอยู่ที่ [`CLAUDE.md`](../../CLAUDE.md) และ `.claude/agents/*.md`

## 1. ผังการไหลของงาน
```text
         ผู้ใช้ (requirement / ตัดสินใจ / อนุมัติ main + deploy)
            │ ▲
            ▼ │  รายงาน 07:00
   ┌──────── PM ────────┐     ปรึกษาเทคนิค
   │ architecture (ADR) │◀──────────────┐
   │ test case (.md)    │               │
   │ backlog + issue    │               ▼
   └─────────┬──────────┘          Senior Dev ── รีวิว backlog / จ่ายงาน
             │ ผลทดสอบ                  │  role:junior | role:senior
             │                          ▼
        ┌────┴────┐              Junior / Senior Dev
        │   QA    │◀── merge ──  branch → TDD → PR → รีวิว (Senior คนละคน) → squash → develop
        └─────────┘
   ผ่าน → status:done        ไม่ผ่าน → qa:failed → PM+ผู้ใช้ตัดสิน: ตีกลับ / issue ใหม่
```

## 2. วงจรของ 1 backlog
| # | ใคร | ทำอะไร | หลักฐาน/สถานะ |
|---|---|---|---|
| 1 | ผู้ใช้ → PM | ส่ง requirement | issue `[REQ]` หรือบอกในแชต |
| 2 | PM (+Senior) | ADR, test case, item, issue | `docs/architecture`, `docs/testing`, `docs/backlog`, issue |
| 3 | Senior | รีวิว/จ่ายงาน | `role:*` + `status:ready` |
| 4 | Dev | `uam-pick-backlog` → TDD → `uam-open-pr` | branch `<type>/<CODE>-<slug>`, PR → `status:in-review` |
| 5 | Senior (≠ ผู้เขียน) | `uam-review-pr` → squash merge `develop` | `status:qa` |
| 6 | QA | `uam-qa-run` | `docs/qa/results/`, `status:done` หรือ `qa:failed` |
| 7 | PM + ผู้ใช้ | ตัดสิน ตีกลับ/issue ใหม่ | issue เดิมกลับ `status:ready` หรือ issue ใหม่ |
| 8 | ผู้ใช้ | อนุมัติ `develop → main` / deploy | PR `develop → main` |

## 3. ตีกลับ vs เปิด issue ใหม่ (เกณฑ์ที่ QA เสนอ → PM+ผู้ใช้ตัดสิน)
| สถานการณ์ | ตัดสิน |
|---|---|
| ไม่ผ่านเกณฑ์/acceptance ของ story ที่เพิ่ง merge, หรือ regression จาก PR นั้น | **ตีกลับ** issue เดิม (`qa:failed` → กลับ `status:ready`, Dev คนเดิมแก้) |
| บั๊กนอกขอบเขตของ story / บั๊กที่มีอยู่ก่อน / ต้องออกแบบเพิ่ม | **issue ใหม่** (PM แตก backlog, ลำดับตาม priority) |
| สเปกหรือ test case ผิด/ขาด | PM แก้เอกสาร (อาจเปิด `design` item) |
| env/ข้อมูลทดสอบผิด | ไม่ใช่ bug — แก้ env แล้ว QA รันใหม่ |

## 4. รายงาน 07:00
PM รันก่อนเวลา (ตั้งเวลา 06:45 เวลาไทย) ด้วย `uam-daily-standup` → `docs/reports/daily/<วันที่>.md` + สรุปให้ผู้ใช้: เสร็จแล้ว · กำลังทำ · QA ไม่ผ่าน (พร้อมข้อเสนอ) · ติดขัด · ควรทำต่อ · ขอการตัดสินใจ (เริ่มได้เลยไหม) — **agent ไม่เริ่มงานใหม่เองจนกว่าผู้ใช้ตอบ**

## 5. Skills
| Skill | ใครใช้ | เมื่อไร |
|---|---|---|
| `karpathy-guidelines` (โปรเจกต์) | Dev ทุกคน (และ QA ตอนเขียนบอท) | ทุกครั้งที่เขียนโค้ด |
| `frontend-design` / `superdesign` | Dev | ทุกงาน frontend (ภายใต้สเปก) |
| `uam-frontend-implement` | Dev | งาน frontend |
| `uam-pick-backlog` · `uam-open-pr` | Dev | เริ่ม/จบงาน |
| `uam-review-pr` | Senior | รีวิว/merge |
| `uam-qa-run` | QA | ทดสอบ/บอท |
| `uam-daily-standup` · `uam-backlog-sync` | PM | รายงานประจำวัน / ซิงก์ backlog |

## 6. ที่ยังต้องทำโดยคนที่เป็นเจ้าของ repo
- ตั้ง **branch protection**: `develop` และ `main` ห้าม push ตรง, ต้องผ่าน CI `build-test`, ต้องมี review; `main` ให้เฉพาะผู้ใช้ merge
- สร้าง label ทั้งหมดใน §4 ของ CLAUDE.md
- ตัดสินใจเรื่อง deploy (ที่ไหน/กี่ environment) → จะเพิ่ม pipeline deploy เป็น backlog ต่อไป
- ยืนยัน `UAM-SHL-03` และ `UAM-DSN-01`
