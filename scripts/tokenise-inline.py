#!/usr/bin/env python3
"""Property-aware hex → token converter for inline styles in TSX files.
Only converts values in `property: #hex` context (background, border, color...).
Leaves gradients, SVG fills on dark surfaces, and rgba() overlays untouched.
"""
import re
import sys

# token mapping — value → semantic token
TOKEN_MAP = {
    # near-white surfaces
    "#fff": "var(--bg-elevated)",
    "#ffffff": "var(--bg-elevated)",
    "#fefefe": "var(--bg-elevated)",
    # page/muted backgrounds
    "#f7f8fc": "var(--bg-primary)",
    "#f6f7fb": "var(--bg-primary)",
    "#fafaff": "var(--bg-muted)",
    "#f8f9fd": "var(--bg-muted)",
    "#f5f6fb": "var(--bg-muted)",
    # soft accent surfaces
    "#f2f0fb": "var(--accent-soft)",
    "#f3efff": "var(--accent-soft)",
    "#f1edff": "var(--accent-soft)",
    "#f4f1fd": "var(--accent-soft)",
    # borders
    "#e4e8f0": "var(--border-default)",
    "#e7e9f1": "var(--border-default)",
    "#e2e5ef": "var(--border-default)",
    "#ececf5": "var(--border-subtle)",
    "#eef0f7": "var(--border-subtle)",
    "#edeef5": "var(--border-subtle)",
    "#e8eaf2": "var(--border-default)",
    "#d9dcea": "var(--border-default)",
    "#d6d8e5": "var(--border-default)",
    "#dfe1e9": "var(--border-default)",
    "#d8dcea": "var(--border-default)",
    # text — dark neutrals
    "#172033": "var(--text-primary)",
    "#1a2036": "var(--text-primary)",
    "#16203a": "var(--text-primary)",
    "#0d1930": "var(--surface-inverse)",
    # text — secondary greys
    "#5b6272": "var(--text-secondary)",
    "#5d6478": "var(--text-secondary)",
    "#667087": "var(--text-tertiary)",
    "#697186": "var(--text-secondary)",
    "#6c7489": "var(--text-secondary)",
    "#6b7280": "var(--text-secondary)",
    "#3c455c": "var(--text-secondary)",
    "#4a5568": "var(--text-secondary)",
    # text — tertiary
    "#83899a": "var(--text-tertiary)",
    "#8b91a8": "var(--text-tertiary)",
    "#9aa1b2": "var(--text-disabled)",
    # success / danger / warning (solid, non-gradient usage)
    "#10b981": "var(--success)",
    "#0b7a50": "var(--success)",
    "#e7f8ef": "var(--success-soft)",
    "#ef4444": "var(--danger)",
    "#fdeef0": "var(--danger-soft)",
    "#f59e0b": "var(--warning)",
    "#fdf6e3": "var(--warning-soft)",
    # brand accents used flat
    "#6840d6": "var(--accent-primary)",
    "#5a31ca": "var(--accent-strong)",
    "#8a57ff": "var(--accent-secondary)",
    "#8a63ff": "var(--accent-secondary)",
    "#5e3fd0": "var(--accent-primary)",
    "#4626b8": "var(--accent-text)",
    "#5331b5": "var(--accent-text)",
    "#5d41cf": "var(--accent-primary)",
    "#7452dd": "var(--accent-primary)",
}

# properties whose hex values we convert when followed by a mapped value
PROPS = [
    "background", "backgroundColor", "border", "borderColor", "borderTop", "borderRight",
    "borderBottom", "borderLeft", "borderTopColor", "borderBottomColor", "borderLeftColor",
    "borderRightColor", "color", "outline", "outlineColor", "textDecorationColor", "boxShadow",
]

def convert(text: str):
    stats = 0
    for prop in PROPS:
        # match `prop: "#hex"` (React style object) or `prop: #hex` (CSS text)
        pattern = re.compile(
            r"([{\s;(])(" + prop + r"):(\s*[\"']?)(" + "|".join(re.escape(h) for h in sorted(TOKEN_MAP, key=len, reverse=True)) + r")\b",
            re.IGNORECASE,
        )
        def repl(m):
            nonlocal stats
            token = TOKEN_MAP[m.group(4).lower()]
            stats += 1
            return f"{m.group(1)}{m.group(2)}:{m.group(3)}{token}"
        text = pattern.sub(repl, text)
    return text, stats

files = [
    "app/diagnostic/page.tsx", "app/onboarding/page.tsx", "app/plan/page.tsx",
    "app/report/page.tsx", "app/pricing/page.tsx", "app/certificate/[id]/page.tsx",
    "app/(app)/learn/page.tsx", "app/(app)/learn/[lessonId]/page.tsx",
    "app/(app)/pathways/ielts/page.tsx", "app/(app)/pathways/cambridge/page.tsx",
    "app/(app)/pathways/professional/page.tsx", "app/(app)/pathways/mock/page.tsx",
    "app/(app)/learning-path/page.tsx", "app/(app)/say-it-better/page.tsx",
    "app/(app)/thinking-in-english/page.tsx", "app/(app)/vocabulary/page.tsx",
    "app/(app)/grammar/page.tsx", "app/(app)/writing/page.tsx",
    "app/(app)/english-ear/page.tsx", "app/(app)/scenes/page.tsx",
    "app/components/scene-player.tsx", "app/components/upgrade-modal.tsx",
    "app/components/celebration.tsx", "app/components/listening-lab.tsx",
    "app/components/WordPopover.tsx", "app/components/install-button.tsx",
    "app/components/text-size-control.tsx", "app/components/upgrade-prompt.tsx",
    "app/components/exam-timer.tsx", "app/components/page-hero.tsx",
    "app/(app)/welcome/page.tsx", "app/(app)/search/page.tsx",
    "app/(app)/community/page.tsx", "app/(app)/referral/page.tsx",
    "app/(app)/settings/page.tsx", "app/(app)/teacher-help/page.tsx",
    "app/(app)/review/page.tsx", "app/(app)/progress/page.tsx",
    "app/(app)/portfolio/page.tsx", "app/(app)/pathways/page.tsx",
    "app/(app)/chunks/page.tsx", "app/(app)/achievements/page.tsx",
    "app/(app)/leaderboard/page.tsx", "app/(app)/practice/page.tsx",
    "app/(app)/mistakes/page.tsx", "app/(app)/speaking/page.tsx",
    "app/auth/page.tsx", "app/offline/page.tsx",
]

total = 0
changed_files = 0
for f in files:
    try:
        s = open(f).read()
    except FileNotFoundError:
        continue
    new, n = convert(s)
    if n:
        open(f, "w").write(new)
        changed_files += 1
        total += n
        print(f"{f}: {n} conversions")
print(f"TOTAL: {total} conversions across {changed_files} files")
