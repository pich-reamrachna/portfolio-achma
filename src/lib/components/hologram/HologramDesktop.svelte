<script lang="ts">
	import { aboutMeText, projectFiles, type ProjectFile } from '../../data/projects.js'
	import HologramTopbar from './HologramTopbar.svelte'
	import HologramTaskbar from './HologramTaskbar.svelte'
	import './hologram.css'

	type ViewMode = 'desktop' | 'about' | 'projects' | 'project-detail'

	let { open = false, onClose }: { open?: boolean; onClose: () => void } = $props()

	let viewMode = $state<ViewMode>('desktop')
	let selectedProject = $state<ProjectFile>(projectFiles[0])

	$effect(() => {
		if (open) {
			viewMode = 'desktop'
		}
	})

	function openAboutFile() {
		viewMode = 'about'
	}

	function openProjectsFolder() {
		viewMode = 'projects'
	}

	function openProjectFile(project: ProjectFile) {
		selectedProject = project
		viewMode = 'project-detail'
	}

	function goBack() {
		if (viewMode === 'project-detail') {
			viewMode = 'projects'
			return
		}
		if (viewMode === 'projects' || viewMode === 'about') {
			viewMode = 'desktop'
		}
	}

	const getTitle = () => {
		if (viewMode === 'about') return 'About Me.txt'
		if (viewMode === 'projects') return 'Projects'
		if (viewMode === 'project-detail') return selectedProject.name
		return 'Desktop'
	}

	const getPath = () => {
		if (viewMode === 'about') return 'C:/Users/you/Desktop/About Me.txt'
		if (viewMode === 'projects') return 'C:/Users/you/Desktop/Projects'
		if (viewMode === 'project-detail')
			return `C:/Users/you/Desktop/Projects/${selectedProject.name}`
		return 'C:/Users/you/Desktop'
	}
</script>

<div class:open class="holo-wrap">
	<section class="holo-desktop">
		<HologramTopbar
			title={getTitle()}
			path={getPath()}
			canGoBack={viewMode !== 'desktop'}
			onBack={goBack}
			{onClose}
		/>

		<div class="desktop-body">
			{#if viewMode === 'desktop'}
				<div class="desktop-grid">
					<button class="desktop-icon" onclick={openAboutFile}>
						<span class="icon-file">TXT</span>
						<small>About Me</small>
					</button>
					<button class="desktop-icon" onclick={openProjectsFolder}>
						<span class="icon-folder">DIR</span>
						<small>Projects</small>
					</button>
				</div>
			{:else if viewMode === 'about'}
				<article class="file-view">
					<h3>About Me</h3>
					<p>{aboutMeText}</p>
				</article>
			{:else if viewMode === 'projects'}
				<div class="folder-view">
					{#each projectFiles as project (project.name)}
						<button class="project-row" onclick={() => openProjectFile(project)}>
							<span class="file-chip">PRJ</span>
							<div>
								<strong>{project.name}</strong>
								<small>{project.stack}</small>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<article class="file-view">
					<h3>{selectedProject.name}</h3>
					<p>{selectedProject.description}</p>
					<div class="meta">
						<span>Stack</span>
						<strong>{selectedProject.stack}</strong>
					</div>
					<div class="meta">
						<span>Year</span>
						<strong>{selectedProject.year}</strong>
					</div>
					<ul>
						{#each selectedProject.highlights as point (point)}
							<li>{point}</li>
						{/each}
					</ul>
				</article>
			{/if}
		</div>

		<HologramTaskbar />
	</section>
</div>
