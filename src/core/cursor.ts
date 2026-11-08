export interface Point {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

const wrap = (value: number, size: number) =>
	size > 0 ? ((value % size) + size) % size : 0;

/**
 * Moves a virtual cursor by a pointer delta, wrapping it to the opposite edge
 * when it leaves the bounds. Under pointer lock the real cursor is hidden and
 * never hits the screen edge, so this is what you draw in its place.
 */
export function wrapCursor(position: Point, delta: Point, bounds: Size): Point {
	return {
		x: wrap(position.x + delta.x, bounds.width),
		y: wrap(position.y + delta.y, bounds.height),
	};
}
