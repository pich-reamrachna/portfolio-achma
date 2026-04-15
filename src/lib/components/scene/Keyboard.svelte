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
	url="/models/keyboard.glb"
	bind:scene
	scale={1.2}
	position={[-22.269, -0.698, 4.096]}
	rotation={[0, 0, 0]}
/>
