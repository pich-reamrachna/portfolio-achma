<script lang="ts">
	import { useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'
	import { outlinedObjects } from '$lib/stores/outline'
	import type { Object3D } from 'three'

	type TraversedObject = { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean }
	type TraversableScene = { traverse: (visitor: (object: TraversedObject) => void) => void }

	let { onSelect }: { onSelect?: () => void } = $props()
	let scene = $state<TraversableScene | null>(null)
	let isHovered = $state(false)
	const { invalidate } = useThrelte()

	$effect(() => {
		const obj = scene as unknown as Object3D | null
		if (!obj || !isHovered) return
		outlinedObjects.update((list) => [...list, obj])
		return () => {
			outlinedObjects.update((list) => list.filter((o) => o !== obj))
		}
	})

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
		isHovered = true
		document.body.style.cursor = 'pointer'
	}}
	onpointerleave={() => {
		isHovered = false
		document.body.style.cursor = 'default'
	}}
/>
