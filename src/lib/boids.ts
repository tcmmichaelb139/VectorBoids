// import kdTree from 'kd-tree-javascript';

import type { BoidSimOptions } from './types';
import { mouse } from '$lib/globals';

class Boid {
	x: number;
	y: number;
	vx: number;
	vy: number;
	new: {
		x: number;
		y: number;
		vx: number;
		vy: number;
	};
	history: [number, number][] = [];

	constructor(x: number, y: number, vx: number, vy: number) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.new = { x: 0, y: 0, vx: 0, vy: 0 };
	}

	public update(boids: Boid[], canvas: HTMLCanvasElement, options: BoidSimOptions) {
		const seperationDxDy: [number, number] = [0, 0];
		const alignmentVel: [number, number] = [0, 0];
		const cohesionDxDy: [number, number] = [0, 0];
		let numBoidsVisible = 0;

		for (const boid of boids) {
			if (boid === this) continue;

			const dx = boid.x - this.x;
			const dy = boid.y - this.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			if (options.ranges.protected <= distance && distance <= options.ranges.visible) {
				alignmentVel[0] += boid.vx;
				alignmentVel[1] += boid.vy;

				cohesionDxDy[0] += boid.x;
				cohesionDxDy[1] += boid.y;

				numBoidsVisible++;
			} else if (distance < options.ranges.protected) {
				seperationDxDy[0] -= dx / distance;
				seperationDxDy[1] -= dy / distance;
			}
		}

		if (numBoidsVisible > 0) {
			alignmentVel[0] /= numBoidsVisible;
			alignmentVel[1] /= numBoidsVisible;

			cohesionDxDy[0] /= numBoidsVisible;
			cohesionDxDy[1] /= numBoidsVisible;
		} else {
			cohesionDxDy[0] = this.x;
			cohesionDxDy[1] = this.y;
		}

		// update based on new boid
		this.new = {
			x: this.x,
			y: this.y,
			vx: this.vx,
			vy: this.vy
		};

		// update based on mouse
		const dx = mouse.x - this.x;
		const dy = mouse.y - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < options.ranges.visible) {
			if (options.mouse === 'avoid') {
				this.new.vx -= (dx / distance) * options.factors.mouse;
				this.new.vy -= (dy / distance) * options.factors.mouse;
			} else if (options.mouse === 'attract') {
				this.new.vx += (dx / distance) * options.factors.mouse;
				this.new.vy += (dy / distance) * options.factors.mouse;
			}
		}

		// update velocity based on seperation
		this.new.vx += seperationDxDy[0] * options.factors.seperation;
		this.new.vy += seperationDxDy[1] * options.factors.seperation;

		// update velocity based on alignment
		this.new.vx += alignmentVel[0] * options.factors.alignment;
		this.new.vy += alignmentVel[1] * options.factors.alignment;

		// update velocity based on cohesion
		this.new.vx += (cohesionDxDy[0] - this.x) * options.factors.cohesion;
		this.new.vy += (cohesionDxDy[1] - this.y) * options.factors.cohesion;

		// update based on bounds
		if (this.x < options.bounds.margin) this.new.vx += options.factors.turn;
		if (this.x > canvas.width - options.bounds.margin) this.new.vx -= options.factors.turn;
		if (this.y < options.bounds.margin) this.new.vy += options.factors.turn;
		if (this.y > canvas.height - options.bounds.margin) this.new.vy -= options.factors.turn;

		// min speed and max speed
		const speed = Math.sqrt(this.new.vx * this.new.vx + this.new.vy * this.new.vy);

		this.new.vx = (this.new.vx / speed) * Math.max(options.minSpeed, speed);
		this.new.vy = (this.new.vy / speed) * Math.max(options.minSpeed, speed);

		this.new.vx = (this.new.vx / speed) * Math.min(speed, options.maxSpeed);
		this.new.vy = (this.new.vy / speed) * Math.min(speed, options.maxSpeed);

		if (speed === 0) this.new.vx = this.new.vy = 0;
	}

	public pushUpdate(options: BoidSimOptions) {
		this.x =
			this.new.x * options.factors.regularization + this.x * (1 - options.factors.regularization);
		this.y =
			this.new.y * options.factors.regularization + this.y * (1 - options.factors.regularization);
		this.vx =
			this.new.vx * options.factors.regularization + this.vx * (1 - options.factors.regularization);
		this.vy =
			this.new.vy * options.factors.regularization + this.vy * (1 - options.factors.regularization);

		// update position
		this.x += this.vx;
		this.y += this.vy;

		// update history
		this.history.push([this.x, this.y]);
		while (this.history.length > options.trailLength) this.history.shift();
	}

	public draw(ctx: CanvasRenderingContext2D, options: BoidSimOptions) {
		if (!ctx) {
			throw new Error('Could not get 2d context from canvas');
		}

		// draw visual range
		if (options.show.visibleRange) {
			ctx.beginPath();
			ctx.strokeStyle = options.colors.visible;
			ctx.arc(this.x, this.y, options.ranges.visible, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.closePath();
		}

		// draw protected range
		if (options.show.protectedRange) {
			ctx.beginPath();
			ctx.strokeStyle = options.colors.protected;
			ctx.arc(this.x, this.y, options.ranges.protected, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.closePath();
		}

		if (options.trailLength > 0) {
			ctx.beginPath();
			ctx.strokeStyle = options.colors.trail;
			ctx.lineWidth = 3;
			ctx.moveTo(this.history[0][0], this.history[0][1]);
			for (let i = 0; i < this.history.length - 1; i++) {
				const xc = (this.history[i][0] + this.history[i + 1][0]) / 2;
				const yc = (this.history[i][1] + this.history[i + 1][1]) / 2;
				ctx.quadraticCurveTo(this.history[i][0], this.history[i][1], xc, yc);
			}
			ctx.stroke();
			ctx.closePath();
		}

		ctx.beginPath();
		const angle = Math.atan2(this.vy, this.vx);
		const p = new Path2D(
			'M20.2315 12.3684L1.86287 20.6155C1.22314 20.9028 0.499999 20.4347 0.499999 19.7335C0.499999 19.4264 0.642123 19.1491 0.878881 18.9845C1.2196 18.7476 1.60369 18.4911 2.01301 18.2179C3.14616 17.4614 4.47275 16.5758 5.60821 15.6165C6.38648 14.959 7.10176 14.2461 7.62524 13.4864C8.1489 12.7265 8.5 11.8913 8.5 11C8.5 10.1088 8.1489 9.27358 7.62524 8.51365C7.10176 7.75398 6.38648 7.04106 5.60821 6.38354C4.47273 5.42423 3.14612 4.53859 2.01296 3.78209C1.60365 3.50884 1.21958 3.25243 0.878878 3.01549C0.64212 2.85084 0.499998 2.5736 0.499998 2.2665C0.499998 1.56525 1.22313 1.09725 1.86286 1.38447L20.2315 9.63162C21.4123 10.1618 21.4123 11.8383 20.2315 12.3684Z'
		);
		const p2 = new Path2D();
		p2.addPath(p, new DOMMatrix().translate(-7, -11));

		ctx.translate(this.x, this.y);
		ctx.rotate(angle);
		ctx.fillStyle = options.colors.boid;
		ctx.fill(p2);
		ctx.strokeStyle = options.colors.outline;
		ctx.lineWidth = 2;
		ctx.stroke(p2);
		ctx.rotate(-angle);
		ctx.translate(-this.x, -this.y);
		ctx.closePath();
	}
}

export default class Boids {
	private canvas: HTMLCanvasElement;
	private options: BoidSimOptions;
	private boids: Boid[] = [];
	// private kdTree: kdTree.kdTree<{ x: number; y: number }>;

	constructor(canvas: HTMLCanvasElement, options: BoidSimOptions) {
		this.canvas = canvas;
		this.options = options;

		// this.kdTree = new kdTree.kdTree(
		// 	[],
		// 	(a: { x: number; y: number }, b: { x: number; y: number }) => {
		// 		return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
		// 	},
		// 	['x', 'y']
		// );

		this.updateCanvas();
		this.createBoids();
	}

	private createBoids() {
		this.boids = [];
		for (let i = 0; i < this.options.boidCount; i++) {
			const sx =
				(Math.random() * (this.options.maxSpeed - this.options.minSpeed) + this.options.minSpeed) *
				(Math.random() > 0.5 ? 1 : -1);
			const sy =
				(Math.random() * (this.options.maxSpeed - this.options.minSpeed) + this.options.minSpeed) *
				(Math.random() > 0.5 ? 1 : -1);
			this.boids.push(
				new Boid(
					Math.random() * (this.canvas.width - 2 * this.options.bounds.margin) +
						this.options.bounds.margin,
					Math.random() * (this.canvas.height - 2 * this.options.bounds.margin) +
						this.options.bounds.margin,
					sx,
					sy
				)
			);
		}
	}

	private update() {
		if (this.canvas.width != ((window.innerWidth * 7) / 10) * this.options.bounds.scale)
			this.updateCanvas();
		if (this.boids.length != this.options.boidCount) this.createBoids();

		const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.save();
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (const boid of this.boids) {
			boid.update(this.boids, this.canvas, this.options);
		}

		for (const boid of this.boids) {
			boid.pushUpdate(this.options);
		}

		for (const boid of this.boids) {
			boid.draw(ctx, this.options);
		}

		ctx.restore();
		requestAnimationFrame(this.update.bind(this));
	}

	public updateCanvas() {
		this.canvas.width = ((window.innerWidth * 7) / 10) * this.options.bounds.scale;
		this.canvas.height = ((window.innerHeight * 9) / 10) * this.options.bounds.scale;

		this.options.bounds.width = this.canvas.width;
		this.options.bounds.height = this.canvas.height;
	}

	public start() {
		this.update();
	}
}
