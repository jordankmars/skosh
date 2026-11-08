import { describe, expect, it } from "vitest";
import { createGesture } from "./gesture";

describe("createGesture", () => {
	it("reports only real changes", () => {
		const gesture = createGesture(10);
		expect(gesture.update(10)).toBe(false);
		expect(gesture.update(11)).toBe(true);
		expect(gesture.update(11)).toBe(false);
	});

	it("finishes with the last value when it moved", () => {
		const gesture = createGesture(10);
		gesture.update(15);
		expect(gesture.finish()).toBe(15);
	});

	it("finishes with nothing when it ended where it started", () => {
		const gesture = createGesture(10);
		gesture.update(15);
		gesture.update(10);
		expect(gesture.finish()).toBeNull();
	});

	it("only finishes once", () => {
		const gesture = createGesture(10);
		gesture.update(15);
		gesture.finish();
		expect(gesture.finish()).toBeNull();
	});
});
