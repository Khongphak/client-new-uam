# CLAUDE.md — กติกาของ agent ใน client-new-uam

โปรเจกต์: **UI ใหม่ของ UAM (User Access Management)** — Angular 22 (zoneless, standalone, signals) + PrimeNG 22 (@primeuix/themes) + PrimeIcons 8 + PrimeFlex 4 + Vitest (ไม่ใช้ NgRx — state ด้วย signals) — ดู [ADR-0001](docs/architecture/ADR-0001-latest-stack.md)
ภาพรวม: [README.md](README.md) · สเปก: [docs/design-spec/README.md](docs/design-spec/README.md) · Backlog: [docs/backlog/](docs/backlog/BACKLOG.md) · Test case: [docs/testing/](docs/testing/test-cases/README.md) · Workflow เต็ม: [docs/workflow/WORKFLOW.md](docs/workflow/WORKFLOW.md)

## 1. กฎแข็ง (ห้ามฝ่าฝืน ทุกบทบาท)
1. **ห้ามแก้หลังบ้าน**: ห้ามต้องการฟิลด์ใหม่ใน Model Response, ห้ามเปลี่ยน payload ที่ส่ง, ใช้ได้เฉพาะฟิลด์ใน `src/app/shared/interfaces/**`
2. **Clean-room — ห้ามอิงโค้ดโปรเจกต์เก่า (`client-uam-develop`) เด็ดขาด**: ห้ามเปิดอ่าน/คัดลอก/พอร์ต/แปลง/เลียนโครงสร้าง ชื่อไฟล์ ชื่อคลาส หรือแพตเทิร์นของโค้ดเดิม; ที่มาของ requirement มีเพียง **สเปก+ดีไซน์ใน `docs/`** และ **สัญญา backend** (ฟิลด์/payload/RESULT_CODE จาก API spec ที่ผู้ใช้ระบุ — ดู UAM-API-01) ชื่อ path เดิมที่เห็นในเอกสารเป็นแค่ "ที่มาของ requirement" ห้ามใช้เป็นแนวทาง implement ทุกชั้นต้อง **refactor/ออกแบบใหม่** (ไม่ใช่แค่เปลี่ยน state management): state ด้วย signals (ไม่ใช้ NgRx), routing/guard/interceptor แบบ functional, typed HTTP client + mapper, error model กลาง, message catalog แบบ typed, permission policy แบบ typed, ตาราง/ฟิลเตอร์/ฟอร์มใหม่, ตั้งชื่อตาม Angular style guide ล่าสุด — ไฟล์ดีไซน์ `docs/design-spec/project/*.dc.html` เป็นแค่ต้นแบบ ห้ามคัดลอกไปใช้ตรงๆ; ถ้าไม่แน่ใจว่าพฤติกรรมไหนมาจาก backend ให้ถาม PM/ผู้ใช้ **ห้ามไปดูโค้ดเก่า**
3. **ทุกงานต้องมี backlog code** (`UAM-<EPIC>-<nn>`) และ branch ใหม่จาก `develop` ชื่อ `<type>/<CODE>-<slug>` ห้าม commit ตรงเข้า `develop`/`main`
4. **ห้าม merge PR ของตัวเอง**; merge เข้า `develop` เฉพาะ Senior Dev; `develop → main` และ deploy production ต้องให้**ผู้ใช้อนุมัติ**
5. **ห้ามข้าม/ปิด/แก้ test ให้ผ่าน** และห้ามรายงานว่าสำเร็จถ้ายังไม่ได้รันจริง — รายงานผลตามจริงพร้อมหลักฐาน
6. ห้ามใส่ secret/credential/ข้อมูลส่วนตัวใน repo, commit, PR หรือ issue
7. ถ้า backlog/สเปกขัดกับของจริง **หยุดแล้วแจ้ง PM** อย่าเดา
8. ห้ามทำเกินขอบเขต backlog ที่ได้รับ (งานที่เจอเพิ่มให้เสนอ PM เปิด issue ใหม่)

## 2. บทบาท (ใช้ subagent ใน `.claude/agents/`)
| บทบาท | ไฟล์ | ทำอะไร | ห้ามทำ |
|---|---|---|---|
| 🧭 PM | `pm` | ออกแบบ architecture, test case, แตก backlog จากความต้องการของผู้ใช้ (ร่วมกับ Senior), อ่านผล QA แล้วตัดสินร่วมกับผู้ใช้ว่าตีกลับหรือเปิด issue ใหม่, เมื่อผู้ใช้เริ่ม session ให้สรุปสถานะ+ถามว่าจะทำอะไรต่อ (stand-up), ดูแลเอกสาร | เขียนโค้ดแอป, merge PR |
| 🧑‍💻 Senior Dev | `senior-dev` | รีวิว backlog จาก PM, จ่ายงานให้ Dev ตามความเหมาะสม, รีวิวและ merge PR ของ Junior/Senior ตัวอื่น, ทำงานยาก/ใหญ่เอง | merge PR ตัวเอง |
| 👶 Junior Dev | `junior-dev` | implement ตาม backlog ที่ได้รับ + unit test + commit สื่อความหมาย | merge, แก้ขอบเขตงาน, แก้สเปก |
| 🧪 QA | `qa` | รัน test case จริง, เขียนบอท E2E, รายงานผลตามจริงไป PM พร้อมเสนอ "ตีกลับ/issue ใหม่" | แก้โค้ดแอปเพื่อให้ test ผ่าน |

การส่งต่องาน = GitHub issue/PR + label (ดู §4) ไม่ส่งต่อด้วยการเล่าปากเปล่า

## 3. Skill ที่**ต้อง**ใช้
- **ทุกงานที่เขียน/แก้โค้ด (Dev ทุกคน):** `karpathy-guidelines` (`.claude/skills/karpathy-guidelines`) — คิดก่อนเขียน, เรียบง่าย, แก้เฉพาะที่จำเป็น, ทำตามเป้าที่ตรวจสอบได้
- **งาน frontend (หน้าจอ/คอมโพเนนต์/สไตล์):** ใช้ skill `frontend-design:frontend-design` **หรือ** `superdesign:superdesign` เสมอ — แต่ต้องอยู่ในกรอบสเปก: ตรงกับ artboard + `uam.css` tokens ไม่คิดดีไซน์ใหม่เองทับสเปก; แล้วทำตาม `uam-frontend-implement`
- Skill ของ workflow (ใน `.claude/skills/`): `uam-pick-backlog`, `uam-open-pr`, `uam-review-pr`, `uam-qa-run`, `uam-daily-standup`, `uam-backlog-sync`, `uam-frontend-implement`
- `karpathy-guidelines` ในโปรเจกต์เป็นสรุปหลักการ 4 ข้อฉบับย่อ — ถ้าในเครื่องมี skill Karpathy ตัวจริงติดตั้งอยู่ให้เรียกตัวนั้นด้วย

> **หมายเหตุ branch protection:** repo เป็น public และตั้ง ruleset แล้ว — `develop`: ต้องผ่าน PR + status check `build-test` (approvals = 0 เพื่อให้ Senior merge ได้), ห้าม force push/ลบ; `main`: ผู้ใช้เป็นคน merge เท่านั้น → ห้าม push ตรงเข้าสองสาขานี้ ทุกการเปลี่ยน (รวมเอกสาร) ผ่าน PR

## 4. Workflow และ label
```text
ผู้ใช้ → PM (+Senior): requirement → architecture / test case / backlog item → เปิด issue
Senior: รีวิว issue → ติด role:junior|role:senior → status:ready
Dev: uam-pick-backlog → branch → TDD → uam-open-pr → status:in-review
Senior (ไม่ใช่ผู้เขียน): uam-review-pr → squash merge เข้า develop → status:qa
QA: uam-qa-run บน develop → ผ่าน = status:done ; ไม่ผ่าน = รายงาน PM (qa:failed)
PM + ผู้ใช้: ตัดสิน "ตีกลับ issue เดิม" หรือ "issue ใหม่" ; ผู้ใช้เปิด session ใหม่ → PM สรุปสถานะและถามเอง (ไม่มี schedule อัตโนมัติ)
ผู้ใช้: อนุมัติ develop → main → deploy
```
Label: `status:backlog|ready|in-progress|in-review|qa|done|blocked` (`backlog` = เปิดแล้วแต่ dependency ยังไม่ครบ/ยังไม่ผ่านรีวิว Senior) · `epic:<epic>` · `role:junior|senior|qa|pm` · `type:feature|bug|chore|design|test` · `P0..P3` · `wave-N` · `qa:failed`
เริ่มงานได้เมื่อ **dependency ทุกตัวเป็น `status:done`** (ดู `Depends on` ใน item) และไม่ติด `status:blocked`

## 5. Git / commit / PR
- Branch: `<type>/<CODE>-<slug>` จาก `develop` ล่าสุด (`feature/UAM-ERR-01-404-page`)
- Commit: Conventional Commits + code — `feat(UAM-ERR-01): add 404 page` · `test(UAM-ERR-01): cover notfound route` · `fix(...)`, `chore(...)`, `docs(...)`; 1 commit = 1 เรื่อง ข้อความบอก**ทำไม**ถ้าไม่ชัด
- PR: ใช้ `.github/PULL_REQUEST_TEMPLATE.md` ครบทุกช่อง · base = `develop` · `Closes #<issue>`
- ต้องรันก่อนเปิด PR: `npm run test:ci` และ `npm run build` ผ่านทั้งคู่
- Merge: squash เข้า `develop` โดย Senior (ไม่ใช่ผู้เขียน) หลัง CI ผ่านและรีวิวผ่าน

## 6. คำสั่งที่ใช้บ่อย
```bash
npm ci                                  # ติดตั้ง (Node ≥ 22.22)
npm start                               # ng serve
npm run build                           # build
npm run test:ci
```
unit test ใช้ Vitest+jsdom (ไม่ต้องมี Chrome); Chrome จำเป็นเฉพาะ Playwright/screenshot ในคลาวด์: `export CHROME_BIN=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`
> ⚠️ ระหว่างย้ายไป stack ใหม่ (UAM-FND-01) สคริปต์ `test:ci` ยังไม่มีในแอปเดิม — ห้ามใช้แอป Angular 17 เดิมเป็นฐานของงานใหม่

## 7. Definition of Done (ต่อ backlog)
ตรง artboard (desktop + phone ถ้ามี) · ใช้เฉพาะฟิลด์เดิม · payload ไม่เปลี่ยน · มี unit test ของ logic ใหม่ · test case ที่ผูกไว้ (`TRACEABILITY.md`) ผ่านเมื่อ QA ทดสอบ · CI เขียว · PR ผ่านรีวิว · เอกสารที่เกี่ยวข้องอัปเดต (PM/ผู้เขียน)

## 8. ใครดูแลเอกสารไหน
PM: `docs/backlog`, `docs/testing`, `docs/architecture`, `docs/reports`, `README.md` · Senior: `CLAUDE.md`/architecture ที่เกี่ยวกับโค้ด (ร่วมกับ PM) · QA: `docs/qa/results`, `e2e-bot/` · Dev: เอกสารในโค้ด/README ของโมดูลที่ตัวเองสร้าง
