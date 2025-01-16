import kdt from 'kd-tree-javascript';

export class kdTree<T> {
	private distance: (a: T, b: T) => number;
	private dimensions: Array<keyof T>;
	private points: T[];
	private kdTree: kdt.kdTree<T>;

	constructor(points: T[], distance: (a: T, b: T) => number, dimensions: Array<keyof T>) {
		this.distance = distance;
		this.dimensions = dimensions;

		this.points = points;
		this.kdTree = new kdt.kdTree(points, distance, dimensions);
	}

	public reset() {
		this.points = [];
		this.kdTree = new kdt.kdTree([], this.distance, this.dimensions);
	}

	public nearest(point: T, count: number, maxDistance?: number): Array<[T, number]> {
		return this.kdTree.nearest(point, count, maxDistance);
	}

	public all(): T[] {
		return this.points;
	}

	public length(): number {
		return this.points.length;
	}
}
