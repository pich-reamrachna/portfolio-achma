<script lang="ts">
	import { Canvas } from '@threlte/core'
	import PortfolioScene from '$lib/components/scene/PortfolioScene.svelte'
</script>

<div class="page">
	<Canvas>
		<PortfolioScene />
	</Canvas>
</div>

<style>
	.page {
		width: 100%;
		height: 100vh;
	}
</style>
