<script lang="ts">
	import { useThrelte, useTask } from '@threlte/core'
	import { GLTF } from '@threlte/extras'
	import { outlinedObjects } from '$lib/stores/outline'
	import { CanvasTexture, type Texture } from 'three'
	import type { Object3D } from 'three'

	type MonitorMaterial = {
		name?: string
		color?: { set: (value: string) => void }
		emissive?: { set: (value: string) => void }
		emissiveIntensity?: number
		emissiveMap?: Texture | null
		map?: Texture | null
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

	// ── Spinning idle screen ──
	let catTexture: CanvasTexture | null = null
	let catCtx: CanvasRenderingContext2D | null = null
	let catImg: HTMLImageElement | null = null
	let angle = 0

	$effect(() => {
		if (typeof window === 'undefined') return
		const canvas = document.createElement('canvas')
		canvas.width = 256
		canvas.height = 256
		catCtx = canvas.getContext('2d')
		catTexture = new CanvasTexture(canvas)

		const img = new Image()
		img.onload = () => {
			catImg = img
		}
		img.src = '/cat-logo-removebg-preview.svg'

		return () => {
			catTexture?.dispose()
			catTexture = null
			catCtx = null
			catImg = null
		}
	})

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

	const getScreenMaterials = (): MonitorMaterial[] => {
		if (!materials) return []
		const all = Object.values(materials)
		const screenKw = ['screen', 'display', 'lcd', 'panel', 'glass', 'monitor']
		const bodyKw = ['stand', 'base', 'bezel', 'frame', 'body', 'case', 'cable', 'port']
		const isScreen = (name?: string) => {
			const l = (name ?? '').toLowerCase()
			return l ? screenKw.some((k) => l.includes(k)) && !bodyKw.some((k) => l.includes(k)) : false
		}
		const byName = all.filter((m) => isScreen(m?.name))
		if (byName.length > 0) return byName
		const byEmissive = all.filter(
			(m) =>
				m?.emissiveMap != null && !bodyKw.some((k) => (m?.name ?? '').toLowerCase().includes(k))
		)
		if (byEmissive.length > 0) return byEmissive
		return all.filter((m) => !bodyKw.some((k) => (m?.name ?? '').toLowerCase().includes(k)))
	}

	const applyColor = () => {
		if (!materials) return
		const all = Object.values(materials)
		for (const m of all) {
			setMaterialColor(m, '#111111', 0)
			tuneMaterial(m, false)
		}
		for (const m of getScreenMaterials()) {
			if (isWhite) {
				// Powered on: plain white screen
				m.emissiveMap = null
				setMaterialColor(m, '#eaf2ff', 1.35)
			} else {
				// Idle: black screen, spinning cat via emissiveMap
				m.emissiveMap = catTexture
				if (m.emissive) m.emissive.set('#ffffff')
				if (typeof m.emissiveIntensity === 'number') m.emissiveIntensity = 1.6
				if (m.color) m.color.set('#000000')
			}
			tuneMaterial(m, true)
			m.needsUpdate = true
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

	// Spin the cat logo on the canvas each frame when idle
	useTask((delta) => {
		if (isPowered || !catCtx || !catTexture || !catImg) return

		angle += delta * 0.75

		const size = 256
		const logoSize = 130
		catCtx.clearRect(0, 0, size, size)
		catCtx.fillStyle = '#000000'
		catCtx.fillRect(0, 0, size, size)
		catCtx.save()
		catCtx.translate(size / 3.3, size / 2)
		catCtx.rotate(angle)
		catCtx.drawImage(catImg, -logoSize / 2, -logoSize / 2, logoSize, logoSize)
		catCtx.restore()

		catTexture.needsUpdate = true
		invalidate()
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
