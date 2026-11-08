import { describe, expect, it } from "vitest";
import { createDragIntent, dragThreshold } from "./intent";

describe("dragThreshold", () => {
	it("is tighter for a mouse than for touch or pen", () => {
		expect(dragThreshold("mouse")).toBeLessThan(dragThreshold("touch"));
		expect(dragThreshold("pen")).toBe(dragThreshold("touch"));
	});
});

describe("createDragIntent", () => {
	it("stays pending under the threshold and counts as a tap", () => {
		const intent = createDragIntent(8);
		expect(intent.move(3, 4)).toBe("pending");
		expect(intent.isTap).toBe(true);
	});

	it("becomes a scrub when the move is mostly horizontal", () => {
		const intent = createDragIntent(8);
		expect(intent.move(-9, 2)).toBe("scrub");
		expect(intent.isTap).toBe(false);
	});

	it("becomes a scroll when the move is mostly vertical", () => {
		const intent = createDragIntent(8);
		expect(intent.move(2, 12)).toBe("scroll");
	});

	it("treats an exact diagonal as a scrub", () => {
		expect(createDragIntent(8).move(6, 6)).toBe("scrub");
	});

	it("keeps its first decision", () => {
		const intent = createDragIntent(8);
		intent.move(10, 0);
		expect(intent.move(0, 200)).toBe("scrub");
		expect(intent.move(0, 0)).toBe("scrub");
	});
});
