<script lang="ts">
	import { useThrelte, useTask } from '@threlte/core'
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
	import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
	import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
	import { Vector2 } from 'three'
	import { onDestroy } from 'svelte'
	import { outlinedObjects } from '$lib/stores/outline'

	const { autoRenderTask, renderer, scene, camera, size, renderStage } = useThrelte()

	// Hand rendering over to the composer.
	autoRenderTask.stop()

	const composer = new EffectComposer(renderer)

	const renderPass = new RenderPass(scene, camera.current)
	composer.addPass(renderPass)

	const outlinePass = new OutlinePass(
		new Vector2(size.current.width, size.current.height),
		scene,
		camera.current
	)
	outlinePass.edgeStrength = 2.0
	outlinePass.edgeGlow = 0.2
	outlinePass.edgeThickness = 1.0
	outlinePass.pulsePeriod = 1.8
	outlinePass.visibleEdgeColor.set('#91f4ff')
	outlinePass.hiddenEdgeColor.set('#3a8a9e')
	composer.addPass(outlinePass)

	// Handles sRGB output and tone mapping in the composer pipeline.
	composer.addPass(new OutputPass())

	// Sync hovered objects into the outline pass.
	$effect(() => {
		outlinePass.selectedObjects = $outlinedObjects
	})

	// Resize composer when canvas dimensions change.
	$effect(() => {
		const s = size.current
		composer.setSize(s.width, s.height)
	})

	useTask(
		() => {
			renderPass.camera = camera.current
			outlinePass.renderCamera = camera.current
			composer.render()
		},
		{ stage: renderStage }
	)

	onDestroy(() => {
		autoRenderTask.start()
		composer.dispose()
	})
</script>
