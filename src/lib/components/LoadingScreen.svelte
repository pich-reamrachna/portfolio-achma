<script lang="ts">
	import { browser } from '$app/environment'
	import { onDestroy, onMount } from 'svelte'

	type LoadingScreenProps = {
		onDone?: () => void
		progress?: number
		done?: boolean
		active?: boolean
	}

	let { onDone, progress = 0, done = false }: LoadingScreenProps = $props()

	let displayPct = $state(0)
	let phase = $state<'loading' | 'ready' | 'exiting' | 'done'>('loading')

	let exitTimer: ReturnType<typeof setTimeout> | null = null
	let doneTimer: ReturnType<typeof setTimeout> | null = null
	let minHoldTimer: ReturnType<typeof setTimeout> | null = null
	let minHoldMet = $state(false)
	let animFrame = 0

	onMount(() => {
		minHoldTimer = setTimeout(() => {
			minHoldMet = true
		}, 500)
	})

	function animateTowardTarget(target: number) {
		const clampedTarget = Math.max(0, Math.min(100, target))
		displayPct += (clampedTarget - displayPct) * 0.18
		if (Math.abs(clampedTarget - displayPct) <= 0.3) {
			displayPct = clampedTarget
			return
		}
		animFrame = requestAnimationFrame(() => animateTowardTarget(clampedTarget))
	}

	$effect(() => {
		if (!browser) return
		if (phase !== 'loading') return
		const target = done ? 100 : Math.min(99, Math.round((progress || 0) * 100))
		cancelAnimationFrame(animFrame)
		animFrame = requestAnimationFrame(() => animateTowardTarget(target))
	})

	$effect(() => {
		if (phase !== 'loading') return
		if (!done || !minHoldMet) return
		phase = 'ready'
		displayPct = 100
		exitTimer = setTimeout(() => {
			phase = 'exiting'
			doneTimer = setTimeout(() => {
				phase = 'done'
				onDone?.()
			}, 600)
		}, 320)
	})

	onDestroy(() => {
		if (minHoldTimer) clearTimeout(minHoldTimer)
		if (exitTimer) clearTimeout(exitTimer)
		if (doneTimer) clearTimeout(doneTimer)
		if (browser) cancelAnimationFrame(animFrame)
	})

	const HEX =
		'A4 3F B2 01 E8 C7 5D 9A 23 FF 11 66 D3 48 7C 02 BA 90 4E F1 28 55 CC 39 86 0D F7 A1 6B 3E C4 77 19 E2 58 8F 04 B3 71 CD 2A 96 43 1F E5 79 AD 32 60 0B F4 2D 88 15 7A C8 4C 91 35 EE 62 18 DB 57 A9 26 F0 4B 9D 73 C1 08 6E 33 BB 50 E7 1C 84 41 FC 29 97 54 0A D6 83 3B C6 74 20 EB 67 14 9F 4A 00 B7 5E A3 2F 80 DC 47 93 6A 11 F3 38 C5 7D 46 09 E0 55 B8 2C 8B 60 D1 3D F6 AA 17 7C 51 05 CE 82 40 FB 27 95 62 1E D9 4F 9C 30 B5 6C 78 E4 21 8A'
</script>

{#if phase !== 'done'}
	<div class="loader" class:exiting={phase === 'exiting'} aria-hidden="true">
		<div class="content">
			<img src="/cat-logo-removebg-preview.svg" alt="" class="logo" />

			<h1 class="heading" class:ready={phase === 'ready'}>LOADING</h1>

			<div class="bar-wrap">
				<div class="bar-track">
					<div class="bar-fill" style:width={`${displayPct}%`}></div>
					<div class="bar-cursor" style:left={`${displayPct}%`}></div>
				</div>

				<div class="hex-strip">
					<span class="hex-inner">{HEX}&nbsp;&nbsp;&nbsp;&nbsp;{HEX}</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.loader {
		position: fixed;
		inset: 0;
		z-index: 9999;
		pointer-events: none;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		transition:
			opacity 0.6s ease,
			transform 0.6s cubic-bezier(0.76, 0, 0.24, 1);
	}

	.loader.exiting {
		opacity: 0;
		transform: scale(1.015);
	}

	/* ── Layout ── */
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		width: min(560px, 88vw);
	}

	/* ── Logo ── */
	.logo {
		width: clamp(64px, 14vw, 100px);
		height: auto;
		filter: brightness(0) invert(1);
		animation:
			fade-in 0.5s ease both,
			pulse 2.4s ease-in-out 0.5s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.92;
		}
		50% {
			opacity: 0.2;
		}
	}

	/* ── Heading ── */
	.heading {
		margin: 0;
		font-family: 'Share Tech Mono', monospace;
		font-size: clamp(1.8rem, 6vw, 3rem);
		font-weight: 400;
		letter-spacing: 0.55em;
		color: #fff;
		text-shadow:
			0 0 6px #fff,
			0 0 14px #fff,
			0 0 32px rgba(255, 255, 255, 0.85),
			0 0 70px rgba(255, 255, 255, 0.45),
			0 0 140px rgba(255, 255, 255, 0.2);
		animation: fade-in 0.5s ease 0.1s both;
		transition: text-shadow 0.4s ease;
	}

	.heading.ready {
		text-shadow:
			0 0 8px #fff,
			0 0 20px #fff,
			0 0 50px rgba(255, 255, 255, 0.9),
			0 0 100px rgba(255, 255, 255, 0.55),
			0 0 200px rgba(255, 255, 255, 0.3);
	}

	/* ── Bar area ── */
	.bar-wrap {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		animation: fade-in 0.5s ease 0.2s both;
	}

	.bar-track {
		position: relative;
		height: 2px;
		background: rgba(255, 255, 255, 0.12);
	}

	.bar-fill {
		height: 100%;
		background: #fff;
		box-shadow:
			0 0 6px rgba(255, 255, 255, 0.9),
			0 0 14px rgba(255, 255, 255, 0.5);
	}

	.bar-cursor {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 3px;
		height: 10px;
		background: #fff;
		box-shadow: 0 0 8px #fff;
	}

	/* ── Hex strip ── */
	.hex-strip {
		overflow: hidden;
		width: 100%;
	}

	.hex-inner {
		display: inline-block;
		white-space: nowrap;
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.6rem;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.28);
		animation: hex-scroll 18s linear infinite;
		will-change: transform;
	}

	@keyframes hex-scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
