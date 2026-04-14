<script lang="ts">
	import './phone-contact-popup.css'

	function openExternal(url: string) {
		window.open(url, '_blank', 'noopener,noreferrer')
	}

	function openEmail(address: string) {
		window.location.href = `mailto:${address}`
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
				onclick={() => openExternal('https://www.linkedin.com/in/ream-rachna-pich/')}
			>
				IN
			</button>
			<span class="comic-banner">linkedin.com/in/ream-rachna-pich</span>
		</div>
		<div class="dock-item">
			<button
				type="button"
				aria-label="GitHub"
				class="icon-btn"
				onclick={() => openExternal('https://github.com/pich-reamrachna')}
			>
				GH
			</button>
			<span class="comic-banner">github.com/pich-reamrachna</span>
		</div>
		<div class="dock-item">
			<button
				type="button"
				aria-label="Email"
				class="icon-btn"
				onclick={() => openEmail('pichreamr@gmail.com')}
			>
				@
			</button>
			<span class="comic-banner">pichreamr@gmail.com</span>
		</div>
	</nav>
</aside>
