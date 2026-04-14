<script lang="ts">
	import { T, useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'

	type LampMaterial = {
		metalness?: number
		roughness?: number
		envMapIntensity?: number
		needsUpdate?: boolean
	}
	type TraversedObject = { isMesh?: boolean; material?: LampMaterial | LampMaterial[] }
	type TraversableScene = { traverse: (visitor: (object: TraversedObject) => void) => void }

	let scene = $state<TraversableScene | null>(null)
	const { invalidate } = useThrelte()

	$effect(() => {
		if (!scene) return
		scene.traverse((object: TraversedObject) => {
			if (!object.isMesh) return
			const materials = Array.isArray(object.material) ? object.material : [object.material]
			for (const material of materials) {
				if (!material) continue
				// Slightly shinier lamp surfaces so wall-light tint is visible.
				if (typeof material.metalness === 'number')
					material.metalness = Math.max(material.metalness, 0.55)
				if (typeof material.roughness === 'number')
					material.roughness = Math.min(material.roughness, 0.35)
				if (typeof material.envMapIntensity === 'number') {
					material.envMapIntensity = Math.max(material.envMapIntensity, 1.1)
				}
				material.needsUpdate = true
			}
		})
		invalidate()
	})
</script>

<GLTF
	url="/models/lamp.glb"
	bind:scene
	scale={0.0027}
	position={[1, 0.3, -0.1]}
	rotation={[0, -Math.PI / 1.2, 0]}
/>

<T.SpotLight
	position={[1.35, 0.62, -0.12]}
	rotation={[-1.75, -2.7, 0]}
	intensity={5.4}
	angle={0.34}
	penumbra={0.65}
	distance={1.35}
	decay={2}
	color="#ffd8a8"
	castShadow
	shadow-mapSize-width={2048}
	shadow-mapSize-height={2048}
	shadow-bias={0.00015}
	shadow-normalBias={0.03}
	shadow-radius={5}
/>

<!-- Tight pink accent aimed at lamp body to avoid desk hotspots -->
<T.SpotLight
	position={[1.28, 0.74, -0.62]}
	rotation={[-0.12, -2.3, 0]}
	intensity={0.45}
	angle={0.16}
	penumbra={0.9}
	distance={0.8}
	decay={2}
	color="#cf6d9b"
/>
<T.PointLight
	position={[1.02, 0.56, -0.42]}
	intensity={0.1}
	distance={0.5}
	decay={2}
	color="#cf6d9b"
/>
