<script lang="ts">
	import { T } from '@threlte/core'
	import { interactivity } from '@threlte/extras'
	import Desk from './Desk.svelte'
	import Computer from './Computer.svelte'
	import Keyboard from './Keyboard.svelte'
	import Lamp from './Lamp.svelte'
	import Phone from './Phone.svelte'

	interactivity()
	let isMonitorOn = $state(false)

	function handleMonitorClick() {
		console.log('Monitor clicked')
	}

	function handleMonitorPowerChange(isOn: boolean) {
		isMonitorOn = isOn
	}
</script>

<T.PerspectiveCamera makeDefault position={[0, 1, 2]} rotation={[-0.1, 0, 0]} fov={50} />

<T.AmbientLight intensity={0.2} />

<T.DirectionalLight position={[3, 5, 3]} intensity={2} color="#cfe8ff" />
{#if isMonitorOn}
	<T.DirectionalLight position={[-0.5, 0.5, -13]} intensity={0.5} castShadow />
{/if}

<Desk />
<Computer onSelect={handleMonitorClick} onPowerChange={handleMonitorPowerChange} />
<Keyboard {isMonitorOn} />
<Lamp />
<Phone />

<!-- <T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
	<T.PlaneGeometry args={[20, 20]} />
	<T.MeshStandardMaterial color="lightgray" />
</T.Mesh> -->

<T.Color attach="background" args={['#1a1a1a']} />
