<script lang="ts">
	import { T } from '@threlte/core'
	import { GLTF } from '@threlte/extras'
</script>

<GLTF
	url="/models/lamp.glb"
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
/>
