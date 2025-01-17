export interface BoidSimOptions {
	boidCount: number;
	bounds: {
		width: number;
		height: number;
		margin: number;
		scale: number;
	};
	ranges: {
		protected: number;
		visible: number;
	};
	factors: {
		separation: number;
		alignment: number;
		cohesion: number;
		regularization: number;
		mouse: number;
		turn: number;
	};
	maxSpeed: number;
	minSpeed: number;
	viewAngle: number;
	trailLength: number;
	mouse: string;
	show: {
		protectedRange: boolean;
		visibleRange: boolean;
	};
	colors: {
		background: string;
		boid: string;
		outline: string;
		trail: string;
		protected: string;
		visible: string;
	};
}
