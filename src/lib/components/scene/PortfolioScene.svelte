<script lang="ts">
	import { T } from '@threlte/core'
	import { interactivity } from '@threlte/extras'
	import Desk from './Desk.svelte'
	import Computer from './Computer.svelte'
	import Keyboard from './Keyboard.svelte'
	import Lamp from './Lamp.svelte'
	import Phone from './Phone.svelte'
	import Headphone from './Headphone.svelte'
	import PinkWall from './PinkWall.svelte'

	let {
		onMonitorOpen,
		isMonitorOn = false
	}: { onMonitorOpen?: () => void; isMonitorOn?: boolean } = $props()

	interactivity()

	function handleMonitorClick() {
		onMonitorOpen?.()
	}
</script>

<T.PerspectiveCamera makeDefault position={[0, 1, 2]} rotation={[-0.1, 0, 0]} fov={50} />

<T.AmbientLight intensity={0.16} />

<T.DirectionalLight
	position={[3, 5, 3]}
	intensity={1.45}
	color="#cfe8ff"
	castShadow
	shadow-mapSize-width={2048}
	shadow-mapSize-height={2048}
	shadow-bias={-0.00004}
	shadow-normalBias={0.016}
	shadow-camera-left={-2.6}
	shadow-camera-right={2.6}
	shadow-camera-top={2.1}
	shadow-camera-bottom={-1.9}
	shadow-camera-near={0.5}
	shadow-camera-far={10}
/>
{#if isMonitorOn}
	<!-- Localized monitor spill light instead of a far directional beam. -->
	<T.PointLight
		position={[0, 0.5, 0.08]}
		intensity={1.05}
		distance={1.45}
		decay={2}
		color="#d9e8ff"
	/>
	<T.PointLight
		position={[0, 0.18, 0.42]}
		intensity={0.45}
		distance={1.1}
		decay={2}
		color="#c6dcff"
	/>
{/if}

<Desk />
<PinkWall />
<!-- Pink rim lights behind monitor edges (left/right) -->
<T.PointLight
	position={[-0.66, 0.72, -0.16]}
	intensity={0.32}
	distance={0.45}
	decay={2}
	color="#d879a8"
/>
<T.PointLight
	position={[0.66, 0.72, -0.16]}
	intensity={0.32}
	distance={0.45}
	decay={2}
	color="#d879a8"
/>
<Computer
	onSelect={handleMonitorClick}
	onPowerChange={() => onMonitorOpen?.()}
	isPowered={isMonitorOn}
/>
<Keyboard />
<Lamp />
<Phone />
<Headphone />

<T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.02, 0]} receiveShadow>
	<T.PlaneGeometry args={[24, 24]} />
	<T.MeshPhysicalMaterial
		color="#2f2f2f"
		roughness={0.08}
		metalness={0.2}
		clearcoat={1}
		clearcoatRoughness={0.1}
	/>
</T.Mesh>
