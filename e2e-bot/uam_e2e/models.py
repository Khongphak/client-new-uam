from __future__ import annotations
import os, re, glob
from dataclasses import dataclass, field
from pathlib import Path
import yaml

VIEWPORTS = {
    "desktop": {"viewport": {"width": 1440, "height": 900}},
    "phone": {"viewport": {"width": 390, "height": 844}, "is_mobile": True, "has_touch": True},
}


@dataclass
class Case:
    id: str
    title: str
    steps: list
    backlog: list = field(default_factory=list)
    severity: str = "major"          # critical | major | minor
    role: str | None = None          # ADMIN | DEVELOPER | AUDIT | USER | SUPERADMIN | None (ยังไม่ล็อกอิน)
    viewports: list = field(default_factory=lambda: ["desktop"])
    tags: list = field(default_factory=list)
    depends_on: list = field(default_factory=list)
    requires_env: list = field(default_factory=list)
    manual: dict | None = None       # {section, title, intro}
    selftest_expect: str | None = None
    source: str = ""

    @property
    def epic(self) -> str:
        m = re.match(r"E2E-([A-Z0-9]+)-", self.id)
        return m.group(1) if m else "MISC"


def load_config(path: str | Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def load_cases(paths: list[str]) -> list[Case]:
    files: list[str] = []
    for p in paths:
        pp = Path(p)
        if pp.is_dir():
            files += sorted(glob.glob(str(pp / "*.y*ml")))
        else:
            files.append(str(pp))
    cases, seen = [], set()
    for fp in files:
        with open(fp, encoding="utf-8") as f:
            data = yaml.safe_load(f) or []
        for raw in data:
            if raw["id"] in seen:
                raise ValueError(f"case id ซ้ำ: {raw['id']} ({fp})")
            seen.add(raw["id"])
            c = Case(source=os.path.basename(fp), **raw)
            for vp in c.viewports:
                if vp not in VIEWPORTS:
                    raise ValueError(f"{c.id}: viewport ไม่รู้จัก {vp}")
            cases.append(c)
    ids = {c.id for c in cases}
    for c in cases:
        for d in c.depends_on:
            if d not in ids:
                raise ValueError(f"{c.id}: depends_on ไม่พบ {d}")
    return _toposort(cases)


def _toposort(cases: list[Case]) -> list[Case]:
    by = {c.id: c for c in cases}
    out, state = [], {}

    def visit(c: Case):
        if state.get(c.id) == 2:
            return
        if state.get(c.id) == 1:
            raise ValueError(f"depends_on วนลูปที่ {c.id}")
        state[c.id] = 1
        for d in c.depends_on:
            visit(by[d])
        state[c.id] = 2
        out.append(c)

    for c in cases:
        visit(c)
    return out


def filter_cases(cases, ids=None, backlog=None, tags=None, epics=None):
    def ok(c: Case):
        if ids and not any(re.search(i, c.id) for i in ids): return False
        if backlog and not set(backlog) & set(c.backlog): return False
        if tags and not set(tags) & set(c.tags): return False
        if epics and c.epic not in epics: return False
        return True
    return [c for c in cases if ok(c)]
