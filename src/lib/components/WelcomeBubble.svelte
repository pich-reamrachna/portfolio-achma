<script lang="ts">
	let { show = false }: { show?: boolean } = $props()

	let visible = $state(false)
	let dismissed = $state(false)

	$effect(() => {
		if (!show || dismissed) return
		// Small delay so it doesn't compete with the loading screen exit
		const t = setTimeout(() => (visible = true), 600)
		return () => clearTimeout(t)
	})

	function dismiss() {
		visible = false
		setTimeout(() => (dismissed = true), 400)
	}
</script>

{#if !dismissed}
	<button class="bubble" class:visible onclick={dismiss} aria-label="Dismiss welcome message">
		<!-- Tail -->
		<span class="tail"></span>

		<span class="bubble-label">// SYSTEM MESSAGE</span>

		<p class="bubble-title">Welcome to <strong>Achma's Portfolio</strong></p>

		<span class="bubble-hint">Click to Interact</span>

		<span class="bubble-cursor">_</span>
	</button>
{/if}

<style>
	.bubble {
		position: fixed;
		top: 2rem;
		right: 2rem;
		z-index: 30;
		width: 300px;
		padding: 1rem 1.1rem 0.85rem;
		background: linear-gradient(135deg, rgba(7, 18, 34, 0.96), rgba(5, 13, 26, 0.98));
		border: 1px solid rgba(89, 186, 255, 0.55);
		border-radius: 10px;
		box-shadow:
			0 0 0 1px rgba(89, 186, 255, 0.12) inset,
			0 0 22px rgba(89, 186, 255, 0.18),
			0 8px 32px rgba(0, 0, 0, 0.5);
		color: #e6f5ff;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		opacity: 0;
		transform: translateY(-10px) scale(0.96);
		transition:
			opacity 0.4s ease,
			transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);

		/* CRT scanlines */
		overflow: hidden;
	}

	.bubble::before {
		content: '';
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 3px,
			rgba(89, 186, 255, 0.022) 3px,
			rgba(89, 186, 255, 0.022) 4px
		);
		pointer-events: none;
		border-radius: inherit;
	}

	.bubble:hover {
		border-color: rgba(89, 186, 255, 0.85);
		box-shadow:
			0 0 0 1px rgba(89, 186, 255, 0.2) inset,
			0 0 30px rgba(89, 186, 255, 0.28),
			0 8px 32px rgba(0, 0, 0, 0.5);
	}

	.bubble.visible {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	/* Arrow tail pointing up-right */
	.tail {
		position: absolute;
		top: -7px;
		right: 22px;
		width: 12px;
		height: 12px;
		background: rgba(7, 18, 34, 0.98);
		border-left: 1px solid rgba(89, 186, 255, 0.55);
		border-top: 1px solid rgba(89, 186, 255, 0.55);
		transform: rotate(45deg);
	}

	.bubble-label {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.58rem;
		letter-spacing: 0.14em;
		color: rgba(89, 186, 255, 0.5);
		display: block;
	}

	.bubble-title {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.82rem;
		line-height: 1.45;
		color: #c8e8ff;
		margin: 0.1rem 0 0;
	}

	.bubble-title strong {
		color: #e6f5ff;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.bubble-hint {
		display: block;
		margin-top: 0.45rem;
		padding-top: 0.45rem;
		border-top: 1px solid rgba(89, 186, 255, 0.2);
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.64rem;
		letter-spacing: 0.1em;
		color: rgba(89, 186, 255, 0.65);
	}

	.bubble-cursor {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.72rem;
		color: #59baff;
		animation: blink 1.1s step-end infinite;
		align-self: flex-end;
		line-height: 1;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
</style>
