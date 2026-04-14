<script lang="ts">
	import { useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'

	type ColorSetter = { set: (value: string) => void }
	type PhoneMaterial = {
		name?: string
		color?: ColorSetter
		emissive?: ColorSetter
		emissiveIntensity?: number
		roughness?: number
		metalness?: number
		needsUpdate?: boolean
	}
	type TraversedObject = { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean }
	type TraversableScene = { traverse: (visitor: (object: TraversedObject) => void) => void }

	let { onSelect, isActive = false }: { onSelect?: () => void; isActive?: boolean } = $props()
	let materials = $state<Record<string, PhoneMaterial> | null>(null)
	let scene = $state<TraversableScene | null>(null)
	const { invalidate } = useThrelte()

	// These two materials are the iPhone front display/glass in this model export.
	const screenMaterialNames = new Set(['4130c6244c49c5d5712e', 'a18b462c494e4fd29b4b'])

	$effect(() => {
		if (!materials) return

		for (const material of Object.values(materials)) {
			if (!material) continue

			const isScreen = screenMaterialNames.has(material.name ?? '')
			if (!isScreen) continue

			if (material.color) material.color.set(isActive ? '#f7f9ff' : '#0a0c12')
			if (material.emissive) material.emissive.set(isActive ? '#9dbbff' : '#000000')
			if (typeof material.emissiveIntensity === 'number')
				material.emissiveIntensity = isActive ? 0.35 : 0
			if (typeof material.roughness === 'number') material.roughness = isActive ? 0.18 : 0.28
			if (typeof material.metalness === 'number') material.metalness = isActive ? 0.02 : 0.04
			material.needsUpdate = true
		}

		invalidate()
	})

	$effect(() => {
		if (!scene) return
		scene.traverse((object: TraversedObject) => {
			if (!object.isMesh) return
			object.castShadow = true
			object.receiveShadow = false
		})
		invalidate()
	})
</script>

<GLTF
	url="/models/iphone.glb"
	bind:scene
	bind:materials
	scale={0.012}
	position={[0.72, 0.312, -0.06]}
	rotation={[-Math.PI / 2, 0, -0]}
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
