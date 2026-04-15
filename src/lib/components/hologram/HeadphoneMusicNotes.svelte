<script lang="ts">
	let {
		open = false,
		anchor = { x: 0, y: 0 }
	}: {
		open?: boolean
		anchor?: { x: number; y: number }
	} = $props()
</script>

<aside
	class:open
	class="headphone-notes"
	style={`left: ${anchor.x}px; top: ${anchor.y}px;`}
	aria-hidden="true"
>
	<span class="note n1">&#9834;</span>
	<span class="note n2">&#9835;</span>
	<span class="note n3">&#9836;</span>
	<span class="note n4">&#9834;</span>
</aside>

<style>
	.headphone-notes {
		position: absolute;
		left: 0;
		top: 0;
		pointer-events: none;
		opacity: 0;
		transform: translate(-18%, -36%);
		z-index: 8;
		transition: opacity 160ms ease;
	}

	.headphone-notes.open {
		opacity: 1;
	}

	.note {
		position: absolute;
		display: block;
		color: #9befff;
		text-shadow:
			0 0 8px rgba(108, 235, 255, 0.85),
			0 0 18px rgba(108, 235, 255, 0.45);
		font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
		font-weight: 700;
		opacity: 0;
		animation: note-float 3s ease-in-out infinite;
	}

	.n1 {
		font-size: 1rem;
		left: 2px;
		top: -4px;
		animation-delay: 0s;
	}

	.n2 {
		font-size: 1.2rem;
		left: 18px;
		top: -16px;
		animation-delay: 0.45s;
	}

	.n3 {
		font-size: 0.95rem;
		left: 34px;
		top: -6px;
		animation-delay: 0.9s;
	}

	.n4 {
		font-size: 1.1rem;
		left: 12px;
		top: -28px;
		animation-delay: 1.35s;
	}

	@keyframes note-float {
		0% {
			opacity: 0;
			transform: translateY(6px) scale(0.9);
		}
		20% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateY(-18px) translateX(6px) scale(1.08);
		}
	}
</style>
