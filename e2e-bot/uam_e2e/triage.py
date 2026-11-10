"""คัดแยกเคสที่ไม่ผ่าน → ควรเปิด bug issue / ผูก backlog เดิม / เป็น backlog ใหม่ / ไม่ต้องเปิด"""
from __future__ import annotations
import hashlib, json, re
from pathlib import Path

EPIC_LABEL = {"AUT": "auth", "RBAC": "rbac", "SYS": "system-setting", "USR": "users", "ROL": "roles", "RPT": "report", "ERR": "errors", "RSP": "responsive", "HOM": "home"}


def classify(r: dict) -> str:
    e = r.get("error") or {}
    msg = (e.get("message") or r.get("reason") or "")
    col = r.get("collector") or {}
    if re.search(r"ERR_CONNECTION_REFUSED|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION_TIMED_OUT", msg + " ".join(col.get("request_failed", []))) and not col.get("http_5xx"):
        return "env"
    if col.get("http_5xx"):
        return "server"
    if col.get("page_errors"):
        return "js-error"
    if "element(s) not found" in msg or "waiting for" in msg.lower():
        return "ui-missing"
    return "assertion"


def load_status(path: str | None) -> dict:
    if path and Path(path).exists():
        return json.loads(Path(path).read_text(encoding="utf-8"))
    return {}


def triage(results: list[dict], backlog_status: dict) -> list[dict]:
    out = []
    for r in results:
        if r["status"] not in ("failed", "error") and not r.get("flaky"):
            continue
        cat = "flaky" if r.get("flaky") else ("env" if r["status"] == "error" else classify(r))
        codes = r.get("backlog") or []
        st = {c: backlog_status.get(c, "unknown") for c in codes}
        pending = codes and all(v in ("todo", "doing") for v in st.values())
        if cat == "env":
            action, why = "ignore", "ปัญหาสภาพแวดล้อม/การเชื่อมต่อ ไม่ใช่ bug ของแอป — ตรวจ base_url, เซิร์ฟเวอร์, credential แล้วรันใหม่"
        elif cat == "flaky":
            action, why = "watch", "ไม่ผ่านครั้งแรกแต่ผ่านเมื่อ retry — ติดตามไว้ ถ้าเกิดซ้ำ ≥3 รอบให้เปิด issue ประเภท test-stability"
        elif not codes:
            action, why = "new-backlog", "ไม่มี backlog รองรับ case นี้ — ตรวจว่าเป็นข้อกำหนดที่ขาดในสเปก แล้วเสนอเป็น backlog ใหม่"
        elif pending:
            action, why = "expected", f"backlog {', '.join(codes)} ยังไม่เสร็จ (todo/doing) — คาดว่าจะยังไม่ผ่าน ไม่ต้องเปิด issue"
        elif cat == "server":
            action, why = "bug", "เจอ HTTP 5xx — แจ้งทีม backend เป็นข้อมูล (โปรเจกต์นี้ห้ามแก้หลังบ้าน) และตรวจว่าหน้าบ้านแสดง error ตามดีไซน์"
        else:
            action, why = "bug", f"backlog {', '.join(codes)} ถูกระบุว่าเสร็จ/ไม่ทราบสถานะ แต่ case ไม่ผ่าน — เปิด bug ผูกกับ backlog เดิม"
        e = r.get("error") or {}
        fp = hashlib.sha1(f"{r['id']}|{r['viewport']}|{cat}|{e.get('action')}".encode()).hexdigest()[:10]
        out.append({"id": r["id"], "viewport": r["viewport"], "title": r["title"], "category": cat, "action": action,
                    "why": why, "backlog": codes, "backlog_status": st, "severity": r["severity"],
                    "fingerprint": fp, "result": r})
    return out


def write_drafts(items: list[dict], out: Path):
    d = out / "issues"
    d.mkdir(parents=True, exist_ok=True)
    for old in d.glob("*.md"):
        old.unlink()
    idx = []
    for t in items:
        if t["action"] not in ("bug", "new-backlog"):
            continue
        r, e = t["result"], t["result"].get("error") or {}
        kind = "bug" if t["action"] == "bug" else "backlog-candidate"
        labels = [kind, f"sev-{t['severity']}", t["category"], r["viewport"]] + [EPIC_LABEL.get(r["epic"], r["epic"].lower())]
        title = f"[{'/'.join(t['backlog']) or 'NEW'}] {kind.replace('-', ' ').title()}: {t['title']} ({r['viewport']})"
        shot = f"screenshots/{r['id']}/{r['viewport']}/{e.get('screenshot')}" if e.get("screenshot") else "-"
        steps = "\n".join(f"{s['n']}. `{s['action']}` — {s['status']}" + (f" → {s.get('error','')}" if s['status'] == 'failed' else "") for s in r.get("steps", []))
        col = r.get("collector", {})
        body = f"""---
title: "{title}"
labels: {json.dumps(labels, ensure_ascii=False)}
fingerprint: {t['fingerprint']}
---

## 🐞 Actual result
ไม่ผ่านที่ step {e.get('step')} (`{e.get('action')}`): {e.get('message')}
URL ตอนล้มเหลว: `{e.get('url')}`

## ✅ Expected result
{r['title']} (case `{r['id']}`, viewport {r['viewport']}, role {r.get('role') or 'ไม่ล็อกอิน'})

## 🔁 ขั้นตอนที่รัน
{steps}

## 🧭 การคัดแยกโดยบอท
- หมวด: **{t['category']}** · action: **{t['action']}** · severity: {t['severity']}
- เหตุผล: {t['why']}
- Backlog ที่เกี่ยวข้อง: {', '.join(f'{c} ({s})' for c, s in t['backlog_status'].items()) or '-'}

## 📎 หลักฐาน
- Screenshot: `{shot}`
- Trace: `screenshots/{r['id']}/{r['viewport']}/{e.get('trace','-')}`
- HTTP 5xx: {col.get('http_5xx') or '-'}
- JS errors: {col.get('page_errors') or '-'}
- Console errors: {col.get('console_errors') or '-'}
"""
        fn = f"{t['fingerprint']}-{r['id']}-{r['viewport']}.md"
        (d / fn).write_text(body, encoding="utf-8")
        idx.append({"file": fn, "title": title, "labels": labels, "fingerprint": t["fingerprint"]})
    (d / "issues.json").write_text(json.dumps(idx, ensure_ascii=False, indent=2), encoding="utf-8")
    return idx
