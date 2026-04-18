# Monitor OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the user clicks the 3D monitor, the camera zooms in cinematically, then a full-screen cyberpunk OS UI fades in that lets you browse projects and the about section via sidebar, address bar, and back navigation. Replaces the existing hologram desktop entirely.

**Architecture:** `PortfolioScene` gains a `zoomingToMonitor` animation phase driven by the `isMonitorOn` prop — it lerps the camera to a close-up target and fires `onZoomComplete` once it arrives. `+page.svelte` listens to that callback to show a new `MonitorOS` full-screen component. The hologram components are deleted.

**Tech Stack:** SvelteKit, Svelte 5 runes (`$state`, `$effect`, `$props`), Threlte / Three.js (`useTask`, `useThrelte`), plain CSS (no Tailwind in component files), `Share Tech Mono` monospace font (already loaded via the loading screen).

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/lib/components/scene/PortfolioScene.svelte` | Add zoom target lerp + `onZoomComplete` prop |
| Modify | `src/routes/+page.svelte` | Swap hologram state for `monitorOSOpen`, wire `MonitorOS` |
| Create | `src/lib/components/monitor-os/monitor-os.css` | All MonitorOS styles |
| Create | `src/lib/components/monitor-os/MonitorOS.svelte` | Full-screen OS explorer component |
| Delete | `src/lib/components/hologram/HologramDesktop.svelte` | Replaced by MonitorOS |
| Delete | `src/lib/components/hologram/HologramTopbar.svelte` | Replaced by MonitorOS titlebar |
| Delete | `src/lib/components/hologram/HologramTaskbar.svelte` | Replaced by MonitorOS statusbar |
| Delete | `src/lib/components/hologram/hologram.css` | Replaced by monitor-os.css |
| Unchanged | `src/lib/data/projects.ts` | MonitorOS imports from here directly |
| Unchanged | `src/lib/components/scene/Computer.svelte` | No changes needed |

---

## Task 1: Add Camera Zoom to PortfolioScene

**Files:**
- Modify: `src/lib/components/scene/PortfolioScene.svelte`

- [ ] **Step 1: Add `onZoomComplete` prop and zoom state**

  Open `src/lib/components/scene/PortfolioScene.svelte`. In the `$props()` destructure, add `onZoomComplete`:

  ```typescript
  let {
    highPerf = true,
    onMonitorOpen,
    isMonitorOn = false,
    onPhoneSelect,
    onPhoneAnchorChange,
    isPhonePopupOpen = false,
    onHeadphoneSelect,
    onHeadphoneAnchorChange,
    onZoomComplete
  }: {
    highPerf?: boolean
    onMonitorOpen?: () => void
    isMonitorOn?: boolean
    onPhoneSelect?: () => void
    onPhoneAnchorChange?: (anchor: { x: number; y: number }) => void
    isPhonePopupOpen?: boolean
    onHeadphoneSelect?: () => void
    onHeadphoneAnchorChange?: (anchor: { x: number; y: number }) => void
    onZoomComplete?: () => void
  } = $props()
  ```

  Then add the zoom target constant and `zoomFired` state after the existing `baseCameraPosition` line:

  ```typescript
  const baseCameraPosition = new Vector3(0, 1, 2)
  const zoomTarget = new Vector3(0, 0.65, 0.55)
  let zoomFired = $state(false)
  ```

- [ ] **Step 2: Remove the locked-camera state variables**

  Delete these four lines (they are no longer needed):

  ```typescript
  let lockedCameraX = $state<number | null>(null)
  let lockedCameraY = $state<number | null>(null)
  ```

- [ ] **Step 3: Replace the camera lerp block inside `useTask`**

  Find the `useTask` callback. Replace the entire block that starts with `if (isMonitorOn && lockedCameraX === null)` and ends with the `activeCamera.position.z +=` line with:

  ```typescript
  if (isMonitorOn && !zoomFired) {
    activeCamera.position.x += (zoomTarget.x - activeCamera.position.x) * 0.055
    activeCamera.position.y += (zoomTarget.y - activeCamera.position.y) * 0.055
    activeCamera.position.z += (zoomTarget.z - activeCamera.position.z) * 0.055
    if (Math.abs(activeCamera.position.z - zoomTarget.z) < 0.04) {
      zoomFired = true
      onZoomComplete?.()
    }
  } else if (!isMonitorOn) {
    if (zoomFired) zoomFired = false
    const xOffset = pointerX * 0.12
    const yOffset = pointerY * -0.05
    activeCamera.position.x += (baseCameraPosition.x + xOffset - activeCamera.position.x) * 0.065
    activeCamera.position.y += (baseCameraPosition.y + yOffset - activeCamera.position.y) * 0.05
    activeCamera.position.z += (baseCameraPosition.z - activeCamera.position.z) * 0.04
  }
  ```

  Leave the phone/headphone projection lines below this block untouched.

- [ ] **Step 4: Verify the file compiles**

  ```bash
  cd d:/my-portfolio && pnpm check
  ```

  Expected: no TypeScript errors related to `PortfolioScene.svelte`.

- [ ] **Step 5: Commit**

  ```bash
  git add src/lib/components/scene/PortfolioScene.svelte
  git commit -m "feat: add camera zoom-to-monitor animation with onZoomComplete callback"
  ```

---

## Task 2: Create MonitorOS CSS

**Files:**
- Create: `src/lib/components/monitor-os/monitor-os.css`

- [ ] **Step 1: Create the CSS file**

  Create `src/lib/components/monitor-os/monitor-os.css` with the following content:

  ```css
  /* ── Overlay shell ── */
  .monitor-os {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    background: #070e1a;
    color: #e6f5ff;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    font-family: system-ui, sans-serif;
    font-size: 14px;
  }

  /* CRT scanlines */
  .monitor-os::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(89, 186, 255, 0.018) 3px,
      rgba(89, 186, 255, 0.018) 4px
    );
    pointer-events: none;
    z-index: 100;
  }

  .monitor-os.open {
    animation: os-flicker 0.45s ease-out both;
    pointer-events: auto;
  }

  @keyframes os-flicker {
    0%   { opacity: 0; }
    15%  { opacity: 0.65; }
    20%  { opacity: 0.2; }
    28%  { opacity: 0.85; }
    34%  { opacity: 0.4; }
    42%  { opacity: 1; }
    100% { opacity: 1; }
  }

  /* ── Titlebar ── */
  .os-titlebar {
    height: 44px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1rem;
    border-bottom: 1px solid rgba(89, 186, 255, 0.4);
    background: rgba(10, 20, 36, 0.98);
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }

  .os-brand {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  .brand-diamond {
    color: #59baff;
    font-size: 1rem;
  }

  .brand-name {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    color: #e6f5ff;
  }

  .brand-version {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    color: rgba(89, 186, 255, 0.45);
  }

  .os-address-bar {
    flex: 1;
    height: 26px;
    display: flex;
    align-items: center;
    padding: 0 0.6rem;
    gap: 2px;
    border: 1px solid rgba(89, 186, 255, 0.35);
    border-radius: 4px;
    background: rgba(4, 12, 24, 0.9);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.71rem;
    color: rgba(145, 220, 255, 0.85);
    overflow: hidden;
    white-space: nowrap;
  }

  .address-path {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cursor-blink {
    color: #59baff;
    animation: blink 1.1s step-end infinite;
    flex-shrink: 0;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  .os-close-btn {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 90, 90, 0.4);
    border-radius: 4px;
    background: rgba(255, 70, 70, 0.08);
    color: rgba(255, 140, 140, 0.9);
    font-size: 1.15rem;
    line-height: 1;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
  }

  .os-close-btn:hover {
    background: rgba(255, 70, 70, 0.22);
    border-color: rgba(255, 90, 90, 0.75);
  }

  /* ── Toolbar ── */
  .os-toolbar {
    height: 34px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.8rem;
    border-bottom: 1px solid rgba(89, 186, 255, 0.18);
    background: rgba(7, 14, 26, 0.95);
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }

  .toolbar-btn {
    height: 22px;
    padding: 0 0.55rem;
    border: 1px solid rgba(89, 186, 255, 0.32);
    border-radius: 3px;
    background: rgba(15, 30, 50, 0.8);
    color: #a9c8df;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
  }

  .toolbar-btn:disabled {
    opacity: 0.32;
    cursor: not-allowed;
  }

  .toolbar-btn:not(:disabled):hover {
    border-color: rgba(89, 186, 255, 0.65);
    background: rgba(20, 45, 70, 0.85);
    color: #e6f5ff;
  }

  .toolbar-breadcrumb {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    color: rgba(89, 186, 255, 0.42);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Body ── */
  .os-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    z-index: 2;
  }

  /* ── Sidebar ── */
  .os-sidebar {
    width: 175px;
    flex-shrink: 0;
    border-right: 1px solid rgba(89, 186, 255, 0.18);
    background: rgba(5, 11, 22, 0.98);
    padding: 0.6rem 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
  }

  .sidebar-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.16em;
    color: rgba(89, 186, 255, 0.38);
    padding: 0.5rem 0.75rem 0.2rem;
    margin: 0;
  }

  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.35rem 0.75rem;
    text-align: left;
    color: #a9c8df;
    font-size: 0.78rem;
    cursor: pointer;
    background: transparent;
    border: none;
    border-left: 2px solid transparent;
    transition: background 0.1s, border-color 0.1s, color 0.1s;
  }

  .sidebar-item:hover {
    background: rgba(89, 186, 255, 0.07);
    color: #e6f5ff;
  }

  .sidebar-item.active {
    border-left-color: #59baff;
    background: rgba(89, 186, 255, 0.1);
    color: #e6f5ff;
  }

  .sidebar-icon {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    color: rgba(89, 186, 255, 0.55);
    flex-shrink: 0;
  }

  /* ── Content area ── */
  .os-content {
    flex: 1;
    padding: 1.25rem;
    overflow-y: auto;
    position: relative;
  }

  /* File grid */
  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 90px));
    gap: 0.6rem;
    align-content: start;
  }

  .file-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.38rem;
    padding: 0.65rem 0.45rem;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    color: #c9e2f6;
    background: transparent;
    transition: border-color 0.15s, background 0.15s;
  }

  .file-icon:hover {
    border-color: rgba(89, 186, 255, 0.48);
    background: rgba(89, 186, 255, 0.07);
  }

  .file-icon:active {
    background: rgba(89, 186, 255, 0.14);
  }

  .file-icon small {
    font-size: 0.68rem;
    text-align: center;
    line-height: 1.3;
    word-break: break-word;
    max-width: 80px;
  }

  .file-chip {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 6px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .file-chip.dir {
    border: 1px solid rgba(255, 200, 80, 0.42);
    background: rgba(220, 163, 73, 0.15);
    color: #ffd88a;
  }

  .file-chip.txt {
    border: 1px solid rgba(89, 186, 255, 0.42);
    background: rgba(89, 186, 255, 0.1);
    color: #91d4ff;
  }

  .file-chip.prj {
    border: 1px solid rgba(160, 120, 255, 0.42);
    background: rgba(140, 100, 255, 0.12);
    color: #c5a6ff;
  }

  /* About text view */
  .text-file-view {
    max-width: 660px;
  }

  .text-file-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(89, 186, 255, 0.18);
  }

  .text-file-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #e6f5ff;
  }

  .text-file-body {
    font-size: 0.88rem;
    line-height: 1.7;
    color: #a9c8df;
    white-space: pre-wrap;
  }

  /* Project detail */
  .project-detail {
    max-width: 700px;
  }

  .detail-title {
    font-size: 1.45rem;
    font-weight: 600;
    color: #e6f5ff;
    margin: 0 0 0.6rem;
  }

  .detail-ext {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    color: rgba(89, 186, 255, 0.45);
    margin-left: 3px;
  }

  .detail-desc {
    color: #a9c8df;
    line-height: 1.6;
    margin: 0 0 1.25rem;
    font-size: 0.9rem;
  }

  .detail-meta-row {
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
  }

  .detail-meta {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
    padding: 0.5rem 0.7rem;
    border: 1px solid rgba(89, 186, 255, 0.28);
    border-radius: 6px;
    background: rgba(10, 22, 38, 0.85);
  }

  .meta-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.14em;
    color: rgba(89, 186, 255, 0.45);
    margin: 0 0 0.1rem;
    text-transform: uppercase;
  }

  .detail-meta strong {
    font-size: 0.84rem;
    color: #e6f5ff;
  }

  .detail-highlights {
    border: 1px solid rgba(89, 186, 255, 0.18);
    border-radius: 6px;
    background: rgba(10, 22, 38, 0.6);
    padding: 0.75rem 1rem;
  }

  .detail-highlights ul {
    list-style: none;
    padding: 0;
    margin: 0.3rem 0 0;
  }

  .detail-highlights li {
    color: #b8d8f0;
    font-size: 0.85rem;
    padding: 0.28rem 0;
    border-bottom: 1px solid rgba(89, 186, 255, 0.09);
  }

  .detail-highlights li:last-child {
    border-bottom: none;
  }

  /* ── Status bar ── */
  .os-statusbar {
    height: 26px;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0 0.8rem;
    border-top: 1px solid rgba(89, 186, 255, 0.18);
    background: rgba(5, 11, 22, 0.98);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    color: rgba(89, 186, 255, 0.4);
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }

  .status-dot {
    color: #3ddc84;
    font-size: 0.45rem;
  }

  .status-spacer {
    flex: 1;
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add src/lib/components/monitor-os/monitor-os.css
  git commit -m "feat: add MonitorOS stylesheet with cyberpunk aesthetic"
  ```

---

## Task 3: Create MonitorOS.svelte

**Files:**
- Create: `src/lib/components/monitor-os/MonitorOS.svelte`

- [ ] **Step 1: Create the component**

  Create `src/lib/components/monitor-os/MonitorOS.svelte`:

  ```svelte
  <script lang="ts">
    import { aboutMeText, projectFiles, type ProjectFile } from '$lib/data/projects.js'
    import './monitor-os.css'

    type ViewState = 'desktop' | 'about' | 'projects' | 'project-detail'

    let { open = false, onClose }: { open?: boolean; onClose: () => void } = $props()

    let viewState = $state<ViewState>('desktop')
    let selectedProject = $state<ProjectFile | null>(null)
    let history = $state<ViewState[]>([])

    function currentPath(): string {
      if (viewState === 'desktop') return 'C:/Desktop/'
      if (viewState === 'about') return 'C:/Desktop/About Me.txt'
      if (viewState === 'projects') return 'C:/Desktop/Projects/'
      if (viewState === 'project-detail' && selectedProject)
        return `C:/Desktop/Projects/${selectedProject.name}.prj`
      return 'C:/'
    }

    function itemCount(): string {
      if (viewState === 'desktop') return '2 items'
      if (viewState === 'projects') return `${projectFiles.length} items`
      return '1 item'
    }

    function navigate(to: ViewState) {
      history = [...history, viewState]
      viewState = to
    }

    function goBack() {
      if (history.length === 0) return
      viewState = history[history.length - 1]
      history = history.slice(0, -1)
    }

    function openProject(project: ProjectFile) {
      selectedProject = project
      navigate('project-detail')
    }

    function goToDesktop() {
      history = []
      viewState = 'desktop'
    }

    $effect(() => {
      if (!open) {
        viewState = 'desktop'
        history = []
        selectedProject = null
      }
    })

    let clickSound: HTMLAudioElement | null = null
    function playClick() {
      if (typeof Audio === 'undefined') return
      if (!clickSound) {
        clickSound = new Audio('/sound/click.mp3')
        clickSound.preload = 'auto'
        clickSound.volume = 0.9
      }
      clickSound.currentTime = 0
      void clickSound.play().catch(() => {})
    }

    function handleClose() {
      playClick()
      onClose()
    }

    function handleBack() {
      playClick()
      goBack()
    }
  </script>

  <div class="monitor-os" class:open>
    <!-- Titlebar -->
    <header class="os-titlebar">
      <div class="os-brand">
        <span class="brand-diamond">◈</span>
        <span class="brand-name">RACHNA-OS</span>
        <span class="brand-version">v1.0</span>
      </div>
      <div class="os-address-bar">
        <span class="address-path">{currentPath()}</span>
        <span class="cursor-blink">_</span>
      </div>
      <button class="os-close-btn" onclick={handleClose} aria-label="Close">×</button>
    </header>

    <!-- Toolbar -->
    <div class="os-toolbar">
      <button class="toolbar-btn" onclick={handleBack} disabled={history.length === 0}>
        ‹ Back
      </button>
      <span class="toolbar-breadcrumb">{currentPath()}</span>
    </div>

    <!-- Body -->
    <div class="os-body">
      <!-- Sidebar -->
      <nav class="os-sidebar">
        <div class="sidebar-section">
          <p class="sidebar-label">DRIVES</p>
          <button
            class="sidebar-item"
            class:active={viewState === 'desktop'}
            onclick={() => { playClick(); goToDesktop() }}
          >
            <span class="sidebar-icon">[C:/]</span> Local Disk
          </button>
        </div>
        <div class="sidebar-section">
          <p class="sidebar-label">PINNED</p>
          <button
            class="sidebar-item"
            class:active={viewState === 'desktop'}
            onclick={() => { playClick(); goToDesktop() }}
          >
            <span class="sidebar-icon">[DIR]</span> Desktop
          </button>
          <button
            class="sidebar-item"
            class:active={viewState === 'projects' || viewState === 'project-detail'}
            onclick={() => { playClick(); navigate('projects') }}
          >
            <span class="sidebar-icon">[DIR]</span> Projects
          </button>
          <button
            class="sidebar-item"
            class:active={viewState === 'about'}
            onclick={() => { playClick(); navigate('about') }}
          >
            <span class="sidebar-icon">[TXT]</span> About Me
          </button>
        </div>
      </nav>

      <!-- Content -->
      <main class="os-content">
        {#if viewState === 'desktop'}
          <div class="file-grid">
            <button class="file-icon" onclick={() => { playClick(); navigate('projects') }}>
              <span class="file-chip dir">[DIR]</span>
              <small>Projects</small>
            </button>
            <button class="file-icon" onclick={() => { playClick(); navigate('about') }}>
              <span class="file-chip txt">[TXT]</span>
              <small>About Me.txt</small>
            </button>
          </div>

        {:else if viewState === 'about'}
          <div class="text-file-view">
            <div class="text-file-header">
              <span class="file-chip txt">[TXT]</span>
              <h2>About Me.txt</h2>
            </div>
            <p class="text-file-body">{aboutMeText}</p>
          </div>

        {:else if viewState === 'projects'}
          <div class="file-grid">
            {#each projectFiles as project (project.name)}
              <button class="file-icon" onclick={() => { playClick(); openProject(project) }}>
                <span class="file-chip prj">[PRJ]</span>
                <small>{project.name}</small>
              </button>
            {/each}
          </div>

        {:else if viewState === 'project-detail' && selectedProject}
          <article class="project-detail">
            <h2 class="detail-title">
              {selectedProject.name}<span class="detail-ext">.prj</span>
            </h2>
            <p class="detail-desc">{selectedProject.description}</p>
            <div class="detail-meta-row">
              <div class="detail-meta">
                <p class="meta-label">STACK</p>
                <strong>{selectedProject.stack}</strong>
              </div>
              <div class="detail-meta">
                <p class="meta-label">YEAR</p>
                <strong>{selectedProject.year}</strong>
              </div>
            </div>
            <div class="detail-highlights">
              <p class="meta-label">HIGHLIGHTS</p>
              <ul>
                {#each selectedProject.highlights as point (point)}
                  <li>› {point}</li>
                {/each}
              </ul>
            </div>
          </article>
        {/if}
      </main>
    </div>

    <!-- Status bar -->
    <footer class="os-statusbar">
      <span>{itemCount()}</span>
      <span class="status-dot">●</span>
      <span>ONLINE</span>
      <span class="status-spacer"></span>
      <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
    </footer>
  </div>
  ```

- [ ] **Step 2: Verify the file compiles**

  ```bash
  cd d:/my-portfolio && pnpm check
  ```

  Expected: no errors in `MonitorOS.svelte`.

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/components/monitor-os/MonitorOS.svelte
  git commit -m "feat: add MonitorOS full-screen cyberpunk explorer component"
  ```

---

## Task 4: Update +page.svelte

**Files:**
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Replace hologram imports with MonitorOS**

  In `src/routes/+page.svelte`, remove these import lines:

  ```typescript
  import HologramDesktop from '$lib/components/hologram/HologramDesktop.svelte'
  ```

  Add in its place:

  ```typescript
  import MonitorOS from '$lib/components/monitor-os/MonitorOS.svelte'
  ```

- [ ] **Step 2: Replace hologram state variables**

  Remove these state declarations:

  ```typescript
  let hologramOpen = $state(false)
  let monitorOn = $state(false)
  ```

  Replace with:

  ```typescript
  let isMonitorOn = $state(false)
  let monitorOSOpen = $state(false)
  ```

- [ ] **Step 3: Replace monitor handler functions**

  Remove `openMonitorExperience` and `closeMonitorExperience`:

  ```typescript
  function openMonitorExperience() {
    playMonitorTap()
    monitorOn = true
    hologramOpen = true
  }

  function closeMonitorExperience() {
    hologramOpen = false
    monitorOn = false
  }
  ```

  Replace with:

  ```typescript
  function handleMonitorOpen() {
    playMonitorTap()
    isMonitorOn = true
  }

  function handleZoomComplete() {
    monitorOSOpen = true
  }

  function handleOSClose() {
    monitorOSOpen = false
    isMonitorOn = false
  }
  ```

- [ ] **Step 4: Update the PortfolioScene usage**

  Find the `<PortfolioScene ... />` element and update it:

  - Change `onMonitorOpen={openMonitorExperience}` → `onMonitorOpen={handleMonitorOpen}`
  - Change `isMonitorOn={monitorOn}` → `isMonitorOn={isMonitorOn}`
  - Add `onZoomComplete={handleZoomComplete}`

  The updated element:

  ```svelte
  <PortfolioScene
    onMonitorOpen={handleMonitorOpen}
    isMonitorOn={isMonitorOn}
    onZoomComplete={handleZoomComplete}
    onPhoneSelect={toggleContactPopup}
    onPhoneAnchorChange={handlePhoneAnchorChange}
    isPhonePopupOpen={contactPopupOpen}
    onHeadphoneSelect={toggleMusicPopup}
    onHeadphoneAnchorChange={handleHeadphoneAnchorChange}
  />
  ```

- [ ] **Step 5: Replace HologramDesktop with MonitorOS in the template**

  Find:

  ```svelte
  <HologramDesktop open={hologramOpen} onClose={closeMonitorExperience} />
  ```

  Replace with:

  ```svelte
  <MonitorOS open={monitorOSOpen} onClose={handleOSClose} />
  ```

- [ ] **Step 6: Verify the file compiles**

  ```bash
  cd d:/my-portfolio && pnpm check
  ```

  Expected: no TypeScript errors. There will be unused-import warnings for the hologram components — those get cleaned up in Task 5.

- [ ] **Step 7: Commit**

  ```bash
  git add src/routes/+page.svelte
  git commit -m "feat: wire MonitorOS into page, replace hologram state"
  ```

---

## Task 5: Delete Hologram Files

**Files:**
- Delete: `src/lib/components/hologram/HologramDesktop.svelte`
- Delete: `src/lib/components/hologram/HologramTopbar.svelte`
- Delete: `src/lib/components/hologram/HologramTaskbar.svelte`
- Delete: `src/lib/components/hologram/hologram.css`
- Delete: `src/lib/components/hologram/phone-contact-popup.css` — only if it is only used by the hologram; check first
- Keep: `src/lib/components/hologram/PhoneContactPopup.svelte` — still used
- Keep: `src/lib/components/hologram/HeadphoneMusicPopup.svelte` — still used
- Keep: `src/lib/components/hologram/HeadphoneMusicNotes.svelte` — still used
- Keep: `src/lib/components/hologram/headphone-music-popup.css` — still used

- [ ] **Step 1: Check phone-contact-popup.css is not imported by hologram files only**

  ```bash
  grep -r "phone-contact-popup" d:/my-portfolio/src
  ```

  If it is only imported by `PhoneContactPopup.svelte` (not the hologram files), keep it. It is safe to keep regardless.

- [ ] **Step 2: Delete the four hologram files**

  ```bash
  cd d:/my-portfolio
  rm src/lib/components/hologram/HologramDesktop.svelte
  rm src/lib/components/hologram/HologramTopbar.svelte
  rm src/lib/components/hologram/HologramTaskbar.svelte
  rm src/lib/components/hologram/hologram.css
  ```

- [ ] **Step 3: Run type-check to confirm no broken imports**

  ```bash
  pnpm check
  ```

  Expected: clean. If any file still imports from the deleted paths, fix it now by removing the import line.

- [ ] **Step 4: Commit**

  ```bash
  git add -A
  git commit -m "chore: delete hologram desktop components replaced by MonitorOS"
  ```

---

## Task 6: End-to-End Verification

- [ ] **Step 1: Start the dev server**

  ```bash
  cd d:/my-portfolio && pnpm dev
  ```

  Open `http://localhost:5173` in a browser. Wait for the loading screen to complete.

- [ ] **Step 2: Test the zoom-in flow**

  - Click the monitor model.
  - The camera should visibly lerp toward the monitor screen (zooming in).
  - After ~700ms, the MonitorOS overlay should fade in with the CRT flicker effect.
  - The titlebar should show `◈ RACHNA-OS v1.0` and the address bar `C:/Desktop/`.

- [ ] **Step 3: Test navigation**

  - Click `Projects` folder icon → file grid of project `.prj` icons appears, address bar updates to `C:/Desktop/Projects/`.
  - Click any project file → detail view appears with name, stack, year, highlights.
  - Click `‹ Back` → returns to Projects grid.
  - Click `‹ Back` again → returns to Desktop.
  - Click `About Me.txt` → text file view appears.
  - Click sidebar items → navigate directly between views.

- [ ] **Step 4: Test close and zoom-out**

  - Click the `×` close button.
  - MonitorOS fades out.
  - Camera lerps back to base position `[0, 1, 2]`.
  - 3D scene is visible again, mouse parallax resumes.

- [ ] **Step 5: Verify phone and headphone popups still work**

  - Click the iPhone model → contact popup appears.
  - Click the headphone model → music player popup appears.
  - Neither should be broken by the MonitorOS changes.

- [ ] **Step 6: Final commit**

  ```bash
  git add -A
  git commit -m "feat: complete monitor OS — camera zoom + full-screen explorer UI"
  ```

---

## Self-Review Against Spec

| Spec requirement | Task that covers it |
|---|---|
| Camera zooms to monitor on click | Task 1 |
| `onZoomComplete` fires when camera arrives | Task 1 |
| Full-screen OS overlay fades in | Task 3 (`.open` class + animation) |
| Cyberpunk palette matching hologram | Task 2 (same `#070e1a`, cyan `#59baff`) |
| CRT scanlines | Task 2 (`.monitor-os::before`) |
| `Share Tech Mono` for address bar | Task 2 + Task 3 |
| Sidebar with drives + pinned shortcuts | Task 3 |
| Address bar showing current path | Task 3 (`currentPath()`) |
| Back navigation via history stack | Task 3 (`history` array, `goBack()`) |
| Desktop → Projects → Project detail | Task 3 (three view states) |
| About view | Task 3 (`about` view state) |
| File chips `[DIR]`, `[TXT]`, `[PRJ]` | Task 2 + Task 3 |
| OS close → camera zoom back | Task 4 (`handleOSClose` resets `isMonitorOn`) |
| Delete hologram files | Task 5 |
| Phone + headphone popups unaffected | Task 6 verification |
| `projects.ts` imported directly | Task 3 |
