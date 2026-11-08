import { describe, expect, it } from "vitest";
import { editKeyAction, stepFromKey, stepValue } from "./keyboard";

describe("stepFromKey", () => {
	it("steps up and down with the arrow keys", () => {
		expect(stepFromKey("ArrowUp")).toBe(1);
		expect(stepFromKey("ArrowDown")).toBe(-1);
	});

	it("uses the modifiers", () => {
		expect(stepFromKey("ArrowUp", { shift: true })).toBe(10);
		expect(stepFromKey("ArrowDown", { alt: true })).toBe(-0.1);
	});

	it("scales with the step", () => {
		expect(stepFromKey("ArrowUp", {}, 5)).toBe(5);
	});

	it("ignores other keys", () => {
		expect(stepFromKey("ArrowLeft")).toBeNull();
		expect(stepFromKey("a")).toBeNull();
	});
});

describe("stepValue", () => {
	it("adds the step and keeps the result in range", () => {
		expect(stepValue(10, "ArrowUp")).toBe(11);
		expect(stepValue(235, "ArrowUp", { shift: true }, { max: 240 })).toBe(240);
		expect(stepValue(3, "ArrowDown", { shift: true }, { min: 0 })).toBe(0);
	});

	it("steps in tenths with Alt without float noise", () => {
		expect(stepValue(0.2, "ArrowUp", { alt: true })).toBe(0.3);
	});

	it("moves by a whole step with Alt when the precision is 0", () => {
		const whole = { step: 1, precision: 0 };
		expect(stepValue(10, "ArrowUp", { alt: true }, whole)).toBe(11);
		expect(stepValue(10, "ArrowDown", { alt: true }, whole)).toBe(9);
	});

	it("keeps tenths with Alt when the precision allows them", () => {
		expect(stepValue(10, "ArrowUp", { alt: true }, { precision: 1 })).toBe(
			10.1,
		);
	});

	it("lets Shift win over Alt", () => {
		const whole = { step: 1, precision: 0 };
		expect(stepValue(10, "ArrowUp", { shift: true, alt: true }, whole)).toBe(
			20,
		);
	});

	it("snaps an off-step value back onto the grid", () => {
		expect(stepValue(10.4, "ArrowUp")).toBe(11);
	});

	it("returns null for keys that don't step", () => {
		expect(stepValue(10, "Tab")).toBeNull();
	});
});

describe("editKeyAction", () => {
	it("commits on Enter and reverts on Escape", () => {
		expect(editKeyAction("Enter")).toBe("commit");
		expect(editKeyAction("Escape")).toBe("revert");
		expect(editKeyAction("x")).toBeNull();
	});
});
