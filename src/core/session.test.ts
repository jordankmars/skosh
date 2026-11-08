import { describe, expect, it } from "vitest";
import { createScrubSession, modifierMultiplier } from "./session";

describe("modifierMultiplier", () => {
	it("speeds up with Shift and slows down with Alt", () => {
		expect(modifierMultiplier()).toBe(1);
		expect(modifierMultiplier({ shift: true })).toBe(10);
		expect(modifierMultiplier({ alt: true })).toBe(0.1);
	});

	it("lets Shift win when both are held", () => {
		expect(modifierMultiplier({ shift: true, alt: true })).toBe(10);
	});
});

describe("createScrubSession", () => {
	it("moves one step per pixel by default", () => {
		const s = createScrubSession(10);
		expect(s.move(5)).toBe(15);
		expect(s.move(-8)).toBe(7);
	});

	it("uses perPx for the drag rate", () => {
		const s = createScrubSession(20, { perPx: 0.5 });
		expect(s.move(10)).toBe(25);
	});

	it("keeps sub-step movement instead of throwing it away", () => {
		const s = createScrubSession(0, { perPx: 0.5 });
		expect(s.move(1)).toBe(1); // 0.5 rounds up
		expect(s.move(1)).toBe(1);
		expect(s.move(1)).toBe(2); // 1.5
	});

	it("multiplies by ten with Shift", () => {
		const s = createScrubSession(100);
		expect(s.move(3, { shift: true })).toBe(130);
	});

	it("moves in tenths with Alt", () => {
		const s = createScrubSession(100);
		expect(s.move(3, { alt: true })).toBe(100.3);
		expect(s.move(4, { alt: true })).toBe(100.7);
	});

	it("does not jump when modifiers change mid-drag", () => {
		const s = createScrubSession(50);
		s.move(4, { alt: true }); // 50.4
		expect(s.value).toBe(50.4);
		// Letting go of Alt snaps the display to the step, but the running
		// total is untouched, so the next pixel continues from 50.4.
		expect(s.move(0)).toBe(50);
		expect(s.move(1)).toBe(51);
		expect(s.move(2, { shift: true })).toBe(71);
	});

	it("rounds like Shift alone when Shift and Alt are both held", () => {
		const s = createScrubSession(160);
		expect(s.move(4, { alt: true })).toBe(160.4);
		expect(s.move(1, { shift: true, alt: true })).toBe(170);
	});

	it("clamps to min and max without building up overshoot", () => {
		const s = createScrubSession(5, { min: 0, max: 10 });
		expect(s.move(-100)).toBe(0);
		// Dragging back should respond straight away, not after paying back the 95px.
		expect(s.move(3)).toBe(3);
		expect(s.move(100)).toBe(10);
	});

	it("clamps the starting value", () => {
		expect(createScrubSession(500, { max: 240 }).value).toBe(240);
	});

	it("snaps to a custom step", () => {
		const s = createScrubSession(0, { step: 5, perPx: 1 });
		expect(s.move(2)).toBe(0);
		expect(s.move(1)).toBe(5);
	});
});
