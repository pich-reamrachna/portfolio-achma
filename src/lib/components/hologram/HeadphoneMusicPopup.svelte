<script lang="ts">
	import './headphone-music-popup.css'

	let {
		open = false,
		anchor = { x: 0, y: 0 },
		onPlaybackChange
	} = $props<{
		open?: boolean
		anchor?: { x: number; y: number }
		onClose?: () => void
		onPlaybackChange?: (isPlaying: boolean) => void
	}>()

	let isPlaying = $state(false)
	let currentSeconds = $state(0)
	let durationSeconds = $state(0)
	let audio: HTMLAudioElement | null = null
	let trackIndex = $state(0)
	let timelineEl: HTMLDivElement | null = null
	let isScrubbing = $state(false)
	const tracks = [
		{
			title: 'Chroma Drift',
			artist: 'Night Drive Mix',
			src: '/sound/chroma-drift.mp3',
			artwork: '/chromadrift.gif'
		},
		{
			title: 'Lunar Hearts',
			artist: 'PLAVE',
			src: "/sound/PLAVE 'Lunar Hearts' Official Audio.mp3",
			artwork: '/lunarhearts.gif'
		}
	]
	const currentTrack = $derived(tracks[trackIndex])
	const progress = $derived(durationSeconds > 0 ? (currentSeconds / durationSeconds) * 100 : 0)
	const remainingSeconds = $derived(Math.max(0, durationSeconds - currentSeconds))

	function togglePlayback() {
		if (!audio) return
		if (audio.paused) {
			void audio.play().catch(() => {
				// Ignore blocked autoplay/playback rejections.
			})
			return
		}
		audio.pause()
	}

	function setTrack(index: number, shouldResume = isPlaying) {
		const total = tracks.length
		const nextIndex = ((index % total) + total) % total
		trackIndex = nextIndex
		if (!audio) return

		audio.src = encodeURI(tracks[nextIndex].src)
		audio.load()
		currentSeconds = 0
		durationSeconds = 0

		if (!shouldResume) return
		const tryPlay = () => {
			void audio?.play().catch(() => {
				// Ignore blocked autoplay/playback rejections.
			})
		}

		if (audio.readyState >= 2) {
			tryPlay()
			return
		}

		audio.addEventListener('canplay', tryPlay, { once: true })
	}

	function nextTrack() {
		setTrack(trackIndex + 1, true)
	}

	function previousTrack() {
		setTrack(trackIndex - 1, true)
	}

	function formatTime(seconds: number) {
		const safeSeconds = Math.max(0, Math.floor(seconds))
		const minutes = Math.floor(safeSeconds / 60)
		const secs = safeSeconds % 60
		return `${minutes}:${secs.toString().padStart(2, '0')}`
	}

	function seekFromClientX(clientX: number) {
		if (!audio || !timelineEl || durationSeconds <= 0) return
		const rect = timelineEl.getBoundingClientRect()
		if (rect.width <= 0) return

		const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
		const seekTime = ratio * durationSeconds
		audio.currentTime = seekTime
		currentSeconds = seekTime
	}

	function handleScrubMove(event: PointerEvent) {
		if (!isScrubbing) return
		seekFromClientX(event.clientX)
	}

	function stopScrub(event?: PointerEvent) {
		if (!isScrubbing) return
		if (event) seekFromClientX(event.clientX)
		isScrubbing = false
		window.removeEventListener('pointermove', handleScrubMove)
		window.removeEventListener('pointerup', stopScrub)
	}

	function startScrub(event: PointerEvent) {
		if (durationSeconds <= 0) return
		event.preventDefault()
		isScrubbing = true
		seekFromClientX(event.clientX)
		window.addEventListener('pointermove', handleScrubMove)
		window.addEventListener('pointerup', stopScrub)
	}

	function handleTimelineKeydown(event: KeyboardEvent) {
		if (!audio || durationSeconds <= 0) return
		const step = Math.max(1, durationSeconds * 0.02)

		if (event.key === 'ArrowLeft') {
			event.preventDefault()
			audio.currentTime = Math.max(0, audio.currentTime - step)
			currentSeconds = audio.currentTime
			return
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault()
			audio.currentTime = Math.min(durationSeconds, audio.currentTime + step)
			currentSeconds = audio.currentTime
			return
		}

		if (event.key === 'Home') {
			event.preventDefault()
			audio.currentTime = 0
			currentSeconds = 0
			return
		}

		if (event.key === 'End') {
			event.preventDefault()
			audio.currentTime = durationSeconds
			currentSeconds = durationSeconds
		}
	}

	$effect(() => {
		onPlaybackChange?.(isPlaying)
	})

	$effect(() => {
		if (typeof Audio === 'undefined') return

		const player = new Audio(encodeURI(tracks[0].src))
		player.preload = 'auto'
		player.volume = 0.5
		audio = player

		const syncDuration = () => {
			durationSeconds = Number.isFinite(player.duration) ? player.duration : 0
		}

		const syncCurrentTime = () => {
			currentSeconds = player.currentTime || 0
		}

		const handlePlay = () => {
			isPlaying = true
		}

		const handlePause = () => {
			isPlaying = false
		}

		const handleEnded = () => {
			setTrack(trackIndex + 1, true)
		}

		player.addEventListener('loadedmetadata', syncDuration)
		player.addEventListener('durationchange', syncDuration)
		player.addEventListener('timeupdate', syncCurrentTime)
		player.addEventListener('play', handlePlay)
		player.addEventListener('pause', handlePause)
		player.addEventListener('ended', handleEnded)

		try {
			player.load()
		} catch {
			// No-op: browsers may restrict manual load calls.
		}

		return () => {
			stopScrub()
			player.pause()
			player.removeEventListener('loadedmetadata', syncDuration)
			player.removeEventListener('durationchange', syncDuration)
			player.removeEventListener('timeupdate', syncCurrentTime)
			player.removeEventListener('play', handlePlay)
			player.removeEventListener('pause', handlePause)
			player.removeEventListener('ended', handleEnded)
			audio = null
			onPlaybackChange?.(false)
		}
	})
</script>

<aside class:open class="headphone-player-card" style={`left: ${anchor.x}px; top: ${anchor.y}px;`}>
	<section class="player-shell" aria-label="Music player popup">
		<div class="cover-art">
			<img
				class="cover-gif"
				src={currentTrack.artwork}
				alt={`${currentTrack.title} artwork`}
				loading="lazy"
			/>
		</div>

		<div class="player-main">
			<div class="player-head">
				<div class="track-meta">
					<h3>{currentTrack.title}</h3>
					<p>{currentTrack.artist}</p>
				</div>
			</div>

			<div class="timeline-wrap">
				<div
					class="timeline"
					class:scrubbing={isScrubbing}
					bind:this={timelineEl}
					role="slider"
					tabindex="0"
					aria-label="Playback position"
					aria-valuemin={0}
					aria-valuemax={Math.max(0, Math.floor(durationSeconds))}
					aria-valuenow={Math.max(0, Math.floor(currentSeconds))}
					onpointerdown={startScrub}
					onkeydown={handleTimelineKeydown}
				>
					<span class="timeline-progress" style={`width: ${progress}%`}></span>
					<span class="timeline-knob" style={`left: ${progress}%`}></span>
				</div>
				<div class="timeline-labels">
					<span>{formatTime(currentSeconds)}</span>
					<span>-{formatTime(remainingSeconds)}</span>
				</div>
			</div>

			<div class="player-controls">
				<button
					type="button"
					class="ctrl-btn icon"
					onclick={previousTrack}
					aria-label="Previous track"
				>
					<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
						<rect x="4" y="5" width="2.3" height="14" rx="0.5" />
						<polygon points="18,5 8,12 18,19" />
					</svg>
				</button>
				<button
					type="button"
					class="ctrl-btn play-btn"
					onclick={togglePlayback}
					aria-label={isPlaying ? 'Pause' : 'Play'}
				>
					{#if isPlaying}
						<svg class="play-icon" viewBox="0 0 24 24" aria-hidden="true">
							<rect x="7" y="5.5" width="3.2" height="13" rx="0.8" />
							<rect x="13.8" y="5.5" width="3.2" height="13" rx="0.8" />
						</svg>
					{:else}
						<svg class="play-icon" viewBox="0 0 24 24" aria-hidden="true">
							<polygon points="8,5 19,12 8,19" />
						</svg>
					{/if}
				</button>
				<button type="button" class="ctrl-btn icon" onclick={nextTrack} aria-label="Next track">
					<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
						<rect x="17.7" y="5" width="2.3" height="14" rx="0.5" />
						<polygon points="6,5 16,12 6,19" />
					</svg>
				</button>
			</div>
		</div>
	</section>

	<div
		class="sr-only"
		role="progressbar"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={progress}
	>
		{progress}
	</div>
</aside>
