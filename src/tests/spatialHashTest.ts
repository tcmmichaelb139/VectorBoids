import { SpatialHashing } from '$lib/utils';
export function spatialHashingTest() {
	const cellSize = 10;
	const offsetX = 0;
	const offsetY = 0;
	const width = 100;
	const height = 100;
	const spatialhash = new SpatialHashing(cellSize, offsetX, offsetY, width, height);

	const x = 50;
	const y = 50;
	const r = 10;

	for (let i = -11; i <= 11; i++) {
		for (let j = -11; j <= 11; j++) {
			const item = { x: x + i, y: y + j };
			spatialhash.insert(item, x + i, y + j);
		}
	}
	const result = spatialhash.query(x, y, r);

	console.log(result);
}
