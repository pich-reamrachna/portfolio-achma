<script lang="ts">
	import { browser } from '$app/environment'
	import { onDestroy, onMount } from 'svelte'

	type LoadingScreenProps = {
		onDone?: () => void
		progress?: number
		done?: boolean
		active?: boolean
	}

	let { onDone, progress = 0, done = false, active = false }: LoadingScreenProps = $props()

	// Displayed percentage animates toward actual progress.
	let displayPct = $state(0)
	let statusIdx = $state(0)
	let phase = $state<'loading' | 'ready' | 'exiting' | 'done'>('loading')

	const STATUSES = [
		'INITIALIZING RENDER CONTEXT',
		'LOADING SCENE GEOMETRY',
		'UPLOADING TO GPU',
		'BUILDING LIGHT PROBES',
		'CALIBRATING SHADERS',
		'COMPILING SCENE GRAPH'
	]

	let statusTimer: ReturnType<typeof setInterval> | null = null
	let exitTimer: ReturnType<typeof setTimeout> | null = null
	let doneTimer: ReturnType<typeof setTimeout> | null = null
	let minHoldTimer: ReturnType<typeof setTimeout> | null = null
	let minHoldMet = $state(false)
	let animFrame = 0

	onMount(() => {
		minHoldTimer = setTimeout(() => {
			minHoldMet = true
		}, 500)

		statusTimer = setInterval(() => {
			if (phase === 'loading') {
				statusIdx = (statusIdx + 1) % STATUSES.length
			}
		}, 700)
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
			}, 500)
		}, 280)
	})

	onDestroy(() => {
		if (statusTimer) clearInterval(statusTimer)
		if (minHoldTimer) clearTimeout(minHoldTimer)
		if (exitTimer) clearTimeout(exitTimer)
		if (doneTimer) clearTimeout(doneTimer)
		if (browser) cancelAnimationFrame(animFrame)
	})
</script>

{#if phase !== 'done'}
	<div class="loader" class:exiting={phase === 'exiting'} aria-hidden="true">
		<!-- Animated grid background -->
		<div class="grid-bg"></div>

		<!-- Moving scan line -->
		<div class="scanline"></div>

		<!-- Corner brackets -->
		<span class="corner tl"></span>
		<span class="corner tr"></span>
		<span class="corner bl"></span>
		<span class="corner br"></span>

		<!-- Content -->
		<div class="content">
			<p class="label">// PORTFOLIO &nbsp;·&nbsp; 2026</p>

			<div class="name-block">
				<h1 class="name">
					<span class="name-line">ACHMA</span>
				</h1>
			</div>

			<div class="divider"></div>

			<div class="status-block">
				<div class="status-row">
					<span class="status-text" class:ready={phase === 'ready'}>
						{phase === 'ready' ? 'READY' : active ? STATUSES[statusIdx] : 'PREPARING ASSETS'}
					</span>
					<span class="pct">{Math.floor(displayPct)}<span class="pct-symbol">%</span></span>
				</div>

				<div class="bar-track">
					<div class="bar-fill" style:width={`${displayPct}%`}></div>
					<div class="bar-glow" style:left={`${displayPct}%`}></div>
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
		background: #06080f;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: clamp(2rem, 8vw, 7rem);
		overflow: hidden;
		transition:
			opacity 0.7s ease,
			transform 0.7s cubic-bezier(0.76, 0, 0.24, 1);
	}

	.loader.exiting {
		opacity: 0;
		transform: translateY(-3%);
	}

	/* ── Grid background ── */
	.grid-bg {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(145, 244, 255, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(145, 244, 255, 0.03) 1px, transparent 1px);
		background-size: 48px 48px;
		animation: grid-drift 18s linear infinite;
	}

	@keyframes grid-drift {
		from {
			background-position:
				0 0,
				0 0;
		}
		to {
			background-position:
				0 48px,
				48px 0;
		}
	}

	/* ── Scan line ── */
	.scanline {
		position: absolute;
		left: 0;
		right: 0;
		height: 160px;
		background: linear-gradient(
			to bottom,
			transparent 0%,
			rgba(145, 244, 255, 0.025) 45%,
			rgba(145, 244, 255, 0.05) 50%,
			rgba(145, 244, 255, 0.025) 55%,
			transparent 100%
		);
		animation: scan 4s linear infinite;
		pointer-events: none;
	}

	@keyframes scan {
		0% {
			top: -160px;
		}
		100% {
			top: 100vh;
		}
	}

	/* ── Corner brackets ── */
	.corner {
		position: absolute;
		width: 28px;
		height: 28px;
		border-color: rgba(145, 244, 255, 0.4);
		border-style: solid;
	}

	.corner.tl {
		top: 20px;
		left: 20px;
		border-width: 1px 0 0 1px;
	}
	.corner.tr {
		top: 20px;
		right: 20px;
		border-width: 1px 1px 0 0;
	}
	.corner.bl {
		bottom: 20px;
		left: 20px;
		border-width: 0 0 1px 1px;
	}
	.corner.br {
		bottom: 20px;
		right: 20px;
		border-width: 0 1px 1px 0;
	}

	/* ── Content layout ── */
	.content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 0;
		max-width: 680px;
		width: 100%;
	}

	/* ── Label ── */
	.label {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		color: rgba(145, 244, 255, 0.45);
		margin: 0 0 2.5rem;
		animation: fade-in 0.6s ease both;
	}

	/* ── Name ── */
	.name-block {
		margin-bottom: 2.5rem;
		animation: slide-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
	}

	.name {
		font-family: 'Cinzel', serif;
		font-weight: 400;
		font-size: clamp(2.8rem, 8vw, 6rem);
		line-height: 1.08;
		letter-spacing: 0.04em;
		color: #e8f4ff;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	.name-line {
		display: block;
	}

	.name-line.accent {
		color: #91f4ff;
		text-shadow:
			0 0 40px rgba(145, 244, 255, 0.35),
			0 0 80px rgba(145, 244, 255, 0.15);
		animation: flicker 8s ease infinite 2s;
	}

	@keyframes flicker {
		0%,
		89%,
		91%,
		93%,
		100% {
			opacity: 1;
		}
		90% {
			opacity: 0.85;
		}
		92% {
			opacity: 0.92;
		}
	}

	/* ── Divider ── */
	.divider {
		width: 100%;
		height: 1px;
		background: linear-gradient(
			to right,
			rgba(145, 244, 255, 0.4),
			rgba(145, 244, 255, 0.1) 60%,
			transparent
		);
		margin-bottom: 1.75rem;
		animation: fade-in 0.6s ease 0.4s both;
	}

	/* ── Status block ── */
	.status-block {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		animation: fade-in 0.6s ease 0.5s both;
	}

	.status-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.status-text {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		color: rgba(145, 244, 255, 0.5);
		transition: color 0.3s ease;
	}

	.status-text.ready {
		color: #91f4ff;
	}

	.pct {
		font-family: 'Share Tech Mono', monospace;
		font-size: 1.05rem;
		color: #91f4ff;
		letter-spacing: 0.04em;
	}

	.pct-symbol {
		font-size: 0.65rem;
		opacity: 0.6;
		margin-left: 1px;
	}

	/* ── Progress bar ── */
	.bar-track {
		position: relative;
		height: 2px;
		background: rgba(145, 244, 255, 0.1);
		border-radius: 999px;
		overflow: visible;
	}

	.bar-fill {
		height: 100%;
		background: #91f4ff;
		border-radius: 999px;
		transition: width 0.15s linear;
		box-shadow: 0 0 8px rgba(145, 244, 255, 0.7);
	}

	.bar-glow {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 20px;
		height: 20px;
		background: radial-gradient(circle, rgba(145, 244, 255, 0.5) 0%, transparent 70%);
		transition: left 0.15s linear;
		pointer-events: none;
	}

	/* ── Shared animations ── */
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
