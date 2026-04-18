<script lang="ts">
	import { Canvas } from '@threlte/core'
	import { WebGLRenderer } from 'three'
	import PortfolioScene from '$lib/components/scene/PortfolioScene.svelte'
	import AssetProgressReporter from '$lib/components/scene/AssetProgressReporter.svelte'
	import MonitorOS from '$lib/components/monitor-os/MonitorOS.svelte'
	import PhoneContactPopup from '$lib/components/hologram/PhoneContactPopup.svelte'
	import HeadphoneMusicPopup from '$lib/components/hologram/HeadphoneMusicPopup.svelte'
	import HeadphoneMusicNotes from '$lib/components/hologram/HeadphoneMusicNotes.svelte'
	import LoadingScreen from '$lib/components/LoadingScreen.svelte'
	import WelcomeBubble from '$lib/components/WelcomeBubble.svelte'
	import { createSound } from '$lib/sound'
	import './page.css'

	// Heuristic-only performance detection.
	// Avoid creating a temporary probe WebGL context before the main renderer.
	function detectHighPerf(): boolean {
		if (typeof window === 'undefined') return true

		const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory
		if (mem !== undefined && mem <= 4) return false

		const cores = navigator.hardwareConcurrency
		if (cores !== undefined && cores <= 4) return false

		if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return false
		return true
	}

	const highPerf = detectHighPerf()

	let sceneVisible = $state(false)
	let assetProgress = $state(0)
	let assetsDone = $state(false)
	let assetsActive = $state(false)
	let webglFailed = $state(false)
	let safeMode = $state(false)

	const baseDpr = highPerf
		? Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.25)
		: 1
	const dpr = $derived(safeMode ? 1 : baseDpr)
	const useShadows = $derived(highPerf && !safeMode)

	function createSafeRenderer(canvas: HTMLCanvasElement): WebGLRenderer {
		try {
			safeMode = false
			return new WebGLRenderer({
				canvas,
				stencil: false,
				depth: true,
				antialias: highPerf,
				powerPreference: highPerf ? 'high-performance' : 'default',
				precision: 'highp'
			})
		} catch (primaryError) {
			try {
				safeMode = true
				return new WebGLRenderer({
					canvas,
					stencil: false,
					depth: true,
					antialias: false,
					powerPreference: 'low-power',
					precision: 'mediump'
				})
			} catch {
				webglFailed = true
				safeMode = true
				throw primaryError instanceof Error
					? primaryError
					: new Error('Error creating WebGL context.')
			}
		}
	}

	$effect(() => {
		let lostTimer = 0

		const onContextLost = (e: Event) => {
			if ((e.target as HTMLElement)?.tagName !== 'CANVAS') return
			if (e.cancelable) e.preventDefault()
			lostTimer = window.setTimeout(() => {
				webglFailed = true
				safeMode = true
			}, 5000)
		}

		const onContextRestored = (e: Event) => {
			if ((e.target as HTMLElement)?.tagName !== 'CANVAS') return
			clearTimeout(lostTimer)
			webglFailed = false
		}

		const onReject = (e: PromiseRejectionEvent) => {
			if (String(e.reason).toLowerCase().includes('webgl')) {
				webglFailed = true
				safeMode = true
			}
		}

		document.addEventListener('webglcontextlost', onContextLost, true)
		document.addEventListener('webglcontextrestored', onContextRestored, true)
		window.addEventListener('unhandledrejection', onReject)
		return () => {
			clearTimeout(lostTimer)
			document.removeEventListener('webglcontextlost', onContextLost, true)
			document.removeEventListener('webglcontextrestored', onContextRestored, true)
			window.removeEventListener('unhandledrejection', onReject)
		}
	})

	let isMonitorOn = $state(false)
	let monitorOSOpen = $state(false)
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

	function handleMonitorOpen() {
		playMonitorTap()
		isMonitorOn = true
	}

	function handleZoomComplete() {
		monitorOSOpen = true
	}

	function handleOSClose() {
		monitorOSOpen = false
		isMonitorOn = false
	}

	function toggleContactPopup() {
		playPhoneClick()

		const now = performance.now()
		if (now < suppressPhoneToggleUntil) return

		contactPopupOpen = !contactPopupOpen
		if (contactPopupOpen) {
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

	function handleAssetProgress(state: { progress: number; active: boolean; done: boolean }) {
		assetProgress = state.progress
		assetsActive = state.active
		if (state.done || state.progress >= 1) {
			assetsDone = true
		}
	}

	$effect(() => {
		if (!contactPopupOpen) return

		const handleWindowClick = (event: MouseEvent) => {
			const now = performance.now()
			if (now < ignoreOutsideCloseUntil) return

			const target = event.target
			if (target instanceof Element && target.closest('.phone-holo-card')) return
			contactPopupOpen = false
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
	<!-- Keep preloads focused on first-visible heavy models. -->
	<link rel="preload" href="/models/desk.glb" as="fetch" crossorigin="anonymous" />
	<link rel="preload" href="/models/monitor.glb" as="fetch" crossorigin="anonymous" />
	<link rel="preload" href="/models/iphone.glb" as="fetch" crossorigin="anonymous" />
	<link rel="preload" href="/models/headphone.glb" as="fetch" crossorigin="anonymous" />
</svelte:head>

<div class="page">
	<div class="scene-wrap" class:visible={sceneVisible}>
		{#if webglFailed}
			<div class="webgl-fallback">
				<p>// GPU context unavailable</p>
				<p>The browser blocked this page from creating another WebGL context.</p>
				<button onclick={() => window.location.reload()}>Reload</button>
			</div>
		{:else}
			<Canvas shadows={useShadows} {dpr} createRenderer={createSafeRenderer}>
				<AssetProgressReporter onChange={handleAssetProgress} />
				<PortfolioScene
					highPerf={highPerf && !safeMode}
					onMonitorOpen={handleMonitorOpen}
					{isMonitorOn}
					onZoomComplete={handleZoomComplete}
					onPhoneSelect={toggleContactPopup}
					onPhoneAnchorChange={handlePhoneAnchorChange}
					isPhonePopupOpen={contactPopupOpen}
					onHeadphoneSelect={toggleMusicPopup}
					onHeadphoneAnchorChange={handleHeadphoneAnchorChange}
				/>
			</Canvas>
		{/if}
	</div>

	<MonitorOS open={monitorOSOpen} onClose={handleOSClose} />
	<PhoneContactPopup open={contactPopupOpen} anchor={phoneAnchor} />
	<HeadphoneMusicNotes open={headphoneMusicPlaying} anchor={headphoneAnchor} />
	<HeadphoneMusicPopup
		open={musicPopupOpen}
		anchor={headphoneAnchor}
		onPlaybackChange={(playing) => (headphoneMusicPlaying = playing)}
	/>

	<LoadingScreen
		progress={assetProgress}
		done={assetsDone}
		active={assetsActive}
		onDone={() => (sceneVisible = true)}
	/>

	<WelcomeBubble show={sceneVisible} />
</div>
