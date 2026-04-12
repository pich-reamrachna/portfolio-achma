<script lang="ts">
	import { T } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import Desk from './Desk.svelte';
	import Computer from './Computer.svelte';

	interactivity();

	function handleMonitorClick() {
		console.log('Monitor clicked');
	}
</script>

<T.PerspectiveCamera makeDefault position={[0, 1, 1.2]} fov={50} />

<T.AmbientLight intensity={1.2} />
<T.DirectionalLight position={[5, 10, 5]} intensity={1.5} />

<Desk />
<Computer onSelect={handleMonitorClick} />

<T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
	<T.PlaneGeometry args={[20, 20]} />
	<T.MeshStandardMaterial color="lightgray" />
</T.Mesh>
