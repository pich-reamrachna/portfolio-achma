<script lang="ts">
	let now = $state(new Date())

	const timeFormatter = new Intl.DateTimeFormat([], {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	})

	const dateFormatter = new Intl.DateTimeFormat([], {
		month: 'short',
		day: '2-digit'
	})

	$effect(() => {
		const timer = setInterval(() => {
			now = new Date()
		}, 1000)
		return () => clearInterval(timer)
	})
</script>

<footer class="desktop-taskbar">
	<div class="taskbar-spacer"></div>
	<div class="taskbar-time" aria-live="polite">
		<strong>{timeFormatter.format(now)}</strong>
		<small>{dateFormatter.format(now)}</small>
	</div>
</footer>
