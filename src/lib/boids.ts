import type { BoidSimOptions } from '$lib/types';
import { mouse } from '$lib/globals';

import {
	SpatialHashing,
	normalize,
	angle,
	randomInt,
	getVectorFieldForce,
	compileEquation
} from './utils';

let options: BoidSimOptions;

export function setOptions(goptions: BoidSimOptions) {
	options = JSON.parse(JSON.stringify(goptions));

	if (options.vectorField.x) {
		options.vectorField.compiled.x = compileEquation(options.vectorField.x, options);
	} else {
		options.vectorField.compiled.x = undefined;
	}

	if (options.vectorField.y) {
		options.vectorField.compiled.y = compileEquation(options.vectorField.y, options);
	} else {
		options.vectorField.compiled.y = undefined;
	}

	return options.vectorField.compiled.x && options.vectorField.compiled.y ? true : false;
}

class Boid {
	x: number;
	y: number;
	vx: number;
	vy: number;
	ax: number;
	ay: number;
	color: number;
	history: [number, number][] = [];

	constructor(x: number, y: number, vx: number, vy: number) {
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.ax = 0;
		this.ay = 0;
		options = options;
		this.color = randomInt(1, options.numBoidColors) - 1;
	}

	private clampAcc() {
		const acceleration = Math.sqrt(this.ax * this.ax + this.ay * this.ay);

		this.ax = (this.ax / acceleration) * Math.max(options.caps.minAcceleration, acceleration);
		this.ay = (this.ay / acceleration) * Math.max(options.caps.minAcceleration, acceleration);

		this.ax = (this.ax / acceleration) * Math.min(acceleration, options.caps.maxAcceleration);
		this.ay = (this.ay / acceleration) * Math.min(acceleration, options.caps.maxAcceleration);

		if (isNaN(this.ax)) this.ax = 0;
		if (isNaN(this.ay)) this.ay = 0;

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

	private isOutsideBounds() {
		return (
			this.x < options.bounds.margins ||
			this.x > options.bounds.width - options.bounds.margins ||
			this.y < options.bounds.margins ||
			this.y > options.bounds.height - options.bounds.margins
		);
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

	private getVectorField() {
		const xy = {
			x: this.x - options.bounds.width / 2,
			y: this.y - options.bounds.height / 2
		};

		if (!this.isOutsideBounds()) {
			const force = getVectorFieldForce(xy, options);
			if (isNaN(force.x) || isNaN(force.y)) return { x: 0, y: 0 };
			force.x *= options.vectorField.factor;
			force.y *= options.vectorField.factor;
			return force;
		}

		return { x: 0, y: 0 };
	}

	update(boids: Boid[]) {
		let separationDxDy: { x: number; y: number } = { x: 0, y: 0 };
		let alignmentVel: { x: number; y: number } = { x: 0, y: 0 };
		let cohesionDxDy: { x: number; y: number } = { x: 0, y: 0 };
		let numBoidsVisible = 0;

		for (const boid of boids) {
			if (boid === this) continue;

			const dx = boid.x - this.x;
			const dy = boid.y - this.y;

			const distance = dx * dx + dy * dy;

			if (
				// check if boid is within view angle and distance
				Math.abs(angle([dx, dy], [this.vx, this.vy])) > options.viewAngle * (Math.PI / 360) ||
				distance > options.ranges.visible * options.ranges.visible
			) {
				continue;
			}

			if (options.followColor && boid.color === this.color) {
				alignmentVel.x += boid.vx;
				alignmentVel.y += boid.vy;

				cohesionDxDy.x += boid.x;
				cohesionDxDy.y += boid.y;

				numBoidsVisible++;
			}

			if (distance < options.ranges.separation * options.ranges.separation) {
				separationDxDy.x -= dx / distance;
				separationDxDy.y -= dy / distance;
			}
		}

		if (numBoidsVisible > 0) {
			alignmentVel.x /= numBoidsVisible;
			alignmentVel.y /= numBoidsVisible;

			cohesionDxDy.x /= numBoidsVisible;
			cohesionDxDy.y /= numBoidsVisible;
		} else {
			cohesionDxDy.x = this.x;
			cohesionDxDy.y = this.y;
		}

		cohesionDxDy.x -= this.x;
		cohesionDxDy.y -= this.y;

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
		this.ax += separationDxDy.x * options.factors.separation;
		this.ay += separationDxDy.y * options.factors.separation;

		// update velocity based on alignment
		this.ax += alignmentVel.x * options.factors.alignment;
		this.ay += alignmentVel.y * options.factors.alignment;

		// update velocity based on cohesion
		this.ax += cohesionDxDy.x * options.factors.cohesion;
		this.ay += cohesionDxDy.y * options.factors.cohesion;

		// update based on bounds
		this.ax += this.avoidBounds(this.x);
		this.ax -= this.avoidBounds(options.bounds.width - this.x);
		this.ay += this.avoidBounds(this.y);
		this.ay -= this.avoidBounds(options.bounds.height - this.y);

		// vector field
		const vectorFieldForce = this.getVectorField();

		if (!isNaN(vectorFieldForce.x) && !isNaN(vectorFieldForce.y)) {
			this.ax += vectorFieldForce.x;
			this.ay += vectorFieldForce.y;
		}
	}

	pushUpdate(dt: number) {
		this.clampAcc();

		// update position
		this.x += this.vx * dt + 0.5 * this.ax * (dt * dt);
		this.y += this.vy * dt + 0.5 * this.ay * (dt * dt);

		// update velocity
		this.vx += this.ax * dt;
		this.vy += this.ay * dt;

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
			ctx.strokeStyle = options.colors.boids[this.color];
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

		const unitVel = normalize({ x: this.vx, y: this.vy });

		ctx.beginPath();
		ctx.moveTo(this.x - unitVel.x * 3 + unitVel.y * 3, this.y - unitVel.y * 3 - unitVel.x * 3);
		ctx.lineTo(this.x + unitVel.x * 3, this.y + unitVel.y * 3);
		ctx.lineTo(this.x - unitVel.x * 3 - unitVel.y * 3, this.y - unitVel.y * 3 + unitVel.x * 3);
		ctx.strokeStyle = options.colors.boids[this.color];
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.closePath();
	}
}

export class Boids {
	private canvas: HTMLCanvasElement;
	private boids: Boid[];
	private oldOptions: BoidSimOptions;
	private spatialhash: SpatialHashing<Boid>;
	private timestep: number;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.boids = [];
		this.oldOptions = JSON.parse(JSON.stringify(options));
		this.timestep = 0;

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

	private copyOptions() {
		this.oldOptions = JSON.parse(JSON.stringify(options));
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

	private drawVectorField(ctx: CanvasRenderingContext2D) {
		if (!options.show.vectorField) return;

		for (let x = 0; x < this.canvas.width; x += options.vectorFieldGridWidth) {
			for (let y = 0; y < this.canvas.height; y += options.vectorFieldGridWidth) {
				const xy = {
					x: x - this.canvas.width / 2,
					y: y - this.canvas.height / 2
				};

				const force = getVectorFieldForce(xy, options);
				if (isNaN(force.x) || isNaN(force.y)) continue;

				const mult = 100 * options.vectorField.factor;

				const unitVel = normalize({ x: force.x, y: force.y });

				ctx.beginPath();
				ctx.moveTo(x - force.x * mult, y - force.y * mult);
				ctx.lineTo(x + force.x * mult, y + force.y * mult);

				ctx.moveTo(x - unitVel.x * 3 + unitVel.y * 3, y - unitVel.y * 3 - unitVel.x * 3);
				ctx.lineTo(x + unitVel.x * 3, y + unitVel.y * 3);
				ctx.lineTo(x - unitVel.x * 3 - unitVel.y * 3, y - unitVel.y * 3 + unitVel.x * 3);
				ctx.strokeStyle = options.colors.vectorField;
				ctx.lineWidth = 1;
				ctx.stroke();
				ctx.closePath();
			}
		}
	}

	private update(time: number) {
		if (options.bounds.width != window.innerWidth * options.bounds.scale) this.updateCanvas();
		if (this.boids.length != options.boidCount) this.createBoids();
		if (this.oldOptions.numBoidColors !== options.numBoidColors) {
			this.createBoids();
			this.copyOptions();
		}
		if (this.oldOptions.vectorField.x !== options.vectorField.x) {
			options.vectorField.compiled.x = compileEquation(options.vectorField.x, options);
			this.copyOptions();
		}
		if (this.oldOptions.vectorField.y !== options.vectorField.y) {
			options.vectorField.compiled.y = compileEquation(options.vectorField.y, options);
			this.copyOptions();
		}

		const dt = Math.min(4, (time - this.timestep) / 16);

		const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.save();
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.spatialHashBoids();
		for (const boid of this.boids) {
			boid.update(this.spatialhash.query(boid.x, boid.y, options.ranges.visible));
		}

		for (const boid of this.boids) {
			boid.pushUpdate(dt);
		}

		this.drawVectorField(ctx);
		for (const boid of this.boids) {
			boid.draw(ctx);
		}

		this.timestep = time;

		ctx.restore();
		requestAnimationFrame((t: number) => this.update(t));
	}

	updateCanvas() {
		this.canvas.width = window.innerWidth * options.bounds.scale;
		this.canvas.height = window.innerHeight * options.bounds.scale;

		options.bounds.width = this.canvas.width;
		options.bounds.height = this.canvas.height;
	}

	start() {
		this.timestep = performance.now();
		this.update(this.timestep);
	}

	reset() {
		this.copyOptions();
		this.createBoids();
		this.updateCanvas();
	}
}
