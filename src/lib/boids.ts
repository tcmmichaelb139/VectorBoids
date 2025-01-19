import { mouse, options } from '$lib/globals';

import { SpatialHashing, normalize, angle } from './utils';

class Boid {
	x: number;
	y: number;
	vx: number;
	vy: number;
	ax: number;
	ay: number;
	history: [number, number][] = [];

	constructor(x: number, y: number, vx: number, vy: number) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.ax = 0;
		this.ay = 0;
	}

	private clampAcc() {
		const acceleration = Math.sqrt(this.ax * this.ax + this.ay * this.ay);

		this.ax = (this.ax / acceleration) * Math.max(options.caps.minAcceleration, acceleration);
		this.ay = (this.ay / acceleration) * Math.max(options.caps.minAcceleration, acceleration);

		this.ax = (this.ax / acceleration) * Math.min(acceleration, options.caps.maxAcceleration);
		this.ay = (this.ay / acceleration) * Math.min(acceleration, options.caps.maxAcceleration);

		if (acceleration === 0) this.ax = this.ay = 0;
	}

	private clampVel() {
		const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

		this.vx = (this.vx / speed) * Math.max(options.caps.minSpeed, speed);
		this.vy = (this.vy / speed) * Math.max(options.caps.minSpeed, speed);

		this.vx = (this.vx / speed) * Math.min(speed, options.caps.maxSpeed);
		this.vy = (this.vy / speed) * Math.min(speed, options.caps.maxSpeed);

		if (speed === 0) this.vx = this.vy = 0;
	}

	private avoidBounds(distance: number) {
		if (distance < options.bounds.margins) {
			return options.factors.turn;
		} else {
			return options.factors.turn / distance;
		}
	}

	private mouseInteractions() {
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
	}

	update(boids: Boid[]) {
		let separationDxDy: [number, number] = [0, 0];
		let alignmentVel: [number, number] = [0, 0];
		let cohesionDxDy: [number, number] = [0, 0];
		let numBoidsVisible = 0;

		for (const boid of boids) {
			if (boid === this) continue;

			const dx = boid.x - this.x;
			const dy = boid.y - this.y;

			const distance = dx * dx + dy * dy;

			if (
				angle([dx, dy], [this.vx, this.vy]) > options.viewAngle * (Math.PI / 360) ||
				distance > options.ranges.visible * options.ranges.visible
			) {
				continue;
			}

			alignmentVel[0] += boid.vx;
			alignmentVel[1] += boid.vy;

			cohesionDxDy[0] += boid.x;
			cohesionDxDy[1] += boid.y;

			if (distance < options.ranges.separation * options.ranges.separation) {
				separationDxDy[0] -= dx / distance;
				separationDxDy[1] -= dy / distance;
			}

			numBoidsVisible++;
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

		// update acceleration
		this.ax = -this.vx * options.factors.drag;
		this.ay = -this.vy * options.factors.drag;

		// mouse interactions
		this.mouseInteractions();

		// update velocity based on separation
		this.ax += separationDxDy[0] * options.factors.separation;
		this.ay += separationDxDy[1] * options.factors.separation;

		// update velocity based on alignment
		this.ax += alignmentVel[0] * options.factors.alignment;
		this.ay += alignmentVel[1] * options.factors.alignment;

		// update velocity based on cohesion
		this.ax += cohesionDxDy[0] * options.factors.cohesion;
		this.ay += cohesionDxDy[1] * options.factors.cohesion;

		// update based on bounds
		this.ax += this.avoidBounds(this.x);
		this.ax -= this.avoidBounds(options.bounds.width - this.x);
		this.ay += this.avoidBounds(this.y);
		this.ay -= this.avoidBounds(options.bounds.height - this.y);
	}

	pushUpdate() {
		this.clampAcc();

		// update position
		this.x += this.vx + 0.5 * this.ax;
		this.y += this.vy + 0.5 * this.ay;

		// update velocity
		this.vx += this.ax;
		this.vy += this.ay;

		this.clampVel();

		// update history
		this.history.push([this.x, this.y]);
		while (this.history.length > options.trailLength) this.history.shift();
	}

	draw(ctx: CanvasRenderingContext2D) {
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

		// draw separation range
		if (options.show.separationRange) {
			ctx.beginPath();
			ctx.strokeStyle = options.colors.separation;
			ctx.arc(
				this.x,
				this.y,
				Math.min(options.ranges.separation, options.ranges.visible),
				0,
				2 * Math.PI
			);
			ctx.stroke();
			ctx.closePath();
		}

		if (options.trailLength > 0) {
			ctx.beginPath();
			ctx.strokeStyle = options.colors.trail;
			ctx.lineWidth = 1;
			ctx.moveTo(this.history[0][0], this.history[0][1]);
			for (let i = 0; i < this.history.length - 1; i++) {
				const xc = (this.history[i][0] + this.history[i + 1][0]) / 2;
				const yc = (this.history[i][1] + this.history[i + 1][1]) / 2;
				ctx.quadraticCurveTo(this.history[i][0], this.history[i][1], xc, yc);
			}

			ctx.stroke();
			ctx.closePath();
		}

		const unitVel = normalize([this.vx, this.vy]);

		ctx.beginPath();
		ctx.moveTo(this.x - unitVel[0] * 3 + unitVel[1] * 3, this.y - unitVel[1] * 3 - unitVel[0] * 3);
		ctx.lineTo(this.x + unitVel[0] * 3, this.y + unitVel[1] * 3);
		ctx.lineTo(this.x - unitVel[0] * 3 - unitVel[1] * 3, this.y - unitVel[1] * 3 + unitVel[0] * 3);
		ctx.strokeStyle = options.colors.boid;
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.closePath();
	}
}

export default class Boids {
	private canvas: HTMLCanvasElement;
	private boids: Boid[];
	private spatialhash: SpatialHashing<Boid>;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.boids = [];

		this.updateCanvas();
		this.createBoids();

		this.spatialhash = new SpatialHashing(
			25,
			this.canvas.width * 2,
			this.canvas.height * 2,
			this.canvas.width * 4,
			this.canvas.height * 4
		);
	}

	private createBoids() {
		this.boids = [];
		for (let i = 0; i < options.boidCount; i++) {
			const px =
				Math.random() * (this.canvas.width - 2 * options.bounds.margins) + options.bounds.margins;
			const py =
				Math.random() * (this.canvas.height - 2 * options.bounds.margins) + options.bounds.margins;
			const sx =
				(Math.random() * (options.caps.maxSpeed - options.caps.minSpeed) + options.caps.minSpeed) *
				(Math.random() > 0.5 ? 1 : -1);
			const sy =
				(Math.random() * (options.caps.maxSpeed - options.caps.minSpeed) + options.caps.minSpeed) *
				(Math.random() > 0.5 ? 1 : -1);
			this.boids.push(new Boid(px, py, sx, sy));
		}
	}

	private spatialHashBoids() {
		this.spatialhash.clear();
		for (const boid of this.boids) {
			this.spatialhash.insert(boid, boid.x, boid.y);
		}
	}

	private update() {
		if (this.canvas.width != ((window.innerWidth * 7) / 10) * options.bounds.scale)
			this.updateCanvas();
		if (this.boids.length != options.boidCount) this.createBoids();

		const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.save();
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.spatialHashBoids();

		for (const boid of this.boids) {
			boid.update(this.spatialhash.query(boid.x, boid.y, options.ranges.visible));
		}

		for (const boid of this.boids) {
			boid.pushUpdate();
		}

		for (const boid of this.boids) {
			boid.draw(ctx);
		}

		ctx.restore();
		requestAnimationFrame(this.update.bind(this));
	}

	updateCanvas() {
		this.canvas.width = window.innerWidth * options.bounds.scale;
		this.canvas.height = window.innerHeight * options.bounds.scale;

		options.bounds.width = this.canvas.width;
		options.bounds.height = this.canvas.height;
	}

	start() {
		this.update();
	}
}
