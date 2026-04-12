<script lang="ts">
	import { useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'

	type ColorSetter = { set: (value: string) => void }
	type KeyboardMaterial = {
		color?: ColorSetter
		emissive?: ColorSetter
		emissiveIntensity?: number
		roughness?: number
		metalness?: number
		envMapIntensity?: number
		needsUpdate?: boolean
	}
	type TraversedObject = { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean }
	type TraversableScene = { traverse: (visitor: (object: TraversedObject) => void) => void }

	let { isMonitorOn = false }: { isMonitorOn?: boolean } = $props()
	let materials = $state<Record<string, KeyboardMaterial> | null>(null)
	let scene = $state<TraversableScene | null>(null)
	const { invalidate } = useThrelte()

	$effect(() => {
		if (!materials) return

		const baseColor = isMonitorOn ? '#d6d8dc' : '#5a6068'
		const emissiveColor = isMonitorOn ? '#10161f' : '#000000'

		for (const material of Object.values(materials)) {
			if (!material) continue
			if (material.color) material.color.set(baseColor)
			if (material.emissive) material.emissive.set(emissiveColor)
			if (typeof material.emissiveIntensity === 'number')
				material.emissiveIntensity = isMonitorOn ? 0.05 : 0
			if (typeof material.roughness === 'number') material.roughness = isMonitorOn ? 0.72 : 0.8
			if (typeof material.metalness === 'number') material.metalness = 0.08
			if (typeof material.envMapIntensity === 'number')
				material.envMapIntensity = isMonitorOn ? 0.35 : 0.15
			material.needsUpdate = true
		}

		invalidate()
	})

	$effect(() => {
		if (!scene) return
		scene.traverse((object: TraversedObject) => {
			if (!object?.isMesh) return
			object.castShadow = true
			object.receiveShadow = true
		})
		invalidate()
	})
</script>

<GLTF
	url="/models/keyboard.glb"
	bind:scene
	bind:materials
	scale={1.2}
	position={[-22.269, -0.752, 4.096]}
	rotation={[0, 0, 0]}
/>
