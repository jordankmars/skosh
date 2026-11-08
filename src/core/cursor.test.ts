import { describe, expect, it } from "vitest";
import { wrapCursor } from "./cursor";

const screen = { width: 800, height: 600 };

describe("wrapCursor", () => {
	it("moves normally inside the bounds", () => {
		expect(wrapCursor({ x: 100, y: 100 }, { x: 20, y: -10 }, screen)).toEqual({
			x: 120,
			y: 90,
		});
	});

	it("wraps off the right edge to the left", () => {
		expect(wrapCursor({ x: 790, y: 300 }, { x: 30, y: 0 }, screen)).toEqual({
			x: 20,
			y: 300,
		});
	});

	it("wraps off the left edge to the right", () => {
		expect(wrapCursor({ x: 10, y: 300 }, { x: -30, y: 0 }, screen)).toEqual({
			x: 780,
			y: 300,
		});
	});

	it("wraps off the bottom edge to the top", () => {
		expect(wrapCursor({ x: 400, y: 590 }, { x: 0, y: 25 }, screen)).toEqual({
			x: 400,
			y: 15,
		});
	});

	it("wraps off the top edge to the bottom", () => {
		expect(wrapCursor({ x: 400, y: 5 }, { x: 0, y: -10 }, screen)).toEqual({
			x: 400,
			y: 595,
		});
	});

	it("handles moves longer than the bounds", () => {
		expect(wrapCursor({ x: 0, y: 0 }, { x: 1650, y: -1250 }, screen)).toEqual({
			x: 50,
			y: 550,
		});
	});

	it("puts the cursor at the origin when the bounds are empty", () => {
		expect(
			wrapCursor({ x: 10, y: 10 }, { x: 5, y: 5 }, { width: 0, height: 0 }),
		).toEqual({ x: 0, y: 0 });
	});
});
