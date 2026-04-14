<script lang="ts">
	let {
		title,
		path,
		canGoBack,
		onBack,
		onClose
	}: {
		title: string
		path: string
		canGoBack: boolean
		onBack: () => void
		onClose: () => void
	} = $props()
</script>

<header class="desktop-topbar">
	<button class="nav-btn" onclick={onBack} disabled={!canGoBack}>&lt;</button>
	<div class="title-wrap">
		<h2>{title}</h2>
		<p>{path}</p>
	</div>
	<button class="close-btn" onclick={onClose}>X</button>
</header>
