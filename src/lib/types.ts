export interface VectorField {
	factor: number;
	x: string;
	y: string;
	compiled: {
		x?: (x: number, y: number) => number;
		y?: (x: number, y: number) => number;
	};
}

export interface BoidSimOptions {
	[option: string]: any;
	boidCount: number;
	numBoidColors: number;
	bounds: {
		width: number;
		height: number;
		margins: number;
		scale: number;
	};
	ranges: {
		separation: number;
		visible: number;
	};
	factors: {
		separation: number;
		alignment: number;
		cohesion: number;
		drag: number;
		mouse: number;
		turn: number;
	};
	caps: {
		maxSpeed: number;
		minSpeed: number;
		maxAcceleration: number;
		minAcceleration: number;
	};
	viewAngle: number;
	mouse: string;
	followColor: boolean;
	trailLength: number;
	vectorFieldGridWidth: number;
	show: {
		separationRange: boolean;
		visibleRange: boolean;
		vectorField: boolean;
	};
	colors: {
		background: string;
		boids: string[];
		separation: string;
		visible: string;
		vectorField: string;
	};
	vectorField: VectorField;
}
