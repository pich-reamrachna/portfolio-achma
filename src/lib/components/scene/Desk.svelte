<script lang="ts">
	import { useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'

	type TraversedObject = { isMesh?: boolean; receiveShadow?: boolean }
	type TraversableScene = { traverse: (visitor: (object: TraversedObject) => void) => void }

	let scene = $state<TraversableScene | null>(null)
	const { invalidate } = useThrelte()

	$effect(() => {
		if (!scene) return
		scene.traverse((object: TraversedObject) => {
			if (!object.isMesh) return
			object.receiveShadow = true
		})
		invalidate()
	})
</script>

<GLTF url="/models/desk.glb" bind:scene scale={1.5} position={[0, -0.8, 0]} />
