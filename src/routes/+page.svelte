<script lang="ts">
	import { Canvas } from '@threlte/core'
	import PortfolioScene from '$lib/components/scene/PortfolioScene.svelte'
	import HologramDesktop from '$lib/components/hologram/HologramDesktop.svelte'
	import PhoneContactPopup from '$lib/components/hologram/PhoneContactPopup.svelte'
	import './page.css'

	let hologramOpen = $state(false)
	let monitorOn = $state(false)
	let contactPopupOpen = $state(false)
	let phoneAnchor = $state({ x: 0, y: 0 })

	function openMonitorExperience() {
		monitorOn = true
		hologramOpen = true
	}

	function closeMonitorExperience() {
		hologramOpen = false
		monitorOn = false
	}

	function toggleContactPopup() {
		contactPopupOpen = !contactPopupOpen
	}

	function handlePhoneAnchorChange(anchor: { x: number; y: number }) {
		phoneAnchor = anchor
	}
</script>

<div class="page">
	<Canvas shadows>
		<PortfolioScene
			onMonitorOpen={openMonitorExperience}
			isMonitorOn={monitorOn}
			onPhoneSelect={toggleContactPopup}
			onPhoneAnchorChange={handlePhoneAnchorChange}
		/>
	</Canvas>

	<HologramDesktop open={hologramOpen} onClose={closeMonitorExperience} />
	<PhoneContactPopup
		open={contactPopupOpen}
		anchor={phoneAnchor}
		onClose={() => (contactPopupOpen = false)}
	/>
</div>
