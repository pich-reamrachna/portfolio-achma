<script lang="ts">
	import { useProgress } from '@threlte/extras'

	let {
		onChange
	}: {
		onChange?: (state: { progress: number; active: boolean; done: boolean }) => void
	} = $props()

	const { progress, active, finishedOnce } = useProgress()

	$effect(() => {
		onChange?.({
			progress: Math.max(0, Math.min(1, Number($progress) || 0)),
			active: Boolean($active),
			done: Boolean($finishedOnce)
		})
	})
</script>
