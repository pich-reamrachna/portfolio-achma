/**
 * Creates a reusable sound effect with lazy Audio initialisation and optional debounce.
 * Call `destroy()` in a cleanup function (e.g. $effect return) to release the audio node.
 */
export function createSound(src: string, volume: number, debounceMs = 0) {
	if (typeof Audio === 'undefined') return { play: () => {}, destroy: () => {} }

	let audio: HTMLAudioElement | null = null
	let lastAt = 0

	return {
		play() {
			if (debounceMs > 0) {
				const now = performance.now()
				if (now - lastAt < debounceMs) return
				lastAt = now
			}

			if (!audio) {
				audio = new Audio(src)
				audio.preload = 'auto'
				audio.volume = volume
			}

			audio.currentTime = 0
			void audio.play().catch(() => {
				// Ignore blocked autoplay/playback rejections.
			})
		},
		destroy() {
			audio?.pause()
			audio = null
		}
	}
}
