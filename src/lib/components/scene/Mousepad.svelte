<script lang="ts">
	import { T } from '@threlte/core'
	import { DataTexture, RGBAFormat, RepeatWrapping, SRGBColorSpace, UnsignedByteType } from 'three'

	function createMousepadPattern() {
		const width = 256
		const height = 256
		const data = new Uint8Array(width * height * 4)

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = (y * width + x) * 4
				const nx = (x / width) * Math.PI * 2
				const ny = (y / height) * Math.PI * 2

				const base = Math.sin(nx * 4 + Math.cos(ny * 2.4) * 2.2) * 0.5 + 0.5
				const swirl = Math.sin((nx * 1.4 - ny * 1.1) * 7 + base * 5) * 0.5 + 0.5
				const p = Math.min(1, Math.max(0, base * 0.35 + swirl * 0.65))
				const contrast = Math.pow(p, 0.75)

				const c = 70 + Math.floor(contrast * 170)
				const stripeMask = Math.pow(contrast, 1.6)
				const whiteBand = stripeMask > 0.68 ? 1 : 0
				const stripeMix = whiteBand * 0.95 + (1 - whiteBand) * stripeMask * 0.12
				const r = c
				const g = c * 0.45
				const b = c * 0.72
				data[i] = Math.min(255, Math.floor(r + (255 - r) * stripeMix))
				data[i + 1] = Math.min(255, Math.floor(g + (255 - g) * stripeMix))
				data[i + 2] = Math.min(255, Math.floor(b + (255 - b) * stripeMix))
				data[i + 3] = 255
			}
		}

		const texture = new DataTexture(data, width, height, RGBAFormat, UnsignedByteType)
		texture.wrapS = RepeatWrapping
		texture.wrapT = RepeatWrapping
		texture.repeat.set(1.8, 1.2)
		texture.colorSpace = SRGBColorSpace
		texture.needsUpdate = true
		return texture
	}

	const patternMap = createMousepadPattern()
</script>

<T.Mesh position={[0.06, 0.329, 0.25]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
	<T.PlaneGeometry args={[0.72, 0.42]} />
	<T.MeshPhysicalMaterial
		color="#3a1026"
		roughness={0.78}
		metalness={0}
		clearcoat={0.08}
		clearcoatRoughness={0.85}
		emissive="#2a0b1d"
		emissiveIntensity={0.28}
		map={patternMap}
	/>
</T.Mesh>
