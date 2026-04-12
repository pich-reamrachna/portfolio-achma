<script lang="ts">
	import { useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'

	type MonitorMaterial = {
		name?: string
		color?: { set: (value: string) => void }
		emissive?: { set: (value: string) => void }
		emissiveIntensity?: number
		emissiveMap?: unknown
		map?: unknown
		needsUpdate?: boolean
	}

	let {
		onSelect,
		onPowerChange
	}: { onSelect?: () => void; onPowerChange?: (isOn: boolean) => void } = $props()
	let materials = $state<Record<string, MonitorMaterial> | null>(null)
	let isWhite = $state(false)
	const { invalidate } = useThrelte()

	const setMaterialColor = (
		material: MonitorMaterial,
		color: string,
		emissiveIntensity: number
	) => {
		if (!material) return
		if (material.color) material.color.set(color)
		if (material.emissive) material.emissive.set(color)
		if (typeof material.emissiveIntensity === 'number') {
			material.emissiveIntensity = emissiveIntensity
		}
		material.needsUpdate = true
	}

	const applyColor = () => {
		if (!materials) return
		const allMaterials = Object.values(materials)

		// Keep the monitor body dark.
		for (const material of allMaterials) {
			setMaterialColor(material, '#000000', 0)
		}

		const screenMaterials = allMaterials.filter((material: MonitorMaterial) =>
			(material?.name ?? '').toLowerCase().includes('screen')
		)
		const fallbackScreenMaterials =
			screenMaterials.length > 0
				? screenMaterials
				: allMaterials.filter((material: MonitorMaterial) => material?.emissiveMap || material?.map)

		for (const material of fallbackScreenMaterials) {
			setMaterialColor(material, isWhite ? '#ffffff' : '#000000', isWhite ? 1 : 0)
		}
	}

	$effect(() => {
		applyColor()
		invalidate()
	})
</script>

<GLTF
	url="/models/monitor.glb"
	bind:materials
	scale={1.3}
	position={[0, 0.4, 0]}
	onclick={(e: PointerEvent) => {
		e.stopPropagation()
		isWhite = !isWhite
		onPowerChange?.(isWhite)
		onSelect?.()
	}}
	onpointerenter={() => {
		document.body.style.cursor = 'pointer'
	}}
	onpointerleave={() => {
		document.body.style.cursor = 'default'
	}}
/>
