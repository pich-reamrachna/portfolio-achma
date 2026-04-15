<script lang="ts">
	import './phone-contact-popup.css'

	function openExternal(url: string) {
		window.open(url, '_blank', 'noopener,noreferrer')
	}

	function openEmail(address: string) {
		window.location.href = `mailto:${address}`
	}

	let hoverSound: HTMLAudioElement | null = null
	let lastHoverSoundAt = 0

	function playHoverSound() {
		if (typeof Audio === 'undefined') return
		const now = performance.now()
		if (now - lastHoverSoundAt < 80) return
		lastHoverSoundAt = now

		if (!hoverSound) {
			hoverSound = new Audio('/sound/spacebar.mp3')
			hoverSound.preload = 'auto'
			hoverSound.volume = 0.55
		}

		hoverSound.currentTime = 0
		void hoverSound.play().catch(() => {
			// Ignore blocked autoplay/playback rejections.
		})
	}

	let { open = false, anchor = { x: 0, y: 0 } } = $props<{
		open?: boolean
		anchor?: { x: number; y: number }
		onClose?: () => void
	}>()
</script>

<aside class:open class="phone-holo-card" style={`left: ${anchor.x}px; top: ${anchor.y}px;`}>
	<nav aria-label="Contact links" class="phone-icon-row">
		<div class="dock-item">
			<button
				type="button"
				aria-label="LinkedIn"
				class="icon-btn"
				onpointerenter={playHoverSound}
				onfocus={playHoverSound}
				onclick={() => openExternal('https://www.linkedin.com/in/ream-rachna-pich/')}
			>
				<svg class="icon-glyph" viewBox="0 0 16 16" aria-hidden="true">
					<path
						d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175
						1.146H1.175C.526 16 0 15.487 0 14.854zM4.943 13.394V6.169H2.542v7.225zM3.743 5.18c.837 0 1.358-.554
						1.358-1.248-.015-.71-.52-1.248-1.342-1.248S2.4 3.222 2.4 3.932c0 .694.506 1.248 1.327 1.248zM13.458
						13.394v-3.93c0-2.105-1.122-3.085-2.62-3.085-1.206 0-1.745.663-2.048 1.129v.024h-.016a5.7 5.7 0 0 1 .016-.024V6.169h-2.4c.03.887
						0 7.225 0 7.225h2.4v-4.035c0-.216.016-.431.08-.586.173-.431.568-.878 1.23-.878.867 0 1.214.662 1.214
						1.634v3.865z"
					/>
				</svg>
			</button>
			<span class="comic-banner">linkedin.com/in/ream-rachna-pich</span>
		</div>
		<div class="dock-item">
			<button
				type="button"
				aria-label="GitHub"
				class="icon-btn"
				onpointerenter={playHoverSound}
				onfocus={playHoverSound}
				onclick={() => openExternal('https://github.com/pich-reamrachna')}
			>
				<svg class="icon-glyph" viewBox="0 0 16 16" aria-hidden="true">
					<path
						d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38
						0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
						-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89
						-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27
						c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82
						2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01
						8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
					/>
				</svg>
			</button>
			<span class="comic-banner">github.com/pich-reamrachna</span>
		</div>
		<div class="dock-item">
			<button
				type="button"
				aria-label="Email"
				class="icon-btn"
				onpointerenter={playHoverSound}
				onfocus={playHoverSound}
				onclick={() => openEmail('pichreamr@gmail.com')}
			>
				<svg class="icon-glyph" viewBox="0 0 16 16" aria-hidden="true">
					<path
						d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v.217L8 8.917.001 4.217V4zm0
						1.383 5.803 3.408L0 12.617V5.383zm6.761 3.223L0 13.617V14a2 2 0 0 0 2 2h12a2 2
						0 0 0 2-2v-.383l-6.761-4.011L8 9.917l-1.239-.311zM16 12.617l-5.803-3.826L16 5.383v7.234z"
					/>
				</svg>
			</button>
			<span class="comic-banner">pichreamr@gmail.com</span>
		</div>
	</nav>
</aside>
