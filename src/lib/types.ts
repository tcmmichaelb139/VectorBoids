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
		seperation: number;
		alignment: number;
		cohesion: number;
		regularization: number;
		mouse: number;
		turn: number;
	};
	maxSpeed: number;
	minSpeed: number;
	trailLength: number;
	mouse: string;
	show: {
		protectedRange: boolean;
		visibleRange: boolean;
	};
	colors: {
		boid: string;
		outline: string;
		trail: string;
		protected: string;
		visible: string;
	};
}
