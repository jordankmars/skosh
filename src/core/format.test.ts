import { describe, expect, it } from "vitest";
import { formatValue, parseValue } from "./format";

describe("formatValue", () => {
	it("shows whole numbers without decimals", () => {
		expect(formatValue(120)).toBe("120");
		expect(formatValue(-45)).toBe("-45");
	});

	it("shows one decimal for a step of 1, like the lab", () => {
		expect(formatValue(12.5)).toBe("12.5");
		expect(formatValue(12.34)).toBe("12.3");
		expect(formatValue(12.04)).toBe("12");
	});

	it("follows the step", () => {
		expect(formatValue(0.125, { step: 0.01 })).toBe("0.125");
		expect(formatValue(0.1234, { step: 0.01 })).toBe("0.123");
	});

	it("uses an explicit precision", () => {
		expect(formatValue(1.23456, { precision: 2 })).toBe("1.23");
		expect(formatValue(3.7, { precision: 0 })).toBe("4");
	});

	it("never shows negative zero", () => {
		expect(formatValue(-0.01)).toBe("0");
	});

	it("does not group thousands", () => {
		expect(formatValue(12000)).toBe("12000");
	});
});

describe("parseValue", () => {
	it("reads plain numbers and math", () => {
		expect(parseValue("120")).toBe(120);
		expect(parseValue(" 120*2 ")).toBe(240);
	});

	it("ignores the field's unit", () => {
		expect(parseValue("120px", { unit: "px" })).toBe(120);
		expect(parseValue("120 px", { unit: "px" })).toBe(120);
		expect(parseValue("10px*2", { unit: "px" })).toBe(20);
		expect(parseValue("45°", { unit: "°" })).toBe(45);
		expect(parseValue("50%", { unit: "%" })).toBe(50);
	});

	it("rejects other units", () => {
		expect(parseValue("120em", { unit: "px" })).toBeNull();
		expect(parseValue("120px")).toBeNull();
	});

	it("returns null for junk", () => {
		expect(parseValue("")).toBeNull();
		expect(parseValue("wide")).toBeNull();
	});
});
