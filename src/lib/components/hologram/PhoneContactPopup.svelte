<script lang="ts">
	import './phone-contact-popup.css'

	let {
		open = false,
		anchor = { x: 0, y: 0 },
		onClose = () => {}
	} = $props<{
		open?: boolean
		anchor?: { x: number; y: number }
		onClose?: () => void
	}>()
</script>

<aside class:open class="phone-holo-card" style={`left: ${anchor.x}px; top: ${anchor.y}px;`}>
	<nav aria-label="Contact links" class="phone-icon-row">
		<a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">IG</a>
		<a href="https://linkedin.com/in/" target="_blank" rel="noreferrer" aria-label="LinkedIn">IN</a>
		<a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub">GH</a>
		<a href="mailto:you@example.com" aria-label="Email">@</a>
		<button aria-label="Close contact popup" onclick={onClose}>X</button>
	</nav>
</aside>
