# Reports View — Design Spec
**Date:** 2026-04-19  
**Status:** Approved

---

## Overview

Add a `Reports` directory to MonitorOS that lists security reports and assessments as PDF files. Each report is displayed as a horizontal "Docket Manifest" card styled to match the existing CRT classified-file aesthetic.

---

## Data Model

Add to `src/lib/data/projects.ts`:

```typescript
export type ReportFile = {
  name: string        // Report title
  description: string // One-sentence summary shown on card
  date: string        // "YYYY-MM" format, displayed as "FILED: YYYY-MM"
  category: string    // e.g. "BREACH ANALYSIS", "PENTEST REPORT"
  pages?: number      // Optional page count
  url?: string        // Path or URL to PDF; absence triggers LOCKED state
}

export const reportFiles: ReportFile[] = [
  // entries populated by user
]
```

---

## ViewState

Add `'reports'` to the existing `ViewState` union in `MonitorOS.svelte`.

Update helpers:
- `currentPath()` → `'C:/Desktop/Reports/'`
- `itemCount()` → `${reportFiles.length} items`

---

## Navigation

- **Sidebar** — new item under PINNED: `[RPT] Reports`, active when `viewState === 'reports'`
- **Desktop icon** — new `[RPT]` file chip on the desktop grid

### `[RPT]` chip colour
Warm crimson to reflect the security/classified theme:
```css
.file-chip.rpt {
  border: 1px solid #6b1010;
  background: #1a0808;
  color: #ff8c8c;
}
```

---

## Card Anatomy — Docket Manifest

Each card is a horizontal `flex` row:

```
┌─┬──────────────────────────────────────────────┬────────┐
│█│ REPT-YYYY-NNN  [PDF]         ⚠ CONFIDENTIAL  │ ▶ OPEN │
│█│                                               │        │
│█│ Report Title                                  │        │
│█│ One-line description (truncated)              │        │
│█│                                               │        │
│█│ FILED: YYYY-MM · CATEGORY · N PGS            │        │
└─┴──────────────────────────────────────────────┴────────┘
```

| Zone | Details |
|---|---|
| Left stripe | 4px, crimson `#8b2020` → brightens to `#c0392b` + widens to 5px on hover |
| Inner body | case ID row, title, description, footer metadata |
| Right button | OPEN (green) or LOCKED (dimmed red, `disabled`) based on `url` presence |
| Scan sweep | Horizontal band animates left→right continuously (`hsweep` keyframe) |

### Case ID generation
`REPT-{year}-{index padded to 3 digits}` — derived at render time from the array index and `date` field.

### Two button states

**OPEN** (when `url` is defined):
- Background `rgba(4,26,14,0.9)`, border-left `rgba(61,220,132,0.2)`, text `#5ddba0`
- Opens `url` in new tab on click

**LOCKED** (when `url` is absent or empty):
- Background `rgba(26,10,10,0.9)`, border-left `rgba(120,32,32,0.35)`, text `rgba(255,140,140,0.4)`
- `disabled` attribute, `cursor: not-allowed`
- Card title and description also rendered at reduced opacity (~0.45)

### Hover effect
- `transform: translateX(5px)`
- `border-color` lifts from `rgba(89,186,255,0.15)` → `rgba(89,186,255,0.38)`
- `box-shadow: -5px 0 0 #c0392b` (red left glow)

---

## View Layout

```svelte
{:else if viewState === 'reports'}
  <div class="reports-list">
    <p class="reports-section-header">-SECURITY REPORTS & ASSESSMENTS-</p>
    {#each reportFiles as report, i (report.name)}
      <div class="report-docket" class:locked={!report.url}>
        <div class="docket-stripe"></div>
        <div class="docket-inner">
          <!-- top row: case ID, [PDF] badge, CONFIDENTIAL stamp -->
          <!-- title -->
          <!-- description -->
          <!-- footer: date · category · pages -->
        </div>
        <button class="docket-action" ... >
          {#if report.url} ▶ OPEN {:else} ⊘ LOCKED {/if}
        </button>
        <div class="docket-hscan"></div>
      </div>
    {/each}
  </div>
```

---

## CSS Additions (`monitor-os.css`)

New classes required:

| Class | Purpose |
|---|---|
| `.reports-list` | Flex column, `gap: 0.5rem`, `align-content: start` |
| `.reports-section-header` | Dim label above card list (matches `.intel-op` style) |
| `.report-docket` | Horizontal flex container, base card styles |
| `.report-docket:hover` | Slide + border + shadow |
| `.docket-stripe` | 4px left bar, crimson |
| `.docket-inner` | Flex-grow body with padding |
| `.docket-top` | Row: case ID + badges |
| `.docket-id` | Tiny monospace case number |
| `.docket-pdf-badge` | `[PDF]` chip |
| `.docket-classified` | `⚠ CONFIDENTIAL` stamp |
| `.docket-title` | Large report name |
| `.docket-desc` | Muted, single line, text-overflow ellipsis |
| `.docket-footer` | Metadata row: date · category · pages |
| `.docket-action` | Right-side button base |
| `.docket-action.open` | Green OPEN variant |
| `.docket-action.locked` | Dimmed red LOCKED variant |
| `.docket-hscan` | Horizontal sweep animation |
| `@keyframes hsweep` | `left: -30px → 105%` over 2.8s linear infinite |
| `.file-chip.rpt` | Crimson desktop/sidebar chip |
| Mobile `@media (max-width: 600px)` | Stack description below title, reduce font sizes |

---

## Files Changed

| File | Change |
|---|---|
| `src/lib/data/projects.ts` | Add `ReportFile` type + `reportFiles` array |
| `src/lib/components/monitor-os/MonitorOS.svelte` | Import, ViewState, path/count helpers, sidebar item, desktop icon, view template |
| `src/lib/components/monitor-os/monitor-os.css` | All docket card styles + `[RPT]` chip |

---

## Out of Scope

- In-browser PDF rendering (user opens PDF in a new tab)
- Pagination or search within the Reports list
- Report categories as navigable sub-folders
