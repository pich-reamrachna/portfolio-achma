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
	let suppressPhoneToggleUntil = 0
	let ignoreOutsideCloseUntil = 0
	let phoneClickSound: HTMLAudioElement | null = null
	let monitorTapSound: HTMLAudioElement | null = null
	let lastMonitorTapSoundAt = 0

	function openMonitorExperience() {
		const now = performance.now()
		if (now - lastMonitorTapSoundAt > 120) {
			playMonitorTapSound()
			lastMonitorTapSoundAt = now
		}

		monitorOn = true
		hologramOpen = true
	}

	function closeMonitorExperience() {
		hologramOpen = false
		monitorOn = false
	}

	function playPhoneClickSound() {
		if (typeof Audio === 'undefined') return

		if (!phoneClickSound) {
			phoneClickSound = new Audio('/sound/bubble-pop.mp3')
			phoneClickSound.preload = 'auto'
			phoneClickSound.volume = 0.85
		}

		phoneClickSound.currentTime = 0
		void phoneClickSound.play().catch(() => {
			// Ignore blocked autoplay/playback rejections.
		})
	}

	function playMonitorTapSound() {
		if (typeof Audio === 'undefined') return

		if (!monitorTapSound) {
			monitorTapSound = new Audio('/sound/tap-light.mp3')
			monitorTapSound.preload = 'auto'
			monitorTapSound.volume = 0.85
		}

		monitorTapSound.currentTime = 0
		void monitorTapSound.play().catch(() => {
			// Ignore blocked autoplay/playback rejections.
		})
	}

	function toggleContactPopup() {
		playPhoneClickSound()

		const now = performance.now()
		if (now < suppressPhoneToggleUntil) return

		contactPopupOpen = !contactPopupOpen
		if (contactPopupOpen) {
			// Ignore the same click cycle that opened the popup.
			ignoreOutsideCloseUntil = now + 120
		}
	}

	function handlePhoneAnchorChange(anchor: { x: number; y: number }) {
		phoneAnchor = anchor
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
</script>

<div class="page">
	<Canvas shadows>
		<PortfolioScene
			onMonitorOpen={openMonitorExperience}
			isMonitorOn={monitorOn}
			onPhoneSelect={toggleContactPopup}
			onPhoneAnchorChange={handlePhoneAnchorChange}
			isPhonePopupOpen={contactPopupOpen}
		/>
	</Canvas>

	<HologramDesktop open={hologramOpen} onClose={closeMonitorExperience} />
	<PhoneContactPopup
		open={contactPopupOpen}
		anchor={phoneAnchor}
		onClose={() => (contactPopupOpen = false)}
	/>
</div>
