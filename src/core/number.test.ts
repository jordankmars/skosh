import { describe, expect, it } from "vitest";
import { clamp, decimalsOf, roundToStep } from "./number";

describe("clamp", () => {
	it("keeps values inside the range", () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-3, 0, 10)).toBe(0);
		expect(clamp(42, 0, 10)).toBe(10);
	});

	it("treats infinite bounds as open", () => {
		expect(clamp(1e9, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(
			1e9,
		);
	});
});

describe("decimalsOf", () => {
	it("counts decimal places in a step", () => {
		expect(decimalsOf(1)).toBe(0);
		expect(decimalsOf(10)).toBe(0);
		expect(decimalsOf(0.1)).toBe(1);
		expect(decimalsOf(0.25)).toBe(2);
		expect(decimalsOf(0.001)).toBe(3);
	});

	it("handles exponent notation", () => {
		expect(decimalsOf(1e-7)).toBe(7);
		expect(decimalsOf(2.5e-7)).toBe(8);
	});
});

describe("roundToStep", () => {
	it("rounds to whole numbers with a step of 1", () => {
		expect(roundToStep(12.4, 1)).toBe(12);
		expect(roundToStep(12.5, 1)).toBe(13);
	});

	it("rounds to tenths without float noise", () => {
		expect(roundToStep(0.1 + 0.2, 0.1)).toBe(0.3);
		expect(roundToStep(1.04, 0.1)).toBe(1);
		expect(roundToStep(1.05, 0.1)).toBe(1.1);
	});

	it("works with uneven steps", () => {
		expect(roundToStep(7, 5)).toBe(5);
		expect(roundToStep(0.6, 0.25)).toBe(0.5);
	});

	it("never returns negative zero", () => {
		expect(Object.is(roundToStep(-0.2, 1), 0)).toBe(true);
	});

	it("leaves the value alone for a step of zero", () => {
		expect(roundToStep(1.234, 0)).toBe(1.234);
	});
});
