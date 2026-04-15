import type { SvelteComponentTyped } from 'svelte'

export interface LoadingScreenProps {
	onDone?: () => void
	progress?: number
	done?: boolean
	active?: boolean
}

export default class LoadingScreen extends SvelteComponentTyped<LoadingScreenProps> {}
