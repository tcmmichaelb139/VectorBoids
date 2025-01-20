import type { BoidSimOptions, VectorField } from '$lib/types';
import { compileEquation } from '$lib/utils';

export function getBoidSimOptions(num: number) {
	if (num === 4)
		interestingBoidSimOptions[4].bounds.margins =
			Math.min(window.innerWidth, window.innerHeight) / 2;

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
	options.vectorField.compiled = {
		x: compileEquation(options.vectorField.x, options),
		y: compileEquation(options.vectorField.y, options)
	};

	return options;
}

export function numBoidSimOptions() {
	return interestingBoidSimOptions.length;
}

export function getVectorFieldOptions(num: number) {
	return interestingVectorFields[num];
}

export function numVectorFieldOptions() {
	return interestingVectorFields.length;
}

const interestingBoidSimOptions: BoidSimOptions[] = [
	{
		boidCount: 500,
		numBoidColors: 1,
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
			minSpeed: 2.5,
			maxAcceleration: 0.15,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 10,
		vectorFieldGridWidth: 50,
		show: {
			separationRange: false,
			visibleRange: false,
			vectorField: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a',
			vectorField: '#7dcfff'
		},
		vectorField: {
			factor: 0.0025,
			x: '1 / (1 + e^(-5.0 * (sqrt(x*x+y*y) - 300.0))) * 0.2 * -y + (1.0 - 1 / (1 + e^(-5.0 * (sqrt(x*x+y*y) - 300.0)))) * (0.0 * x + y)',
			y: '1 / (1 + e^(-5.0 * (sqrt(x*x+y*y) - 300.0))) * 0.2 * x + (1.0 - 1 / (1 + e^(-5.0 * (sqrt(x*x+y*y) - 300.0)))) * (0.0 * y - x)',
			valid: true,
			compiled: {}
		}
	},
	{
		// normal behavior and faster
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
		vectorFieldGridWidth: 50,
		show: {
			separationRange: false,
			visibleRange: false,
			vectorField: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a',
			vectorField: '#7dcfff'
		},
		vectorField: {
			factor: 0.1,
			x: '',
			y: '',
			valid: true,
			compiled: {}
		}
	},
	{
		// this is like a school of fish and has an interesting equilibrium where they all move in a circle
		boidCount: 1000,
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
		vectorFieldGridWidth: 50,
		show: {
			separationRange: false,
			visibleRange: false,
			vectorField: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a',
			vectorField: '#7dcfff'
		},
		vectorField: {
			factor: 0.1,
			x: '',
			y: '',
			valid: true,
			compiled: {}
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
			maxSpeed: 5,
			minSpeed: 0.5,
			maxAcceleration: 0.2,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 25,
		vectorFieldGridWidth: 50,
		show: {
			separationRange: false,
			visibleRange: false,
			vectorField: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a',
			vectorField: '#7dcfff'
		},
		vectorField: {
			factor: 0.1,
			x: '',
			y: '',
			valid: true,
			compiled: {}
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
		vectorFieldGridWidth: 50,
		show: {
			separationRange: false,
			visibleRange: false,
			vectorField: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a',
			vectorField: '#7dcfff'
		},
		vectorField: {
			factor: 0.1,
			x: '',
			y: '',
			valid: true,
			compiled: {}
		}
	},
	{
		// 10 colored and they avoid each other
		boidCount: 1000,
		numBoidColors: 10,
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
		vectorFieldGridWidth: 50,
		show: {
			separationRange: false,
			visibleRange: false,
			vectorField: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a',
			vectorField: '#7dcfff'
		},
		vectorField: {
			factor: 0.1,
			x: '',
			y: '',
			valid: true,
			compiled: {}
		}
	}
];

// checkout https://anvaka.github.io/fieldplay for cool vector fields
const interestingVectorFields: VectorField[] = [
	{
		// circle field
		factor: 0.1,
		x: 'y / sqrt(x * x + y * y)',
		y: '-x / sqrt(x * x + y * y)',
		valid: true,
		compiled: {}
	},
	{
		// dipole
		factor: 0.000001,
		x: '2.0 * x * y',
		y: 'y * y - x * x',
		valid: true,
		compiled: {}
	},
	{
		// blackhole esque
		factor: 0.1,
		x: '(y / (x * x + y * y) - 0.0001 * x)*100',
		y: '(-x / (x * x + y * y) - 0.0001 * y)*100',
		valid: true,
		compiled: {}
	},
	{
		// double spiral
		factor: 0.0025,
		x: '1 / (1 + e^(-5.0 * (sqrt(x*x+y*y) - 300.0))) * -y + (1.0 - 1 / (1 + e^(-5.0 * (sqrt(x*x+y*y) - 300.0)))) * (0.2 * x + y)',
		y: '1 / (1 + e^(-5.0 * (sqrt(x*x+y*y) - 300.0))) * x + (1.0 - 1 / (1 + e^(-5.0 * (sqrt(x*x+y*y) - 300.0)))) * (0.2 * y - x)',
		valid: true,
		compiled: {}
	},
	{
		// interesting spiral and bidirectional flow
		factor: 0.0025,
		x: 'y',
		y: 'cos(sqrt(x^2 + y^2))',
		valid: true,
		compiled: {}
	},
	{
		// converging circle field
		factor: 0.00125,
		x: '-x * log((x^2 + y^2) * 0.000025)',
		y: '-y * log((x^2 + y^2) * 0.000025)',
		valid: true,
		compiled: {}
	}
];
