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
