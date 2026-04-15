<script lang="ts">
	import { useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'

	type TraversedObject = { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean }
	type TraversableScene = { traverse: (visitor: (object: TraversedObject) => void) => void }

	let { onSelect }: { onSelect?: () => void } = $props()
	let scene = $state<TraversableScene | null>(null)
	const { invalidate } = useThrelte()

	$effect(() => {
		if (!scene) return
		scene.traverse((object: TraversedObject) => {
			if (!object?.isMesh) return
			object.castShadow = true
			object.receiveShadow = false
		})
		invalidate()
	})
</script>

<GLTF
	url="/models/headphone.glb"
	bind:scene
	scale={1.65}
	position={[-0.6, 0.4, -0.05]}
	rotation={[Math.PI / 2, -Math.PI / 11, -Math.PI / 3]}
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
