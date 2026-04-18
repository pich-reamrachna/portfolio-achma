# Monitor OS — Design Spec

**Date:** 2026-04-18

## Overview

When the user clicks the 3D monitor model, the camera zooms in cinematically toward the screen, then a full-screen cyberpunk OS UI fades in replacing the existing hologram desktop. The OS provides a full file-explorer experience (sidebar, address bar, back/forward navigation) for browsing projects and the about section. On close, the OS fades out and the camera pulls back to its resting position.

---

## 1. Camera Zoom

**Trigger:** User clicks the monitor mesh in the Three.js scene.

**Animation:**

- A new `zoomingToMonitor: boolean` state activates in `PortfolioScene.svelte`
- Zoom target position: `[0, 0.65, 0.55]` (close enough to fill view with monitor screen)
- The `useTask` loop lerps toward this target with factor `0.055` (~700ms to arrive)
- Once camera distance to zoom target is below threshold (~0.05 units), fire `onZoomComplete()` callback
- While OS is open, Threlte render loop switches to `demand` mode to pause unnecessary GPU work

**On OS close:**

- `monitorOSOpen = false` → OS fades out
- Render loop resumes (`auto` mode)
- Camera lerps back to base position `[0, 1, 2]` with normal factor `0.065`
- `zoomingToMonitor` resets to `false`

---

## 2. MonitorOS Component

**Location:** `src/lib/components/monitor-os/MonitorOS.svelte`

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  ◈ RACHNA-OS  v1.0   [address bar path]   [× close] │  Titlebar
├──────────┬──────────────────────────────────────────┤
│ DRIVES   │  ← ← →  C:/Desktop/                     │  Toolbar
├──────────┼──────────────────────────────────────────┤
│  C:/     │                                          │
│  ├ Desktop│   [PRJ]        [TXT]                    │  File grid
│  └ Projects│  Projects/    About Me.txt             │
│          │                                          │
│ PINNED   │                                          │
│  About   │                                          │
└──────────┴──────────────────────────────────────────┘
│  Status bar: "2 items"  ●  ONLINE   2026-04-18     │  Statusbar
└─────────────────────────────────────────────────────┘
```

**Navigation states:**

| State            | Content                                                |
| ---------------- | ------------------------------------------------------ |
| `desktop`        | "About Me.txt" + "Projects/" folder icons              |
| `projects`       | Grid of `.prj` file icons, one per project             |
| `project-detail` | Selected project: description, stack, year, highlights |

**Address bar examples:**

- `C:/Desktop/`
- `C:/Desktop/Projects/`
- `C:/Desktop/Projects/Portfolio 3D.prj`

**Back/forward:** Standard stack-based history. Back button disabled at root.

**Sidebar items:** `C:/` drive root, `Desktop`, `Projects`, `About` — clicking any navigates directly to that view.

---

## 3. Cyberpunk Aesthetic

Matches the existing hologram palette (`hologram.css`) exactly:

- **Background:** `#070e1a`
- **Borders:** `rgba(89, 186, 255, 0.6)` cyan
- **Text:** `#e6f5ff`
- **Secondary text:** `#a9c8df`
- **Accent glow:** `box-shadow: 0 0 12px rgba(89, 186, 255, 0.3)`
- **Address bar font:** `JetBrains Mono` or `Fira Code` (monospace)
- **CRT scanlines:** CSS `repeating-linear-gradient` overlay at 4% opacity
- **File icons:** ASCII-chip style — `[PRJ]`, `[TXT]`, `[DIR]`
- **Open animation:** subtle flicker on first appear, then fade-in full-screen
- **Active sidebar item:** cyan left border + faint background highlight

---

## 4. Data Flow

```
click monitor
  → PortfolioScene: zoomingToMonitor = true
  → camera lerps to [0, 0.65, 0.55]
  → distance threshold met → onZoomComplete()
  → +page.svelte: monitorOSOpen = true
  → render loop → demand mode
  → MonitorOS fades in full-screen

click OS close button
  → monitorOSOpen = false
  → MonitorOS fades out
  → render loop → auto mode
  → camera lerps back to [0, 1, 2]
  → zoomingToMonitor = false
```

---

## 5. Files

### Modified

- `src/routes/+page.svelte` — replace `hologramOpen/monitorOn` state with `monitorOSOpen`; add `onZoomComplete` handler
- `src/lib/components/scene/PortfolioScene.svelte` — add `zoomingToMonitor` state, zoom target lerp, `onZoomComplete` prop

### New

- `src/lib/components/monitor-os/MonitorOS.svelte`
- `src/lib/components/monitor-os/monitor-os.css`

### Deleted

- `src/lib/components/hologram/HologramDesktop.svelte`
- `src/lib/components/hologram/HologramTopbar.svelte`
- `src/lib/components/hologram/HologramTaskbar.svelte`
- `src/lib/components/hologram/hologram.css`

### Unchanged

- `src/lib/data/projects.ts` — imported directly by `MonitorOS`
- `src/lib/components/scene/Computer.svelte` — no changes needed
- Phone/headphone popups — unaffected

---

## 6. Out of Scope

- Resume/CV route
- Contact form inside OS
- Animations beyond the zoom transition and OS open/close
- Mobile layout for the OS (viewport too small for the explorer UI)
