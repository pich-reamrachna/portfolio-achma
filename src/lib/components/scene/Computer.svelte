<script lang="ts">
	import { useThrelte } from '@threlte/core'
	import { GLTF } from '@threlte/extras'
	import { outlinedObjects } from '$lib/stores/outline'
	import type { Object3D } from 'three'

	type MonitorMaterial = {
		name?: string
		color?: { set: (value: string) => void }
		emissive?: { set: (value: string) => void }
		emissiveIntensity?: number
		emissiveMap?: unknown
		map?: unknown
		metalness?: number
		roughness?: number
		envMapIntensity?: number
		needsUpdate?: boolean
	}

	let {
		onSelect,
		onPowerChange,
		isPowered = false
	}: {
		onSelect?: () => void
		onPowerChange?: (isOn: boolean) => void
		isPowered?: boolean
	} = $props()
	let materials = $state<Record<string, MonitorMaterial> | null>(null)
	let scene = $state<{ traverse: (cb: (o: unknown) => void) => void } | null>(null)
	let isWhite = $state(isPowered)
	let isHovered = $state(false)
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

	const tuneMaterial = (material: MonitorMaterial, isScreen: boolean) => {
		if (!material) return
		if (typeof material.metalness === 'number') {
			material.metalness = isScreen
				? Math.max(material.metalness, 0.1)
				: Math.max(material.metalness, 0.5)
		}
		if (typeof material.roughness === 'number') {
			material.roughness = isScreen
				? Math.min(material.roughness, 0.35)
				: Math.min(material.roughness, 0.28)
		}
		if (typeof material.envMapIntensity === 'number') {
			material.envMapIntensity = isScreen
				? Math.max(material.envMapIntensity, 0.9)
				: Math.max(material.envMapIntensity, 1.25)
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
			setMaterialColor(material, '#111111', 0)
			tuneMaterial(material, false)
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
			tuneMaterial(material, true)
		}
	}

	$effect(() => {
		isWhite = isPowered
	})

	$effect(() => {
		applyColor()
		invalidate()
	})

	$effect(() => {
		const obj = scene as unknown as Object3D | null
		if (!obj || !isHovered) return
		outlinedObjects.update((list) => [...list, obj])
		return () => {
			outlinedObjects.update((list) => list.filter((o) => o !== obj))
		}
	})
</script>

<GLTF
	url="/models/monitor.glb"
	bind:materials
	bind:scene
	scale={1.3}
	position={[0, 0.4, 0]}
	onclick={(e: PointerEvent) => {
		e.stopPropagation()
		onPowerChange?.(true)
		onSelect?.()
	}}
	onpointerenter={() => {
		isHovered = true
		document.body.style.cursor = 'pointer'
	}}
	onpointerleave={() => {
		isHovered = false
		document.body.style.cursor = 'default'
	}}
/>
