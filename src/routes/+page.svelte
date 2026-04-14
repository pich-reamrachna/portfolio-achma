<script lang="ts">
	import { Canvas } from '@threlte/core'
	import PortfolioScene from '$lib/components/scene/PortfolioScene.svelte'
	import HologramDesktop from '$lib/components/hologram/HologramDesktop.svelte'
	import './page.css'

	let hologramOpen = $state(false)
	let monitorOn = $state(false)

	function openMonitorExperience() {
		monitorOn = true
		hologramOpen = true
	}

	function closeMonitorExperience() {
		hologramOpen = false
		monitorOn = false
	}
</script>

<div class="page">
	<Canvas shadows>
		<PortfolioScene onMonitorOpen={openMonitorExperience} isMonitorOn={monitorOn} />
	</Canvas>

	<HologramDesktop open={hologramOpen} onClose={closeMonitorExperience} />
</div>
