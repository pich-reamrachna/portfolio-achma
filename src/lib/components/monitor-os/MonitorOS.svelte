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
					onclick={() => {
						playClick()
						goToDesktop()
					}}
				>
					<span class="sidebar-icon">[C:/]</span> Local Disk
				</button>
			</div>
			<div class="sidebar-section">
				<p class="sidebar-label">PINNED</p>
				<button
					class="sidebar-item"
					class:active={viewState === 'desktop'}
					onclick={() => {
						playClick()
						goToDesktop()
					}}
				>
					<span class="sidebar-icon">[DIR]</span> Desktop
				</button>
				<button
					class="sidebar-item"
					class:active={viewState === 'projects' || viewState === 'project-detail'}
					onclick={() => {
						playClick()
						navigate('projects')
					}}
				>
					<span class="sidebar-icon">[DIR]</span> Projects
				</button>
				<button
					class="sidebar-item"
					class:active={viewState === 'about'}
					onclick={() => {
						playClick()
						navigate('about')
					}}
				>
					<span class="sidebar-icon">[TXT]</span> About Me
				</button>
			</div>
		</nav>

		<!-- Content -->
		<main class="os-content">
			{#if viewState === 'desktop'}
				<div class="file-grid">
					<button
						class="file-icon"
						onclick={() => {
							playClick()
							navigate('projects')
						}}
					>
						<span class="file-chip dir">[DIR]</span>
						<small>Projects</small>
					</button>
					<button
						class="file-icon"
						onclick={() => {
							playClick()
							navigate('about')
						}}
					>
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
						<button
							class="file-icon"
							onclick={() => {
								playClick()
								openProject(project)
							}}
						>
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
		<span
			>{new Date().toLocaleDateString('en-US', {
				month: 'short',
				day: '2-digit',
				year: 'numeric'
			})}</span
		>
	</footer>
</div>
