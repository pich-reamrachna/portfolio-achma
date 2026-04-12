<script lang="ts">
	import { GLTF } from '@threlte/extras'

	let { onSelect }: { onSelect?: () => void } = $props()
</script>

<GLTF
	url="/models/monitor.glb"
	scale={1}
	position={[0, 0.5, 0]}
	onclick={(e: PointerEvent) => {
		e.stopPropagation()
		onSelect?.()
	}}
	onpointerenter={() => {
		document.body.style.cursor = 'pointer'
	}}
	onpointerleave={() => {
		document.body.style.cursor = 'default'
	}}
/>
