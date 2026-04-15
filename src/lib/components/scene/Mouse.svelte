<script lang="ts">
	import { useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'

	type TraversedObject = { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean }
	type TraversableScene = { traverse: (visitor: (object: TraversedObject) => void) => void }

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
	url="/models/mouse.glb"
	bind:scene
	scale={0.018}
	position={[0.25, 0.332, 0.2]}
	rotation={[0, Math.PI / 30, 0]}
/>
