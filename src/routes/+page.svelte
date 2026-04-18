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

	// ── Performance detection ──────────────────────────────────────
	// Runs synchronously before Canvas mounts. We probe the actual GPU
	// renderer string (Intel/Mesa/SwiftShader = integrated = low-perf)
	// because CPU core/RAM counts miss integrated-GPU laptops entirely.
	function detectHighPerf(): boolean {
		if (typeof window === 'undefined') return true

		// Low RAM (<= 4 GB) almost always means integrated/shared GPU memory.
		const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory
		if (mem !== undefined && mem <= 4) return false

		// Few cores → likely a budget device.
		const cores = navigator.hardwareConcurrency
		if (cores !== undefined && cores <= 4) return false

		// Probe GPU renderer string — the most reliable signal.
		// We create a minimal 1×1 WebGL canvas, read the string, then
		// immediately destroy the context so we don't waste one of the
		// browser's ~16-context limit.
		try {
			const probe = document.createElement('canvas')
			probe.width = 1
			probe.height = 1
			const gl = probe.getContext('webgl') as WebGLRenderingContext | null
			if (gl) {
				const ext = gl.getExtension('WEBGL_debug_renderer_info')
				const renderer = ext
					? (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string).toLowerCase()
					: ''
				// Release the context immediately before Three.js needs its own.
				gl.getExtension('WEBGL_lose_context')?.loseContext()
				if (
					renderer.includes('intel') ||
					renderer.includes('mesa') ||
					renderer.includes('llvm') ||
					renderer.includes('swiftshader') ||
					renderer.includes('mali') ||
					renderer.includes('adreno')
				) {
					return false
				}
			}
		} catch {
			// If WebGL probe itself fails, the main context will too — go low-perf.
			return false
		}

		return true
	}
	const highPerf = detectHighPerf()

	let sceneVisible = $state(false)
	let assetProgress = $state(0)
	let assetsDone = $state(false)
	let assetsActive = $state(false)
	let webglFailed = $state(false)

	// Cap DPR: 2x = 4× pixels. 1.5x is visually indistinguishable and much cheaper.
	const dpr = highPerf ? Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5) : 1

	$effect(() => {
		const onReject = (e: PromiseRejectionEvent) => {
			if (String(e.reason).toLowerCase().includes('webgl')) webglFailed = true
		}
		window.addEventListener('unhandledrejection', onReject)
		return () => window.removeEventListener('unhandledrejection', onReject)
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
		{#if webglFailed}
			<div class="webgl-fallback">
				<p>// WebGL unavailable on this device</p>
				<p>Try updating your graphics drivers or opening in a different browser.</p>
			</div>
		{/if}
		<Canvas
			shadows={highPerf}
			{dpr}
			createRenderer={(canvas) =>
				new WebGLRenderer({
					canvas,
					antialias: highPerf,
					powerPreference: highPerf ? 'high-performance' : 'default'
				})}
		>
			<AssetProgressReporter onChange={handleAssetProgress} />
			<PortfolioScene
				{highPerf}
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
