# Reports View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Reports directory to MonitorOS that displays security PDF reports as horizontal "Docket Manifest" cards with OPEN/LOCKED states.

**Architecture:** Follow the existing MonitorOS pattern — add `'reports'` to the `ViewState` union, wire path/count helpers, add a sidebar item + desktop icon, and render a new view template. All card styles go into the existing `monitor-os.css`. Report data lives in `projects.ts` alongside the other data arrays.

**Tech Stack:** Svelte 5 (runes), TypeScript, vanilla CSS, SvelteKit

---

## Files

| File | Action |
|---|---|
| `src/lib/data/projects.ts` | Add `ReportFile` type + `reportFiles` array |
| `src/lib/components/monitor-os/MonitorOS.svelte` | Import, ViewState, helpers, sidebar, desktop icon, view template |
| `src/lib/components/monitor-os/monitor-os.css` | All docket card styles + `[RPT]` chip |

---

### Task 1: Add ReportFile data model

**Files:**
- Modify: `src/lib/data/projects.ts`

- [ ] **Step 1: Add the type and array**

Open `src/lib/data/projects.ts`. Insert this block **before** the `export type CreditAsset` line (i.e. at the very top of the file):

```typescript
export type ReportFile = {
	name: string
	description: string
	date: string
	category: string
	pages?: number
	url?: string
}

export const reportFiles: ReportFile[] = [
	{
		name: 'Marriott International Data Breach',
		description:
			'Security analysis of the 2018 breach affecting 500M guest records and Starwood acquisition risks',
		date: '2025-04',
		category: 'BREACH ANALYSIS',
		pages: 14,
		url: ''
	},
	{
		name: 'University Cybersecurity Posture Assessment',
		description: 'Penetration testing and vulnerability assessment of AUPP internal systems',
		date: '2025-09',
		category: 'PENTEST REPORT',
		pages: 22,
		url: ''
	},
	{
		name: 'Honeypot Deployment & Threat Analysis',
		description: 'Honeypot infrastructure setup and attacker behaviour logging over 30-day period',
		date: '2026-01',
		category: 'THREAT INTEL',
		url: ''
	}
]
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd d:/my-portfolio && npm run check
```

Expected: no new errors related to `ReportFile` or `reportFiles`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/projects.ts
git commit -m "feat: add ReportFile type and reportFiles data"
```

---

### Task 2: Wire ViewState, imports, and helpers

**Files:**
- Modify: `src/lib/components/monitor-os/MonitorOS.svelte` (script section, lines 1–78)

- [ ] **Step 1: Update the import line**

Replace:
```typescript
import { aboutMeText, projectFiles, creditAssets, type ProjectFile } from '$lib/data/projects.js'
```

With:
```typescript
import {
	aboutMeText,
	projectFiles,
	creditAssets,
	reportFiles,
	type ProjectFile
} from '$lib/data/projects.js'
```

- [ ] **Step 2: Extend the ViewState type**

Replace:
```typescript
type ViewState = 'desktop' | 'about' | 'projects' | 'project-detail' | 'credits'
```

With:
```typescript
type ViewState = 'desktop' | 'about' | 'projects' | 'project-detail' | 'credits' | 'reports'
```

- [ ] **Step 3: Update currentPath()**

Replace the `currentPath` function body:
```typescript
function currentPath(): string {
	if (viewState === 'desktop') return 'C:/Desktop/'
	if (viewState === 'about') return 'C:/Desktop/hi.txt'
	if (viewState === 'projects') return 'C:/Desktop/Projects/'
	if (viewState === 'project-detail' && selectedProject)
		return `C:/Desktop/Projects/${selectedProject.name}.prj`
	if (viewState === 'credits') return 'C:/Desktop/Credits/'
	if (viewState === 'reports') return 'C:/Desktop/Reports/'
	return 'C:/'
}
```

- [ ] **Step 4: Update itemCount()**

Replace the `itemCount` function body:
```typescript
function itemCount(): string {
	if (viewState === 'desktop') return '4 items'
	if (viewState === 'projects') return `${projectFiles.length} items`
	if (viewState === 'credits') return `${creditAssets.length} items`
	if (viewState === 'reports') return `${reportFiles.length} items`
	return '1 item'
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npm run check
```

Expected: no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/monitor-os/MonitorOS.svelte
git commit -m "feat: add reports ViewState and path/count helpers"
```

---

### Task 3: Add sidebar item, desktop icon, and view template

**Files:**
- Modify: `src/lib/components/monitor-os/MonitorOS.svelte` (template section)

- [ ] **Step 1: Add sidebar button**

Inside `<nav class="os-sidebar">`, after the existing Credits button, add:

```svelte
<button
	class="sidebar-item"
	class:active={viewState === 'reports'}
	onclick={() => {
		playClick()
		navigate('reports')
	}}
>
	<span class="sidebar-icon">[RPT]</span> Reports
</button>
```

- [ ] **Step 2: Add desktop icon**

Inside the `{#if viewState === 'desktop'}` block, after the Credits button, add:

```svelte
<button
	class="file-icon"
	onclick={() => {
		playClick()
		navigate('reports')
	}}
>
	<span class="file-chip rpt">[RPT]</span>
	<small>Reports</small>
</button>
```

- [ ] **Step 3: Update desktop item count**

In `itemCount()`, the desktop case is already updated to `'4 items'` from Task 2 Step 4.

- [ ] **Step 4: Add the reports view template**

After the `{:else if viewState === 'credits'}` block (before the closing `{/if}`), add:

```svelte
{:else if viewState === 'reports'}
	<div class="reports-list">
		<p class="reports-section-header">-SECURITY REPORTS &amp; ASSESSMENTS-</p>
		{#each reportFiles as report, i (report.name)}
			<div class="report-docket" class:locked={!report.url}>
				<div class="docket-stripe"></div>

				<div class="docket-inner">
					<div class="docket-top">
						<span class="docket-id">
							REPT-{report.date.split('-')[0]}-{String(i + 1).padStart(3, '0')}
						</span>
						<span class="docket-pdf-badge">[PDF]</span>
						<span class="docket-classified">⚠ CONFIDENTIAL</span>
					</div>

					<h3 class="docket-title">{report.name}</h3>
					<p class="docket-desc">{report.description}</p>

					<div class="docket-footer">
						<span>FILED: {report.date}</span>
						<span>{report.category}</span>
						{#if report.pages}
							<span>{report.pages} PGS</span>
						{/if}
					</div>
				</div>

				{#if report.url}
					<button
						class="docket-action open"
						onclick={() => window.open(report.url, '_blank', 'noopener,noreferrer')}
					>
						<span class="docket-action-icon">▶</span>
						<span>OPEN</span>
					</button>
				{:else}
					<button class="docket-action locked" disabled>
						<span class="docket-action-icon">⊘</span>
						<span>LOCKED</span>
					</button>
				{/if}

				<div class="docket-hscan"></div>
			</div>
		{/each}
	</div>
```

- [ ] **Step 5: Start dev server and open the portfolio**

```bash
npm run dev
```

Navigate to the portfolio, open MonitorOS, click Reports in the sidebar. Verify:
- Three report cards render
- All show LOCKED (no URLs filled in yet) with dimmed text
- Breadcrumb shows `C:/Desktop/Reports/`
- Status bar shows `3 items`
- Desktop shows `[RPT]` icon

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/monitor-os/MonitorOS.svelte
git commit -m "feat: add Reports sidebar, desktop icon, and view template"
```

---

### Task 4: Add all docket card CSS

**Files:**
- Modify: `src/lib/components/monitor-os/monitor-os.css`

- [ ] **Step 1: Add the docket card styles**

In `monitor-os.css`, add the following block immediately before the `/* ── Responsive ──` comment:

```css
/* ── Reports: docket manifest cards ── */
.reports-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	align-content: start;
}

.reports-section-header {
	font-family: 'Share Tech Mono', monospace;
	font-size: 0.5rem;
	letter-spacing: 0.22em;
	color: rgba(89, 186, 255, 0.35);
	margin: 0 0 0.25rem;
}

.report-docket {
	display: flex;
	background: #040c1a;
	border: 1px solid rgba(89, 186, 255, 0.15);
	position: relative;
	overflow: hidden;
	flex-shrink: 0;
	transition:
		transform 0.18s cubic-bezier(0.2, 0.7, 0.2, 1),
		border-color 0.18s,
		box-shadow 0.18s;
}

.report-docket:hover {
	transform: translateX(5px);
	border-color: rgba(89, 186, 255, 0.38);
	box-shadow: -5px 0 0 #c0392b, 3px 0 14px rgba(0, 0, 0, 0.5);
}

.docket-stripe {
	width: 4px;
	background: #8b2020;
	flex-shrink: 0;
	transition:
		background 0.18s,
		width 0.18s;
}

.report-docket:hover .docket-stripe {
	background: #c0392b;
	width: 5px;
}

.report-docket.locked .docket-stripe {
	background: #4a1818;
}

.docket-inner {
	flex: 1;
	padding: 8px 12px 8px;
	min-width: 0;
}

.docket-top {
	display: flex;
	align-items: center;
	gap: 7px;
	margin-bottom: 5px;
}

.docket-id {
	font-family: 'Share Tech Mono', monospace;
	font-size: 0.52rem;
	color: rgba(89, 186, 255, 0.38);
	letter-spacing: 0.15em;
	flex-shrink: 0;
}

.docket-pdf-badge {
	font-family: 'Share Tech Mono', monospace;
	font-size: 0.48rem;
	padding: 1px 5px;
	background: #0a1e30;
	color: #91d4ff;
	border: 1px solid #1a4a6a;
	flex-shrink: 0;
}

.docket-classified {
	font-family: 'Share Tech Mono', monospace;
	font-size: 0.48rem;
	padding: 1px 5px;
	border: 1px solid rgba(192, 57, 43, 0.42);
	color: #ff8c8c;
	letter-spacing: 0.1em;
	margin-left: auto;
	flex-shrink: 0;
}

.docket-title {
	font-family: 'Share Tech Mono', monospace;
	font-size: 0.82rem;
	font-weight: 700;
	color: #e6f5ff;
	margin: 0 0 3px;
	letter-spacing: 0.02em;
	transition: opacity 0.15s;
}

.report-docket.locked .docket-title {
	opacity: 0.4;
}

.docket-desc {
	font-size: 0.72rem;
	color: rgba(145, 212, 255, 0.5);
	margin: 0 0 7px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.4;
	transition: opacity 0.15s;
}

.report-docket.locked .docket-desc {
	opacity: 0.4;
}

.docket-footer {
	display: flex;
	gap: 14px;
	font-family: 'Share Tech Mono', monospace;
	font-size: 0.52rem;
	color: rgba(89, 186, 255, 0.35);
	letter-spacing: 0.1em;
}

/* Right action button */
.docket-action {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 14px;
	flex-shrink: 0;
	gap: 4px;
	font-family: 'Share Tech Mono', monospace;
	font-size: 0.52rem;
	letter-spacing: 0.1em;
	border: none;
	cursor: pointer;
}

.docket-action-icon {
	font-size: 0.9rem;
}

.docket-action.open {
	background: rgba(4, 26, 14, 0.9);
	border-left: 1px solid rgba(61, 220, 132, 0.2);
	color: #5ddba0;
	transition:
		background 0.15s,
		border-color 0.15s,
		color 0.15s;
}

.docket-action.open:hover {
	background: #082d18;
	border-left-color: rgba(61, 220, 132, 0.6);
	color: #a0f0cc;
}

.docket-action.locked {
	background: rgba(26, 10, 10, 0.9);
	border-left: 1px solid rgba(120, 32, 32, 0.32);
	color: rgba(255, 140, 140, 0.35);
	cursor: not-allowed;
}

/* Horizontal scan sweep */
.docket-hscan {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 30px;
	background: linear-gradient(to right, transparent, rgba(89, 186, 255, 0.055), transparent);
	left: -30px;
	animation: hsweep 2.8s linear infinite;
	pointer-events: none;
}

@keyframes hsweep {
	from {
		left: -30px;
	}
	to {
		left: 105%;
	}
}

/* [RPT] desktop/sidebar chip */
.file-chip.rpt {
	border: 1px solid #6b1010;
	background: #1a0808;
	color: #ff8c8c;
}
```

- [ ] **Step 2: Add mobile responsive rules**

Inside the existing `@media (max-width: 600px)` block, append before the closing `}`:

```css
	.docket-desc {
		display: none;
	}

	.docket-footer {
		gap: 8px;
		flex-wrap: wrap;
	}

	.docket-action {
		padding: 0 10px;
	}
```

- [ ] **Step 3: Verify in dev server**

With `npm run dev` still running, open MonitorOS → Reports. Verify:
- Cards render with red left stripe
- Horizontal scan line animates across each card
- Hovering a card slides it right and shows red left glow
- LOCKED cards have dimmed title + description + darker stripe
- On mobile viewport (DevTools → 375px width): description hides, cards stay readable

- [ ] **Step 4: Fill in a real URL and verify OPEN state**

In `src/lib/data/projects.ts`, temporarily set the first report's `url` to any test URL (e.g. `'https://example.com'`):

```typescript
url: 'https://example.com'
```

Verify: card shows green ▶ OPEN button; clicking opens the URL in a new tab. Revert after checking.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/monitor-os/monitor-os.css
git commit -m "feat: add docket manifest card styles for Reports view"
```

---

## Self-Review

**Spec coverage:**
- ✅ `ReportFile` type + `reportFiles` array — Task 1
- ✅ `'reports'` ViewState — Task 2
- ✅ `currentPath()` returns `C:/Desktop/Reports/` — Task 2
- ✅ `itemCount()` returns `N items` — Task 2
- ✅ Sidebar `[RPT] Reports` item — Task 3
- ✅ Desktop `[RPT]` icon — Task 3
- ✅ Card anatomy: stripe, top row, title, desc, footer — Task 3
- ✅ Case ID `REPT-{year}-{NNN}` — Task 3
- ✅ OPEN button (green, opens url) — Task 3
- ✅ LOCKED button (dimmed, disabled) — Task 3
- ✅ Dimmed title/desc on locked cards — Tasks 3 + 4
- ✅ Horizontal scan sweep animation — Task 4
- ✅ Hover: slide + stripe glow — Task 4
- ✅ `[RPT]` chip crimson colours — Task 4
- ✅ Mobile responsive — Task 4

**No placeholders, no TBD, all code blocks complete.**
