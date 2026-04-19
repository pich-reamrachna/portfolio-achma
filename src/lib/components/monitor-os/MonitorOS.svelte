<script lang="ts">
	import {
		aboutMeText,
		projectFiles,
		creditAssets,
		reportFiles,
		type ProjectFile
	} from '$lib/data/projects.js'
	import './monitor-os.css'

	type ViewState = 'desktop' | 'about' | 'projects' | 'project-detail' | 'credits' | 'reports'

	let { open = false, onClose }: { open?: boolean; onClose: () => void } = $props()

	let viewState = $state<ViewState>('desktop')
	let selectedProject = $state<ProjectFile | null>(null)
	let history = $state<ViewState[]>([])

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

	function itemCount(): string {
		if (viewState === 'desktop') return '4 items'
		if (viewState === 'projects') return `${projectFiles.length} items`
		if (viewState === 'credits') return `${creditAssets.length} items`
		if (viewState === 'reports') return `${reportFiles.length} items`
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
					<span class="sidebar-icon">[TXT]</span> hi
				</button>
				<button
					class="sidebar-item"
					class:active={viewState === 'credits'}
					onclick={() => {
						playClick()
						navigate('credits')
					}}
				>
					<span class="sidebar-icon">[CRD]</span> Credits
				</button>
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
						<small>hi.txt</small>
					</button>
					<button
						class="file-icon"
						onclick={() => {
							playClick()
							navigate('credits')
						}}
					>
						<span class="file-chip crd">[CRD]</span>
						<small>Credits</small>
					</button>
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
				</div>
			{:else if viewState === 'about'}
				<div class="text-file-view">
					<div class="text-file-header">
						<span class="file-chip txt">[TXT]</span>
						<h2>hi.txt</h2>
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
				<div class="dossier">
					<!-- ── Left profile card ── -->
					<div class="dossier-card">
						<div class="card-class-bar">
							<span>// CLASSIFIED</span>
							<span class="card-live">● ACTIVE</span>
						</div>

						<div class="card-visual">
							<div class="card-grid"></div>
							<div class="card-sweep"></div>
							<span class="card-monogram">
								{selectedProject.name
									.split(' ')
									.map((w) => w[0])
									.join('')}
							</span>
						</div>

						<div class="card-info">
							<p class="card-obj-id">
								OBJ-{selectedProject.year}-{selectedProject.name
									.replace(/\s/g, '')
									.toUpperCase()
									.slice(0, 6)}
							</p>
							<h2 class="card-name">{selectedProject.name}</h2>
							{#if selectedProject.github}
								<button
									class="card-github"
									onclick={() =>
										window.open(selectedProject!.github, '_blank', 'noopener,noreferrer')}
								>
									<span class="card-github-icon">⌥</span> VIEW ON GITHUB
								</button>
							{/if}
							{#if selectedProject.url}
								<button
									class="card-url"
									onclick={() => window.open(selectedProject!.url, '_blank', 'noopener,noreferrer')}
								>
									<span class="card-url-icon">▶</span> VISIT WEBSITE
								</button>
							{/if}
						</div>

						<span class="card-corner"></span>
					</div>

					<!-- ── Right intel panel ── -->
					<div class="dossier-intel">
						<div class="intel-header">
							<p class="intel-op">-TECHNICAL DOSSIER-</p>
							<div class="intel-meta-row">
								<span class="intel-meta-pair">
									<span class="imk">Status</span><span class="ims">:</span><strong class="imv"
										>ACTIVE</strong
									>
								</span>
								<span class="intel-meta-pair">
									<span class="imk">Initiated</span><span class="ims">:</span><strong class="imv"
										>{selectedProject.year}</strong
									>
								</span>
							</div>
						</div>

						<p class="intel-desc">{selectedProject.description}</p>

						<div class="intel-block">
							<p class="intel-block-label">-TECH SIGNATURES-</p>
							<div class="sig-grid">
								{#each selectedProject.stack.split(', ') as tech, i (tech)}
									<div class="sig-row">
										<span class="sig-name">{tech}</span>
										<span class="sig-line"></span>
										<span class="sig-id">SIG.{String(i + 1).padStart(3, '0')}</span>
									</div>
								{/each}
							</div>
						</div>

						<div class="intel-block">
							<p class="intel-block-label">-CAPABILITIES-</p>
							<ul class="cap-list">
								{#each selectedProject.highlights as point (point)}
									<li class="cap-item">
										<span class="cap-mark">›</span>
										<span class="cap-text">{point}</span>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			{:else if viewState === 'credits'}
				<div class="credits-grid">
					{#each creditAssets as asset, i (asset.name)}
						<div class="credit-card">
							<div class="credit-header">
								<span class="credit-type-badge">3D MODEL</span>
								<span class="credit-hp">HP<span class="credit-hp-val">{asset.hp}</span></span>
							</div>

							<div class="credit-visual">
								<div class="credit-grid-bg"></div>
								<span class="credit-icon">{asset.icon}</span>
							</div>

							<div class="credit-body">
								<h3 class="credit-name">{asset.name}</h3>
								<p class="credit-creator">by {asset.creator || '—'}</p>

								<div class="credit-stats">
									<div class="credit-stat">
										<span class="credit-stat-key">LICENSE</span>
										<span class="credit-stat-dots"></span>
										<span class="credit-stat-val">{asset.license || '—'}</span>
									</div>
									<div class="credit-stat">
										<span class="credit-stat-key">ABILITY</span>
										<span class="credit-stat-dots"></span>
										<span class="credit-stat-val">{asset.ability}</span>
									</div>
								</div>

								{#if asset.url}
									<button
										class="credit-visit-btn"
										onclick={() => window.open(asset.url, '_blank', 'noopener,noreferrer')}
									>
										<span>▶</span> VISIT SOURCE
									</button>
								{/if}
							</div>

							<div class="credit-card-num">
								ASSET-{String(i + 1).padStart(3, '0')}/{String(creditAssets.length).padStart(
									3,
									'0'
								)}
							</div>
						</div>
					{/each}
				</div>
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
