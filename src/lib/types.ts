export interface BoidSimOptions {
	boidCount: number;
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
	trailLength: number;
	mouse: string;
	show: {
		separationRange: boolean;
		visibleRange: boolean;
	};
	colors: {
		background: string;
		boid: string;
		trail: string;
		separation: string;
		visible: string;
	};
}
