import { compile } from 'mathjs';
import type { BoidSimOptions } from './types';

export class SpatialHashing<T> {
	private grid: T[][][];
	private offset: [number, number];
	private cellSize: number;

	constructor(cellSize: number, offsetX: number, offsetY: number, width: number, height: number) {
		this.cellSize = cellSize;
		this.offset = [offsetX, offsetY];
		this.grid = Array.from({ length: Math.ceil(width / cellSize) }, () =>
			Array.from({ length: Math.ceil(height / cellSize) }, () => [])
		);
	}

	private toGrid(x: number, y: number, withInBounds: boolean = true): [number, number] {
		x += this.offset[0];
		y += this.offset[1];

		if (withInBounds) {
			if (x < 0) x = 0;
			if (y < 0) y = 0;
			if (x >= this.grid.length * this.cellSize) x = this.grid.length * this.cellSize - 1;
			if (y >= this.grid[0].length * this.cellSize) y = this.grid[0].length * this.cellSize - 1;
		}

		return [Math.floor(x / this.cellSize), Math.floor(y / this.cellSize)];
	}

	query(x: number, y: number, r: number) {
		const [i, j] = this.toGrid(x - r, y - r);
		const [k, l] = this.toGrid(x + r, y + r);

		const result: T[] = [];
		for (let a = i; a <= k; a++) {
			for (let b = j; b <= l; b++) {
				result.push(...this.grid[a][b]);
			}
		}

		return result;
	}

	insert(item: T, x: number, y: number) {
		const [i, j] = this.toGrid(x, y);
		this.grid[i][j].push(item);
	}

	clear() {
		this.grid = this.grid.map((row) => row.map(() => []));
	}
}

export function magnitude(vector: { x: number; y: number }): number {
	return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

export function normalize(vector: { x: number; y: number }): { x: number; y: number } {
	const mag = magnitude(vector);
	if (mag === 0) return vector;
	return { x: vector.x / mag, y: vector.y / mag };
}

export function angle(v1: [number, number], v2: [number, number]): number {
	const dot = v1[0] * v2[0] + v1[1] * v2[1];
	const det = v1[0] * v2[1] - v1[1] * v2[0];
	return Math.atan2(det, dot);
}

export function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export function compileEquation(
	equation: string,
	options: BoidSimOptions
): ((x: number, y: number) => number) | undefined {
	if (!equation) return undefined;
	try {
		const compiled = compile(equation);
		options.vectorField.valid = true;
		return (x: number, y: number) => compiled.evaluate({ x, y });
	} catch (e) {
		options.vectorField.valid = false;
	}
	return undefined;
}

export function getVectorFieldForce(
	xy: { x: number; y: number },
	options: BoidSimOptions
): { x: number; y: number } {
	if (!options.vectorField.compiled.x || !options.vectorField.compiled.y) {
		return { x: NaN, y: NaN };
	}

	xy.y = -xy.y;

	const force: { x: number; y: number } = { x: 0, y: 0 };

	try {
		force.x = options.vectorField.compiled.x!(xy.x, xy.y);
		if (typeof force.x !== 'number') {
			throw new Error('Complex number');
		}
	} catch (e) {
		force.x = NaN;
	}

	try {
		force.y = -options.vectorField.compiled.y!(xy.x, xy.y);
		if (typeof force.y !== 'number') {
			throw new Error('Complex number');
		}
	} catch (e) {
		force.y = NaN;
	}

	return force;
}
