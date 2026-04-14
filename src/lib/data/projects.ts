export type ProjectFile = {
	name: string
	description: string
	stack: string
	year: string
	highlights: string[]
}

export const aboutMeText =
	'I build immersive portfolio experiences that blend interactive 3D scenes with practical frontend engineering. My focus is design clarity, smooth interactions, and memorable UX.'

export const projectFiles: ProjectFile[] = [
	{
		name: 'Portfolio 3D',
		description: 'Interactive desk portfolio built with cinematic camera and scene composition.',
		stack: 'SvelteKit, Threlte, Three.js',
		year: '2026',
		highlights: [
			'Interactive 3D scene',
			'Custom lighting and ambience',
			'Holographic project window'
		]
	},
	{
		name: 'Commerce UI',
		description: 'Modern shopping experience with cart, product states, and quick checkout.',
		stack: 'SvelteKit, TypeScript',
		year: '2025',
		highlights: ['Reusable product cards', 'Checkout state machine', 'Mobile-first layout']
	},
	{
		name: 'Analytics Board',
		description: 'KPI-focused dashboard with chart panels and filter workflows.',
		stack: 'Svelte, REST APIs',
		year: '2025',
		highlights: ['Filterable dashboards', 'Custom chart widgets', 'Role-based views']
	},
	{
		name: 'Realtime Chat',
		description: 'Rooms, presence, and live messaging interactions.',
		stack: 'WebSocket, Svelte',
		year: '2024',
		highlights: ['Realtime presence', 'Conversation threading', 'Typing/read indicators']
	}
]
