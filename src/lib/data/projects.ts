export type CreditAsset = {
	name: string
	creator: string
	license: string
	url?: string
	icon: string
	hp: number
	ability: string
}

export const creditAssets: CreditAsset[] = [
	{
		name: 'Monitor',
		creator: 'Hannnes92',
		license: 'Sketchfab',
		url: 'https://skfb.ly/pHXHN',
		icon: '⬜',
		hp: 180,
		ability: 'Display Pulse'
	},
	{
		name: 'Desk',
		creator: 'draakon_4d',
		license: 'Sketchfab',
		url: 'https://skfb.ly/oDQ7z',
		icon: '▬',
		hp: 220,
		ability: 'Surface Hold'
	},
	{
		name: 'Keyboard',
		creator: 'akiprensky',
		license: 'Sketchfab',
		url: 'https://skfb.ly/oDo7H',
		icon: '▤',
		hp: 95,
		ability: 'Key Strike'
	},
	{
		name: 'Lamp',
		creator: 'Mehdi Shahsavan',
		license: 'Sketchfab',
		url: 'https://skfb.ly/oPyrG',
		icon: '◉',
		hp: 75,
		ability: 'Ambient Glow'
	},
	{
		name: 'iPhone',
		creator: 'wes',
		license: 'Sketchfab',
		url: 'https://skfb.ly/oPyrG',
		icon: '▮',
		hp: 140,
		ability: 'Signal Ping'
	},
	{
		name: 'Headphone',
		creator: 'ChristyHsu',
		license: 'Sketchfab',
		url: 'https://skfb.ly/otWKy',
		icon: '◎',
		hp: 110,
		ability: 'Audio Surge'
	},
	{
		name: 'Wall Panel',
		creator: 'iidstudio',
		license: 'cgtrader',
		url: 'https://www.cgtrader.com/free-3d-models/interior/house-interior/wall-decorative-light-dynamic-model-pre-installed-lighting-27489852-31e9-4186-82f5-4b37105d4032',
		icon: '▧',
		hp: 300,
		ability: 'Scene Anchor'
	},
	{
		name: 'Mouse',
		creator: 'JorgeAlfredOwO',
		license: 'Sketchfab',
		url: 'https://skfb.ly/oRDS9',
		icon: '⌇',
		hp: 60,
		ability: 'Cursor Trace'
	},
	{
		name: 'Mouse Pad',
		creator: 'supahot',
		license: 'Sketchfab',
		url: 'https://skfb.ly/p9wnt',
		icon: '⌇',
		hp: 60,
		ability: 'Mouse Anchor'
	}
]

export type ProjectFile = {
	name: string
	description: string
	stack: string
	year: string
	highlights: string[]
	github?: string
	url?: string
}

export const aboutMeText = `
Hi, my name is Rachna, but I also go by Achma. I'm currently a third-year Cybersecurity student at the American University of Phnom Penh.

This 3D portfolio is where I combine my technical work with my creative interests. Growing up, I was always drawn to manga, animation, and games, which inspired me to express my artistic side through this project. You might notice that the design is inspired by the game "Welcome to the Game."

Yes, that is the name of the game.

My interest in cybersecurity wasn’t something I had from the start—it developed over time. I was inspired by one of my professors, whose passion and charisma made the field genuinely exciting to explore. Since then, I’ve been working toward becoming a Cybersecurity Analyst.

My projects range from web development to hands-on security work like honeypot testing. I also analyze major data breaches, such as the Marriott breach, conduct vulnerability assessments through penetration testing, and evaluate the cybersecurity posture of my own university. These works are documented in the Report section of this portfolio.

I always strive to give my best in everything I do, while continuously learning and improving every day. If you're interested in connecting, feel free to reach out!
`

export const projectFiles: ProjectFile[] = [
	{
		name: 'Portfolio 3D',
		description: `Interactive desk portfolio built with cinematic camera and scene composition.
		
		This project is written in TypeScript, using the SvelteKit framework. Three.js and Threlte are used in order to render and manipulate 3D assets.
		With no experience with 3D models, AI agents such as Codex and ClaudeCode has been of great help in making my vision comes to life.
		Since we're working with 3D assets, it is to be expected that rendering will be a pain so alot of effort was spent of performance optimization.`,
		stack: 'SvelteKit, TypeScript, Threlte, Three.js',
		year: '2026',
		github: 'https://github.com/pich-reamrachna/portfolio-achma',
		highlights: [
			'Interactive 3D scene',
			'Custom lighting and ambience',
			'Holographic project window'
		]
	},
	{
		name: 'Japanese Quiz Game',
		description: `A fun web-based game designed to test your Japanese skills.

		I was the team lead for this project, working on both the UI and mainly the backend, where I handled the server-side logic to keep the game fair and secure.
		I also set up the development environment, managed the CI workflow, and reviewed my teammates’ pull requests to keep everything running smoothly.`,
		stack: 'SvelteKit, TypeScript',
		year: '2026',
		github: 'https://github.com/pich-reamrachna/quiz-game',
		url: 'https://quiz-game-flame-alpha.vercel.app/',
		highlights: [
			'Randomized Questions',
			'Countdown Timer',
			'Global Scoreboard',
			'Cool UI and Music'
		]
	},
	{
		name: 'Human-Pose Follower Robot',
		description: `This project focuses on developing a robot that responds to human body poses in real time.

		I collected and prepared my own dataset to train a YOLOv8 pose classification model. The trained model is then integrated into the system to control the robot’s movements based on predefined human poses.
		`,
		stack: 'Python',
		year: '2025',
		github: 'https://github.com/pich-reamrachna/Human-Pose-Follower',
		highlights: [
			'Custom dataset collection',
			'YOLOv8 pose classification trained model',
			'Robot movement control'
		]
	},
	{
		name: 'Y-Social',
		description: `An alternate to the popular social media app "X". 
		
		As of right now, you are able to create a post and like posts, as well as view yours and others profiles.`,
		stack: 'SvelteKit, TypeScript',
		year: '2026',
		github: 'https://github.com/pich-reamrachna/social-media',
		url: 'https://social-media-one-virid.vercel.app/',
		highlights: ['Realtime presence', 'Conversation threading', 'Typing/read indicators']
	}
]
