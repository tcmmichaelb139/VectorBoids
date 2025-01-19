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

function magnitude(vector: [number, number]): number {
	return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
}
export function normalize(vector: [number, number]): [number, number] {
	const mag = magnitude(vector);
	if (mag === 0) return vector;
	return [vector[0] / mag, vector[1] / mag];
}

export function angle(v1: [number, number], v2: [number, number]): number {
	const dot = v1[0] * v2[0] + v1[1] * v2[1];
	const det = v1[0] * v2[1] - v1[1] * v2[0];
	return Math.atan2(det, dot);
}
