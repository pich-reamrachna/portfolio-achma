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

	let topbarClickSound: HTMLAudioElement | null = null

	function playTopbarClickSound() {
		if (typeof Audio === 'undefined') return

		if (!topbarClickSound) {
			topbarClickSound = new Audio('/sound/click.mp3')
			topbarClickSound.preload = 'auto'
			topbarClickSound.volume = 0.85
		}

		topbarClickSound.currentTime = 0
		void topbarClickSound.play().catch(() => {
			// Ignore blocked autoplay/playback rejections.
		})
	}

	function handleBackClick() {
		playTopbarClickSound()
		onBack()
	}

	function handleCloseClick() {
		playTopbarClickSound()
		onClose()
	}
</script>

<header class="desktop-topbar">
	<button class="nav-btn" onclick={handleBackClick} disabled={!canGoBack}>&lt;</button>
	<div class="title-wrap">
		<h2>{title}</h2>
		<p>{path}</p>
	</div>
	<button class="close-btn" onclick={handleCloseClick}>X</button>
</header>
