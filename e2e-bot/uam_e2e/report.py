from __future__ import annotations
import html, collections
from pathlib import Path
from .runner import ICON

ACT = {"bug": "🐞 เปิด bug issue", "new-backlog": "🆕 เสนอ backlog ใหม่", "expected": "⏳ คาดว่ายังไม่ผ่าน (backlog ยังไม่เสร็จ)",
       "watch": "👀 เฝ้าดู (flaky)", "ignore": "🔌 ไม่ใช่ bug ของแอป"}


def summary(results):
    c = collections.Counter(r["status"] for r in results)
    return c, len(results)


def write_markdown(data, triaged, out: Path):
    rs = data["results"]
    c, n = summary(rs)
    L = [f"# 📊 รายงานผล E2E", "", f"- เวลา: {data['generated_at']}", f"- Base URL: `{data['base_url']}`",
         f"- ทั้งหมด **{n}** รอบ: " + " · ".join(f"{ICON[k]} {k} {v}" for k, v in c.items()),
         f"- flaky: {sum(1 for r in rs if r.get('flaky'))}", "", "## ตามกลุ่ม (epic)", "", "| Epic | ผ่าน | ไม่ผ่าน | อื่นๆ |", "|---|---|---|---|"]
    by = collections.defaultdict(list)
    for r in rs: by[r["epic"]].append(r)
    for ep, xs in sorted(by.items()):
        p = sum(x["status"] == "passed" for x in xs); f = sum(x["status"] in ("failed", "error") for x in xs)
        L.append(f"| {ep} | {p} | {f} | {len(xs)-p-f} |")
    L += ["", "## ผลรายเคส", "", "| | Case | Viewport | ชื่อ | Backlog | หมายเหตุ |", "|---|---|---|---|---|---|"]
    for r in rs:
        note = r.get("reason") or (r.get("error") or {}).get("message", "") or ("flaky" if r.get("flaky") else "")
        L.append(f"| {ICON[r['status']]} | {r['id']} | {r['viewport']} | {r['title']} | {', '.join(r['backlog'])} | {note[:120]} |")
    L += ["", "## 🧭 ต้องทำอะไรต่อกับเคสที่ไม่ผ่าน", ""]
    if not triaged: L.append("ไม่มี 🎉")
    for t in triaged:
        L.append(f"- **{t['id']}** [{t['viewport']}] {t['title']} → {ACT[t['action']]} · หมวด `{t['category']}` · {t['why']}")
    (out / "report.md").write_text("\n".join(L) + "\n", encoding="utf-8")


def write_html(data, triaged, out: Path):
    rs = data["results"]
    c, n = summary(rs)
    tri = {(t["id"], t["viewport"]): t for t in triaged}
    e = html.escape
    rows = []
    for r in rs:
        d = r.get("shots") or []
        base = f"screenshots/{r['id']}/{r['viewport']}/"
        imgs = "".join(f'<a href="{base}{s["file"]}"><img loading="lazy" src="{base}{s["file"]}" alt="{e(s["caption"])}" title="{e(s["caption"])}"></a>' for s in d)
        t = tri.get((r["id"], r["viewport"]))
        detail = ""
        if r["status"] in ("failed", "error"):
            er = r.get("error") or {}
            detail = f'<p class="err">step {er.get("step","-")}: {e(er.get("message") or r.get("reason") or "")}</p>'
        if r["status"] in ("skipped", "blocked"):
            detail = f'<p class="muted">{e(r.get("reason",""))}</p>'
        if t:
            detail += f'<p class="tri"><b>{ACT[t["action"]]}</b> · <code>{t["category"]}</code> — {e(t["why"])}</p>'
        rows.append(f'<details {"open" if r["status"] in ("failed","error") else ""}><summary>{ICON[r["status"]]} <b>{e(r["id"])}</b> <span class="vp">{r["viewport"]}</span> {e(r["title"])} <span class="bl">{e(", ".join(r["backlog"]))}</span>{" <i>flaky</i>" if r.get("flaky") else ""}</summary>{detail}<div class="shots">{imgs}</div></details>')
    doc = f"""<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>UAM E2E Report</title>
<style>body{{font:15px/1.5 system-ui,sans-serif;margin:0;padding:1rem 1.25rem;color:#1b2a4a;background:#fff}}h1{{color:#00194b}}
.sum span{{display:inline-block;margin:.25rem .5rem .5rem 0;padding:.35rem .75rem;border-radius:.5rem;background:#eef2ff}}
details{{border:1px solid #d8def0;border-radius:.5rem;margin:.5rem 0;padding:.5rem .75rem}}summary{{cursor:pointer}}
.vp{{background:#2854a7;color:#fff;border-radius:.3rem;padding:0 .4rem;font-size:.8em}}.bl{{color:#667;font-size:.85em}}
.err{{color:#b00020}}.tri{{background:#fff7e6;padding:.4rem .6rem;border-radius:.4rem}}.muted{{color:#667}}
.shots{{display:flex;flex-wrap:wrap;gap:.5rem}}.shots img{{height:150px;border:1px solid #ccd;border-radius:.3rem}}
@media(prefers-color-scheme:dark){{body{{background:#10162a;color:#e6ebff}}h1{{color:#9db8ff}}details{{border-color:#334}}.sum span{{background:#1d2748}}}}</style>
<h1>📊 UAM E2E Report</h1><p>{e(data["generated_at"])} · <code>{e(data["base_url"])}</code></p>
<div class="sum"><span>รวม {n}</span>{"".join(f"<span>{ICON[k]} {k} {v}</span>" for k, v in c.items())}</div>
{"".join(rows)}</html>"""
    (out / "report.html").write_text(doc, encoding="utf-8")
