import type { BoidSimOptions } from './types';
import { mouse } from '$lib/globals';
import { Quadtree, Circle } from '@timohausmann/quadtree-ts';

import { normalize, angle } from './utils';

class Boid extends Circle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	ax: number;
	ay: number;
	history: [number, number][] = [];

	constructor(x: number, y: number, vx: number, vy: number) {
		super({
			x: x,
			y: y,
			r: 11
		});
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.ax = 0;
		this.ay = 0;
	}

	private clamp(options: BoidSimOptions) {
		const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

		this.vx = (this.vx / speed) * Math.max(options.minSpeed, speed);
		this.vy = (this.vy / speed) * Math.max(options.minSpeed, speed);

		this.vx = (this.vx / speed) * Math.min(speed, options.maxSpeed);
		this.vy = (this.vy / speed) * Math.min(speed, options.maxSpeed);

		if (speed === 0) this.vx = this.vy = 0;
	}

	public update(boids: Boid[], canvas: HTMLCanvasElement, options: BoidSimOptions) {
		let separationDxDy: [number, number] = [0, 0];
		let alignmentVel: [number, number] = [0, 0];
		let cohesionDxDy: [number, number] = [0, 0];
		let numBoidsVisible = 0;

		for (const boid of boids) {
			if (boid === this) continue;

			const dx = boid.x - this.x;
			const dy = boid.y - this.y;

			if (angle([dx, dy], [this.vx, this.vy]) > options.viewAngle * (Math.PI / 360)) {
				continue;
			}

			const distance = Math.sqrt(dx * dx + dy * dy);
			if (options.ranges.protected <= distance && distance <= options.ranges.visible) {
				alignmentVel[0] += boid.vx;
				alignmentVel[1] += boid.vy;

				cohesionDxDy[0] += boid.x;
				cohesionDxDy[1] += boid.y;

				numBoidsVisible++;
			} else if (distance < options.ranges.protected) {
				separationDxDy[0] -= dx / distance;
				separationDxDy[1] -= dy / distance;
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

		cohesionDxDy[0] -= this.x;
		cohesionDxDy[1] -= this.y;

		// normalize vectors
		alignmentVel = normalize(alignmentVel);
		separationDxDy = normalize(separationDxDy);
		cohesionDxDy = normalize(cohesionDxDy);

		// update based on mouse
		const dx = mouse.x - this.x;
		const dy = mouse.y - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < options.ranges.visible) {
			if (options.mouse === 'avoid') {
				this.ax -= (dx / distance) * options.factors.mouse;
				this.ay -= (dy / distance) * options.factors.mouse;
			} else if (options.mouse === 'attract') {
				this.ax += (dx / distance) * options.factors.mouse;
				this.ay += (dy / distance) * options.factors.mouse;
			}
		}

		// update velocity based on seperation
		this.ax += separationDxDy[0] * options.factors.separation;
		this.ay += separationDxDy[1] * options.factors.separation;

		// update velocity based on alignment
		this.ax += alignmentVel[0] * options.factors.alignment;
		this.ay += alignmentVel[1] * options.factors.alignment;

		// update velocity based on cohesion
		this.ax += cohesionDxDy[0] * options.factors.cohesion;
		this.ay += cohesionDxDy[1] * options.factors.cohesion;

		// update based on bounds
		if (this.x < options.bounds.margin) this.ax += options.factors.turn;
		if (this.x > canvas.width - options.bounds.margin) this.ax -= options.factors.turn;
		if (this.y < options.bounds.margin) this.ay += options.factors.turn;
		if (this.y > canvas.height - options.bounds.margin) this.ay -= options.factors.turn;
	}

	public pushUpdate(options: BoidSimOptions) {
		// update velocity
		this.vx += this.ax * options.factors.regularization;
		this.vy += this.ay * options.factors.regularization;

		this.clamp(options);

		// update position
		this.x += this.vx;
		this.y += this.vy;

		// update history
		this.history.push([this.x, this.y]);
		while (this.history.length > options.trailLength) this.history.shift();

		// update acceleration
		this.ax = 0;
		this.ay = 0;
	}

	public draw(ctx: CanvasRenderingContext2D, options: BoidSimOptions) {
		if (!ctx) {
			throw new Error('Could not get 2d context from canvas');
		}

		// draw visual range
		if (options.show.visibleRange) {
			ctx.beginPath();
			ctx.strokeStyle = options.colors.visible;
			const angle = Math.atan2(this.vy, this.vx);
			ctx.arc(
				this.x,
				this.y,
				options.ranges.visible,
				angle - options.viewAngle * (Math.PI / 360),
				angle + options.viewAngle * (Math.PI / 360)
			);
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
			'M0.499866 0.809012L8.88195 5L0.499867 9.19099L0.499867 8.89179C0.667289 8.77399 0.858966 8.64601 1.06997 8.50512C1.14824 8.45285 1.22918 8.39881 1.31252 8.34285C1.70692 8.07806 2.14199 7.77885 2.54526 7.45479C2.94645 7.13241 3.33479 6.77088 3.62594 6.37546C3.91651 5.98081 4.13623 5.51682 4.13623 5.00001C4.13623 4.48321 3.91651 4.01921 3.62594 3.62456C3.33479 3.22914 2.94645 2.8676 2.54526 2.54522C2.142 2.22116 1.70692 1.92195 1.31253 1.65715C1.22916 1.60118 1.14821 1.54712 1.06991 1.49484C0.858932 1.35397 0.667274 1.22599 0.499866 1.10821L0.499866 0.809012Z'
			// 'M20.2315 12.3684L1.86287 20.6155C1.22314 20.9028 0.499999 20.4347 0.499999 19.7335C0.499999 19.4264 0.642123 19.1491 0.878881 18.9845C1.2196 18.7476 1.60369 18.4911 2.01301 18.2179C3.14616 17.4614 4.47275 16.5758 5.60821 15.6165C6.38648 14.959 7.10176 14.2461 7.62524 13.4864C8.1489 12.7265 8.5 11.8913 8.5 11C8.5 10.1088 8.1489 9.27358 7.62524 8.51365C7.10176 7.75398 6.38648 7.04106 5.60821 6.38354C4.47273 5.42423 3.14612 4.53859 2.01296 3.78209C1.60365 3.50884 1.21958 3.25243 0.878878 3.01549C0.64212 2.85084 0.499998 2.5736 0.499998 2.2665C0.499998 1.56525 1.22313 1.09725 1.86286 1.38447L20.2315 9.63162C21.4123 10.1618 21.4123 11.8383 20.2315 12.3684Z'
		);
		const p2 = new Path2D();
		p2.addPath(p, new DOMMatrix().translate(-5, -5));
		// p2.addPath(p, new DOMMatrix().translate(-7, -11));

		ctx.translate(this.x, this.y);
		ctx.rotate(angle);
		ctx.fillStyle = options.colors.boid;
		ctx.fill(p2);
		ctx.strokeStyle = options.colors.outline;
		ctx.lineWidth = 1;
		// ctx.stroke(p2);
		ctx.rotate(-angle);
		ctx.translate(-this.x, -this.y);
		ctx.closePath();
	}
}

export default class Boids {
	private canvas: HTMLCanvasElement;
	private options: BoidSimOptions;
	private boids: Boid[];
	private quadtree: Quadtree<Boid>;

	constructor(canvas: HTMLCanvasElement, options: BoidSimOptions) {
		this.canvas = canvas;
		this.options = options;
		this.boids = [];

		this.updateCanvas();
		this.createBoids();

		this.quadtree = new Quadtree({
			x: -canvas.width * 5,
			y: -canvas.height * 5,
			width: canvas.width * 10,
			height: canvas.height * 10,
			maxObjects: 10,
			maxLevels: 10
		});
	}

	private createBoids() {
		this.boids = [];
		for (let i = 0; i < this.options.boidCount; i++) {
			const px =
				Math.random() * (this.canvas.width - 2 * this.options.bounds.margin) +
				this.options.bounds.margin;
			const py =
				Math.random() * (this.canvas.height - 2 * this.options.bounds.margin) +
				this.options.bounds.margin;
			const sx =
				(Math.random() * (this.options.maxSpeed - this.options.minSpeed) + this.options.minSpeed) *
				(Math.random() > 0.5 ? 1 : -1);
			const sy =
				(Math.random() * (this.options.maxSpeed - this.options.minSpeed) + this.options.minSpeed) *
				(Math.random() > 0.5 ? 1 : -1);
			this.boids.push(new Boid(px, py, sx, sy));
		}
	}

	private newQuadTree() {
		this.quadtree.clear();
		for (const boid of this.boids) {
			this.quadtree.insert(boid);
		}
	}

	private update() {
		if (this.canvas.width != ((window.innerWidth * 7) / 10) * this.options.bounds.scale)
			this.updateCanvas();
		if (this.boids.length != this.options.boidCount) this.createBoids();

		const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.save();
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.newQuadTree();

		for (const boid of this.boids) {
			// console.log(
			// 	this.quadtree.retrieve(new Circle({ x: boid.x, y: boid.y, r: this.options.ranges.visible }))
			// );
			boid.update(
				this.quadtree.retrieve(
					new Circle({ x: boid.x, y: boid.y, r: this.options.ranges.visible })
				),
				this.canvas,
				this.options
			);
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
