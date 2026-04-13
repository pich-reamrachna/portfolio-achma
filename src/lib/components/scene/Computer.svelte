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
		const screenKeywords = ['screen', 'display', 'lcd', 'panel']
		const bodyKeywords = ['stand', 'base', 'bezel', 'frame', 'body', 'case']
		const isScreenMaterialName = (name?: string) => {
			const lowered = (name ?? '').toLowerCase()
			if (!lowered) return false
			const hasScreenKeyword = screenKeywords.some((keyword) => lowered.includes(keyword))
			const hasBodyKeyword = bodyKeywords.some((keyword) => lowered.includes(keyword))
			return hasScreenKeyword && !hasBodyKeyword
		}

		// Keep the monitor body dark.
		for (const material of allMaterials) {
			setMaterialColor(material, '#000000', 0)
		}

		const screenMaterials = allMaterials.filter((material: MonitorMaterial) =>
			isScreenMaterialName(material?.name)
		)
		const fallbackScreenMaterials =
			screenMaterials.length > 0
				? screenMaterials
				: allMaterials.filter(
						(material: MonitorMaterial) =>
							Boolean(material?.emissiveMap) &&
							!bodyKeywords.some((k) => (material?.name ?? '').toLowerCase().includes(k))
					)

		for (const material of fallbackScreenMaterials) {
			setMaterialColor(material, isWhite ? '#eaf2ff' : '#000000', isWhite ? 1.35 : 0)
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
