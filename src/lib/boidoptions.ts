import type { BoidSimOptions } from './types';

export function getBoidSimOptions(num: number) {
	interestingBoidSimOptions[3].bounds.margins = Math.max(window.innerWidth, window.innerHeight) / 2;
	interestingBoidSimOptions[4].bounds.margins = Math.min(window.innerWidth, window.innerHeight) / 2;

	return updateBoidOptions(interestingBoidSimOptions[num]);
}

export function updateBoidOptions(options: BoidSimOptions) {
	options.bounds.margins = options.bounds.margins * 1;
	options.ranges.separation = options.ranges.separation * 1;
	options.ranges.visible = options.ranges.visible * 1;
	options.colors.boids = [
		'#bb9af7',
		'#ff9e64',
		'#e0af68',
		'#9ece6a',
		'#7dcfff',
		'#ff007c',
		'#f7768e',
		'#565f89',
		'#1abc9c',
		'#3d59a1'
	];

	return options;
}

export function numBoidSimOptions() {
	return interestingBoidSimOptions.length;
}

const interestingBoidSimOptions: BoidSimOptions[] = [
	{
		// seems like normal boid behavior
		boidCount: 500,
		numBoidColors: 1,
		bounds: {
			width: 0,
			height: 0,
			margins: 1,
			scale: 1
		},
		ranges: {
			separation: 10,
			visible: 50
		},
		factors: {
			separation: 0.5,
			alignment: 0.5,
			cohesion: 0.1,
			drag: 0.25,
			mouse: 0.5,
			turn: 5
		},
		caps: {
			maxSpeed: 2,
			minSpeed: 0.5,
			maxAcceleration: 0.1,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 25,
		show: {
			separationRange: false,
			visibleRange: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a'
		}
	},
	{
		// normal but faster
		boidCount: 500,
		numBoidColors: 1,
		bounds: {
			width: 0,
			height: 0,
			margins: 1,
			scale: 1
		},
		ranges: {
			separation: 10,
			visible: 50
		},
		factors: {
			separation: 1,
			alignment: 1,
			cohesion: 0.2,
			drag: 0.25,
			mouse: 0.5,
			turn: 5
		},
		caps: {
			maxSpeed: 5,
			minSpeed: 0.5,
			maxAcceleration: 0.2,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 25,
		show: {
			separationRange: false,
			visibleRange: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a'
		}
	},
	{
		// this is like a school of fish and has an interesting equalibrium where they all move in a circle
		boidCount: 1400,
		numBoidColors: 1,
		bounds: {
			width: 0,
			height: 0,
			margins: 1,
			scale: 1
		},
		ranges: {
			separation: 50,
			visible: 50
		},
		factors: {
			separation: 0.75,
			alignment: 0.5,
			cohesion: 0.1,
			drag: 0.25,
			mouse: 0.5,
			turn: 5
		},
		caps: {
			maxSpeed: 2,
			minSpeed: 0.5,
			maxAcceleration: 0.05,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 25,
		show: {
			separationRange: false,
			visibleRange: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a'
		}
	},
	{
		// bounds are increased to the max of width and height (see init function)
		boidCount: 500,
		numBoidColors: 1,
		bounds: {
			width: 0,
			height: 0,
			margins: 1,
			scale: 1
		},
		ranges: {
			separation: 10,
			visible: 50
		},
		factors: {
			separation: 0.5,
			alignment: 0.5,
			cohesion: 0.1,
			drag: 0.25,
			mouse: 0.5,
			turn: 5
		},
		caps: {
			maxSpeed: 2,
			minSpeed: 0.5,
			maxAcceleration: 0.1,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 25,
		show: {
			separationRange: false,
			visibleRange: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a'
		}
	},
	{
		// bounds are increased to the min of width and height (see init function)
		boidCount: 500,
		numBoidColors: 1,
		bounds: {
			width: 0,
			height: 0,
			margins: 1,
			scale: 1
		},
		ranges: {
			separation: 10,
			visible: 50
		},
		factors: {
			separation: 0.5,
			alignment: 0.5,
			cohesion: 0.1,
			drag: 0.25,
			mouse: 0.5,
			turn: 5
		},
		caps: {
			maxSpeed: 2,
			minSpeed: 0.5,
			maxAcceleration: 0.1,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 25,
		show: {
			separationRange: false,
			visibleRange: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a'
		}
	},
	{
		// 2 colored and they avoid each other
		boidCount: 1000,
		numBoidColors: 2,
		bounds: {
			width: 0,
			height: 0,
			margins: 50,
			scale: 1
		},
		ranges: {
			separation: 50,
			visible: 50
		},
		factors: {
			separation: 1.0,
			alignment: 0.75,
			cohesion: 0.75,
			drag: 0.25,
			mouse: 0.5,
			turn: 5
		},
		caps: {
			maxSpeed: 2.5,
			minSpeed: 0.5,
			maxAcceleration: 0.15,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 10,
		show: {
			separationRange: false,
			visibleRange: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a'
		}
	}
];
