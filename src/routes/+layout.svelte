<script lang="ts">
	import './layout.css'

	const { children } = $props()
</script>

<svelte:head>
	<title>Achma | Portfolio</title>
	<meta
		name="description"
		content="Interactive 3D portfolio showcasing web and cybersecurity projects."
	/>
	<link rel="canonical" href="https://achma.site/" />

	<meta name="robots" content="index,follow,max-image-preview:large" />
	<meta name="theme-color" content="#06080f" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Achma Portfolio" />
	<meta property="og:title" content="Achma | Portfolio" />
	<meta
		property="og:description"
		content="Interactive 3D portfolio showcasing web and cybersecurity projects."
	/>
	<meta property="og:url" content="https://achma.site/" />
	<meta property="og:image" content="https://achma.site/og-cover.jpg?v=2" />
	<meta property="og:image:secure_url" content="https://achma.site/og-cover.jpg?v=2" />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="3780" />
	<meta property="og:image:height" content="1890" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Achma | Portfolio" />
	<meta
		name="twitter:description"
		content="Interactive 3D portfolio showcasing frontend projects, UI experiments, and creative web experiences."
	/>
	<meta name="twitter:image" content="https://achma.site/og-cover.jpg?v=2" />
</svelte:head>

{@render children()}
