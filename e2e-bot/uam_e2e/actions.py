"""ตัวรันขั้นตอน (step) ของ case — selector: `@name` = [data-testid="name"], อย่างอื่นส่งตรงให้ Playwright"""
from __future__ import annotations
import os, re, time
from pathlib import Path
from playwright.sync_api import expect


class StepError(Exception):
    pass


def expand(val, extra=None):
    if not isinstance(val, str):
        return val
    def sub(m):
        k = m.group(1)
        v = (extra or {}).get(k, os.environ.get(k))
        if v is None:
            raise StepError(f"ตัวแปร ${{{k}}} ไม่ได้ตั้งค่า")
        return v
    return re.sub(r"\$\{([A-Za-z0-9_]+)\}", sub, val)


def sel(s: str) -> str:
    s = s.strip()
    if s.startswith("@"):
        return f'[data-testid="{s[1:]}"]'
    return s


class Ctx:
    def __init__(self, page, base_url, shots_dir: Path, timeout_ms, shots_all=False):
        self.page, self.base_url, self.shots_dir = page, base_url.rstrip("/"), shots_dir
        self.timeout, self.shots_all = timeout_ms, shots_all
        self.shots: list[dict] = []
        self.dl_dir = shots_dir / "_downloads"

    def url(self, path):
        return path if re.match(r"https?://", path) else self.base_url + (path if path.startswith("/") else "/" + path)

    def shot(self, name: str, caption: str | None, full_page=True):
        self.shots_dir.mkdir(parents=True, exist_ok=True)
        n = len(self.shots) + 1
        slug = re.sub(r"[^\w\-]+", "-", name, flags=re.U).strip("-")[:50] or "shot"
        p = self.shots_dir / f"{n:02d}-{slug}.png"
        self.page.screenshot(path=str(p), full_page=full_page)
        self.shots.append({"file": p.name, "caption": caption or name})
        return p


def _target(arg):
    return arg if isinstance(arg, str) else arg.get("target")


def run_step(ctx: Ctx, step: dict):
    opts = {k: v for k, v in step.items() if k in ("caption", "timeout", "optional")}
    names = [k for k in step if k not in opts]
    if len(names) != 1:
        raise StepError(f"step ต้องมี action เดียว: {step}")
    name, arg = names[0], step[names[0]]
    page, t = ctx.page, opts.get("timeout", ctx.timeout)

    def loc(a=None):
        return page.locator(sel(expand(_target(a if a is not None else arg)))).first

    try:
        if name == "goto":
            page.goto(ctx.url(expand(arg)), wait_until="domcontentloaded", timeout=t)
        elif name == "click":
            loc().click(timeout=t)
        elif name == "dblclick":
            loc().dblclick(timeout=t)
        elif name == "hover":
            loc().hover(timeout=t)
        elif name == "fill":
            tg, v = (arg if isinstance(arg, list) else [arg["target"], arg["value"]])
            page.locator(sel(expand(tg))).first.fill(expand(str(v)), timeout=t)
        elif name == "press":
            tg, k = (arg if isinstance(arg, list) else [arg["target"], arg["key"]])
            page.locator(sel(expand(tg))).first.press(k, timeout=t)
        elif name == "check":
            loc().check(timeout=t)
        elif name == "uncheck":
            loc().uncheck(timeout=t)
        elif name == "select":   # <select> หรือ dropdown ทั่วไป: {target, option}
            loc().select_option(label=expand(arg["option"]), timeout=t)
        elif name == "drag":
            page.locator(sel(arg["from"])).first.drag_to(page.locator(sel(arg["to"])).first, timeout=t)
        elif name == "wait":
            time.sleep(float(arg) / 1000)
        elif name == "resize":
            page.set_viewport_size({"width": arg[0], "height": arg[1]})
        elif name == "reload":
            page.reload(wait_until="domcontentloaded")
        elif name == "expect_visible":
            expect(loc()).to_be_visible(timeout=t)
        elif name == "expect_hidden":
            expect(page.locator(sel(expand(_target(arg)))).first).to_be_hidden(timeout=t)
        elif name == "expect_enabled":
            expect(loc()).to_be_enabled(timeout=t)
        elif name == "expect_disabled":
            expect(loc()).to_be_disabled(timeout=t)
        elif name == "expect_text":      # {target, text} หรือ {target, regex} ; target ละได้ = ทั้งหน้า
            tg = sel(expand(arg.get("target", "body")))
            l = page.locator(tg).first
            if "regex" in arg:
                expect(l).to_contain_text(re.compile(arg["regex"]), timeout=t)
            else:
                expect(l).to_contain_text(expand(arg["text"]), timeout=t)
        elif name == "expect_no_text":
            tg = sel(expand(arg.get("target", "body")))
            expect(page.locator(tg).first).not_to_contain_text(expand(arg["text"]), timeout=t)
        elif name == "expect_value":
            expect(page.locator(sel(expand(arg["target"]))).first).to_have_value(expand(arg["value"]), timeout=t)
        elif name == "expect_count":
            expect(page.locator(sel(expand(arg["target"])))).to_have_count(int(arg["count"]), timeout=t)
        elif name == "expect_url":
            expect(page).to_have_url(re.compile(arg), timeout=t)
        elif name == "mock":             # {url, status, json|body} จำลอง response (เช่น 50000, 403)
            body = arg.get("json")
            import json as _j
            page.route(arg["url"], lambda r, a=arg, b=body: r.fulfill(
                status=a.get("status", 200), content_type="application/json",
                body=_j.dumps(b) if b is not None else a.get("body", "")))
        elif name == "mock_abort":       # จำลอง network error (status 0)
            page.route(arg, lambda r: r.abort("connectionfailed"))
        elif name == "download":         # {click, ext}
            ctx.dl_dir.mkdir(parents=True, exist_ok=True)
            with page.expect_download(timeout=t) as dl:
                page.locator(sel(arg["click"])).first.click(timeout=t)
            d = dl.value
            ext = arg.get("ext")
            if ext and not d.suggested_filename.lower().endswith(ext.lower()):
                raise StepError(f"ไฟล์ที่ดาวน์โหลดคือ {d.suggested_filename} (คาดว่า {ext})")
            d.save_as(str(ctx.dl_dir / d.suggested_filename))
        elif name == "shot":
            ctx.shot(arg if isinstance(arg, str) else arg.get("name", "shot"), opts.get("caption"))
            return
        else:
            raise StepError(f"ไม่รู้จัก action: {name}")
    except Exception:
        if opts.get("optional"):
            return
        raise
    if ctx.shots_all and not name.startswith("expect") and name not in ("wait", "mock", "mock_abort"):
        ctx.shot(name, opts.get("caption"))
