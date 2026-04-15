import { writable } from 'svelte/store'
import type { Object3D } from 'three'

/** Object3Ds currently selected for outline rendering. */
export const outlinedObjects = writable<Object3D[]>([])
