<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core'
	import { interactivity } from '@threlte/extras'
	import { Vector3 } from 'three'
	import Desk from './Desk.svelte'
	import Computer from './Computer.svelte'
	import Keyboard from './Keyboard.svelte'
	import Mouse from './Mouse.svelte'
	import Mousepad from './Mousepad.svelte'
	import Lamp from './Lamp.svelte'
	import Phone from './Phone.svelte'
	import Headphone from './Headphone.svelte'
	import PinkWall from './PinkWall.svelte'
	import SceneOutline from './SceneOutline.svelte'

	let {
		highPerf = true,
		onMonitorOpen,
		isMonitorOn = false,
		onPhoneSelect,
		onPhoneAnchorChange,
		isPhonePopupOpen = false,
		onHeadphoneSelect,
		onHeadphoneAnchorChange
	}: {
		highPerf?: boolean
		onMonitorOpen?: () => void
		isMonitorOn?: boolean
		onPhoneSelect?: () => void
		onPhoneAnchorChange?: (anchor: { x: number; y: number }) => void
		isPhonePopupOpen?: boolean
		onHeadphoneSelect?: () => void
		onHeadphoneAnchorChange?: (anchor: { x: number; y: number }) => void
	} = $props()

	interactivity()
	const { camera, size } = useThrelte()
	// Tuned anchor so contact popup projects above the phone on the desk.
	const phoneWorldPosition = new Vector3(0.64, 0.24, -0.06)
	const headphoneWorldPosition = new Vector3(-0.6, 0.47, -0.05)
	const projected = new Vector3()
	const baseCameraPosition = new Vector3(0, 1, 2)
	let pointerX = $state(0)
	let pointerY = $state(0)
	let lockedCameraX = $state<number | null>(null)
	let lockedCameraY = $state<number | null>(null)

	// Defer decorative props so the browser prioritises primary models first.
	let showSecondary = $state(false)
	$effect(() => {
		const id = setTimeout(() => {
			showSecondary = true
		}, 150)
		return () => clearTimeout(id)
	})

	$effect(() => {
		if (typeof window === 'undefined') return

		const handlePointerMove = (event: PointerEvent) => {
			const width = Math.max(window.innerWidth, 1)
			const height = Math.max(window.innerHeight, 1)
			const normalizedX = event.clientX / width
			const normalizedY = event.clientY / height
			pointerX = normalizedX * 2 - 1
			pointerY = normalizedY * 2 - 1
		}

		window.addEventListener('pointermove', handlePointerMove)
		return () => {
			window.removeEventListener('pointermove', handlePointerMove)
		}
	})

	function handleMonitorClick() {
		onMonitorOpen?.()
	}

	useTask(() => {
		const activeCamera = camera.current
		const viewportSize = size.current
		if (!activeCamera || !viewportSize) return

		if (isMonitorOn && lockedCameraX === null) {
			lockedCameraX = activeCamera.position.x
		}
		if (isMonitorOn && lockedCameraY === null) {
			lockedCameraY = activeCamera.position.y
		}
		if (!isMonitorOn && lockedCameraX !== null) {
			lockedCameraX = null
		}
		if (!isMonitorOn && lockedCameraY !== null) {
			lockedCameraY = null
		}

		const xOffset = pointerX * 0.12
		const yOffset = pointerY * -0.05
		const targetX = isMonitorOn
			? (lockedCameraX ?? baseCameraPosition.x)
			: baseCameraPosition.x + xOffset
		const targetY = isMonitorOn
			? (lockedCameraY ?? baseCameraPosition.y)
			: baseCameraPosition.y + yOffset
		activeCamera.position.x += (targetX - activeCamera.position.x) * 0.065
		activeCamera.position.y += (targetY - activeCamera.position.y) * 0.05
		activeCamera.position.z += (baseCameraPosition.z - activeCamera.position.z) * 0.04

		projected.copy(phoneWorldPosition).project(activeCamera)
		const phoneX = (projected.x * 0.5 + 0.5) * viewportSize.width
		const phoneY = (-projected.y * 0.5 + 0.5) * viewportSize.height
		onPhoneAnchorChange?.({ x: phoneX, y: phoneY })

		projected.copy(headphoneWorldPosition).project(activeCamera)
		const headphoneX = (projected.x * 0.5 + 0.5) * viewportSize.width
		const headphoneY = (-projected.y * 0.5 + 0.5) * viewportSize.height
		onHeadphoneAnchorChange?.({ x: headphoneX, y: headphoneY })
	})
</script>

<T.PerspectiveCamera makeDefault position={[0, 1, 2]} rotation={[-0.1, 0, 0]} fov={50} />

<T.AmbientLight intensity={0.16} />

<T.DirectionalLight
	position={[3, 5, 3]}
	intensity={1.45}
	color="#cfe8ff"
	castShadow={highPerf}
	shadow-mapSize-width={highPerf ? 2048 : 512}
	shadow-mapSize-height={highPerf ? 2048 : 512}
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

{#if highPerf}<SceneOutline />{/if}
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
{#if showSecondary}
	<Mousepad />
	<Keyboard />
	<Mouse />
	<Lamp />
{/if}
<Phone onSelect={onPhoneSelect} isActive={isPhonePopupOpen} />
<Headphone onSelect={onHeadphoneSelect} />

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
