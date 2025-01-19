import type { BoidSimOptions } from '$lib/types';

export const options: BoidSimOptions = {
	boidCount: 1400,
	bounds: {
		width: 0,
		height: 0,
		margins: 0,
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
	trailLength: 25,
	mouse: 'none',
	show: {
		separationRange: false,
		visibleRange: false
	},
	colors: {
		background: '#1a1b26',
		boid: '#bb9af7',
		trail: '#bb9af7',
		separation: '#f7768e',
		visible: '#9ece6a'
	}
};

export const mouse = {
	x: 0,
	y: 0
};
