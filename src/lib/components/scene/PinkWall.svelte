<script lang="ts">
	import { T, useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'

	type MeshMaterial = {
		name?: string
		color?: { set: (value: string) => void }
		emissive?: { set: (value: string) => void }
		emissiveIntensity?: number
		roughness?: number
		metalness?: number
		needsUpdate?: boolean
	}
	type TraversedObject = {
		name?: string
		isMesh?: boolean
		castShadow?: boolean
		receiveShadow?: boolean
		material?: MeshMaterial | MeshMaterial[]
	}
	type TraversableScene = { traverse: (visitor: (object: TraversedObject) => void) => void }

	let sceneLeft = $state<TraversableScene | null>(null)
	let sceneRight = $state<TraversableScene | null>(null)
	let sceneSide = $state<TraversableScene | null>(null)
	const { invalidate } = useThrelte()

	const styleWallScene = (scene: TraversableScene | null) => {
		if (!scene) return
		scene.traverse((object: TraversedObject) => {
			if (!object.isMesh) return
			object.castShadow = true
			object.receiveShadow = true

			// Converted OBJ->GLB didn't carry textures, so style materials in code.
			const materials = Array.isArray(object.material) ? object.material : [object.material]
			const objectName = (object.name ?? '').toLowerCase()
			for (const material of materials) {
				if (!material) continue
				const materialName = (material.name ?? '').toLowerCase()
				const isLightPanel =
					materialName.includes('emissive') ||
					materialName.includes('led') ||
					objectName.includes('linearlight') ||
					objectName.includes('led')

				if (isLightPanel) {
					material.color?.set('#fff6e8')
					material.emissive?.set('#ffe6c6')
					if (typeof material.emissiveIntensity === 'number') material.emissiveIntensity = 7
				} else {
					material.color?.set('#2a2a2a')
					material.emissive?.set('#111111')
					if (typeof material.emissiveIntensity === 'number') material.emissiveIntensity = 0.08
				}
				if (typeof material.roughness === 'number') material.roughness = 0.92
				if (typeof material.metalness === 'number') material.metalness = 0.02
				material.needsUpdate = true
			}
		})
	}

	$effect(() => {
		styleWallScene(sceneLeft)
		styleWallScene(sceneRight)
		styleWallScene(sceneSide)
		invalidate()
	})
</script>

<GLTF
	url="/models/pink_wall.glb"
	bind:scene={sceneLeft}
	scale={0.051}
	position={[-5, -1.7, -3.15]}
	rotation={[0, 0, 0]}
/>
<GLTF
	url="/models/pink_wall_b.glb"
	bind:scene={sceneRight}
	scale={0.051}
	position={[0.1, -1.7, -3.15]}
	rotation={[0, 0, 0]}
/>
<!-- <GLTF
	url="/models/pink_wall_c.glb"
	bind:scene={sceneSide}
	scale={0.04}
	position={[4.45, -0.7, -3.25]}
	rotation={[0, -Math.PI / 2, 0]}
/> -->

<!-- Local strip lights (more reliable than spot rotation for this model) -->
<T.PointLight
	position={[-2.78, 0.55, -2.99]}
	intensity={0.95}
	distance={1.55}
	decay={2}
	color="#ffe6c8"
/>
<T.PointLight
	position={[-0.88, 1.92, -2.99]}
	intensity={0.95}
	distance={1.55}
	decay={2}
	color="#ffe6c8"
/>
<T.PointLight
	position={[1.22, 0.55, -2.99]}
	intensity={0.95}
	distance={1.55}
	decay={2}
	color="#ffe6c8"
/>
<T.PointLight
	position={[3.12, 1.92, -2.99]}
	intensity={0.95}
	distance={1.55}
	decay={2}
	color="#ffe6c8"
/>
<T.PointLight
	position={[4.28, 0.55, -3.05]}
	intensity={0.8}
	distance={1.45}
	decay={2}
	color="#ffe6c8"
/>
<T.PointLight
	position={[4.28, 1.92, -1.15]}
	intensity={0.8}
	distance={1.45}
	decay={2}
	color="#ffe6c8"
/>
