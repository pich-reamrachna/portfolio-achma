<script lang="ts">
	import { Canvas } from '@threlte/core'
	import PortfolioScene from '$lib/components/scene/PortfolioScene.svelte'
	import HologramDesktop from '$lib/components/hologram/HologramDesktop.svelte'
	import PhoneContactPopup from '$lib/components/hologram/PhoneContactPopup.svelte'
	import HeadphoneMusicPopup from '$lib/components/hologram/HeadphoneMusicPopup.svelte'
	import HeadphoneMusicNotes from '$lib/components/hologram/HeadphoneMusicNotes.svelte'
	import LoadingScreen from '$lib/components/LoadingScreen.svelte'
	import { createSound } from '$lib/sound'
	import './page.css'

	// ── Performance detection ──────────────────────────────────────
	// Runs synchronously in browser before first render so Canvas gets
	// the right quality settings immediately without remounting.
	function detectHighPerf(): boolean {
		if (typeof window === 'undefined') return true
		const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory
		if (mem !== undefined && mem <= 2) return false
		const cores = navigator.hardwareConcurrency
		if (cores !== undefined && cores <= 2) return false
		return true
	}
	const highPerf = detectHighPerf()

	let sceneVisible = $state(false)

	let hologramOpen = $state(false)
	let monitorOn = $state(false)
	let contactPopupOpen = $state(false)
	let musicPopupOpen = $state(false)
	let headphoneMusicPlaying = $state(false)
	let phoneAnchor = $state({ x: 0, y: 0 })
	let headphoneAnchor = $state({ x: 0, y: 0 })
	let suppressPhoneToggleUntil = 0
	let ignoreOutsideCloseUntil = 0
	let suppressHeadphoneToggleUntil = 0
	let ignoreHeadphoneOutsideCloseUntil = 0

	let playPhoneClick = () => {}
	let playMonitorTap = () => {}

	$effect(() => {
		const phoneClick = createSound('/sound/bubble-pop.mp3', 0.85)
		const monitorTap = createSound('/sound/tap-light.mp3', 0.85, 120)
		playPhoneClick = phoneClick.play
		playMonitorTap = monitorTap.play
		return () => {
			phoneClick.destroy()
			monitorTap.destroy()
			playPhoneClick = () => {}
			playMonitorTap = () => {}
		}
	})

	function openMonitorExperience() {
		playMonitorTap()
		monitorOn = true
		hologramOpen = true
	}

	function closeMonitorExperience() {
		hologramOpen = false
		monitorOn = false
	}

	function toggleContactPopup() {
		playPhoneClick()

		const now = performance.now()
		if (now < suppressPhoneToggleUntil) return

		contactPopupOpen = !contactPopupOpen
		if (contactPopupOpen) {
			// Ignore the same click cycle that opened the popup.
			ignoreOutsideCloseUntil = now + 120
		}
	}

	function toggleMusicPopup() {
		const now = performance.now()
		if (now < suppressHeadphoneToggleUntil) return

		musicPopupOpen = !musicPopupOpen
		if (musicPopupOpen) {
			ignoreHeadphoneOutsideCloseUntil = now + 120
		}
	}

	function handlePhoneAnchorChange(anchor: { x: number; y: number }) {
		phoneAnchor = anchor
	}

	function handleHeadphoneAnchorChange(anchor: { x: number; y: number }) {
		headphoneAnchor = anchor
	}

	$effect(() => {
		if (!contactPopupOpen) return

		const handleWindowClick = (event: MouseEvent) => {
			const now = performance.now()
			if (now < ignoreOutsideCloseUntil) return

			const target = event.target
			if (target instanceof Element && target.closest('.phone-holo-card')) return
			contactPopupOpen = false
			// If this close came from the same click that also hits the phone,
			// prevent immediate reopen.
			suppressPhoneToggleUntil = now + 120
		}

		window.addEventListener('click', handleWindowClick)
		return () => {
			window.removeEventListener('click', handleWindowClick)
		}
	})

	$effect(() => {
		if (!musicPopupOpen) return

		const handleWindowClick = (event: MouseEvent) => {
			const now = performance.now()
			if (now < ignoreHeadphoneOutsideCloseUntil) return

			const target = event.target
			if (target instanceof Element && target.closest('.headphone-player-card')) return
			musicPopupOpen = false
			suppressHeadphoneToggleUntil = now + 120
		}

		window.addEventListener('click', handleWindowClick)
		return () => {
			window.removeEventListener('click', handleWindowClick)
		}
	})
</script>

<svelte:head>
	<!-- Preload the heaviest primary models so the browser fetches them before JS parses -->
	<link rel="preload" href="/models/desk.glb" as="fetch" crossorigin="anonymous" />
	<link rel="preload" href="/models/monitor.glb" as="fetch" crossorigin="anonymous" />
	<link rel="preload" href="/models/iphone.glb" as="fetch" crossorigin="anonymous" />
	<link rel="preload" href="/models/headphone.glb" as="fetch" crossorigin="anonymous" />
</svelte:head>

<div class="page">
	<!-- Canvas renders behind the loading screen so assets load immediately -->
	<div class="scene-wrap" class:visible={sceneVisible}>
		<Canvas shadows={highPerf} dpr={highPerf ? 2 : 1}>
			<PortfolioScene
				onMonitorOpen={openMonitorExperience}
				isMonitorOn={monitorOn}
				onPhoneSelect={toggleContactPopup}
				onPhoneAnchorChange={handlePhoneAnchorChange}
				isPhonePopupOpen={contactPopupOpen}
				onHeadphoneSelect={toggleMusicPopup}
				onHeadphoneAnchorChange={handleHeadphoneAnchorChange}
			/>
		</Canvas>
	</div>

	<HologramDesktop open={hologramOpen} onClose={closeMonitorExperience} />
	<PhoneContactPopup open={contactPopupOpen} anchor={phoneAnchor} />
	<HeadphoneMusicNotes open={headphoneMusicPlaying} anchor={headphoneAnchor} />
	<HeadphoneMusicPopup
		open={musicPopupOpen}
		anchor={headphoneAnchor}
		onPlaybackChange={(playing) => (headphoneMusicPlaying = playing)}
	/>

	<LoadingScreen onDone={() => (sceneVisible = true)} />
</div>
