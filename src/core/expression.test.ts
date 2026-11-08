import { describe, expect, it } from "vitest";
import { evaluate } from "./expression";

describe("evaluate", () => {
	it("reads plain numbers", () => {
		expect(evaluate("42")).toBe(42);
		expect(evaluate("3.5")).toBe(3.5);
		expect(evaluate(".5")).toBe(0.5);
		expect(evaluate("7.")).toBe(7);
		expect(evaluate("  12  ")).toBe(12);
	});

	it("does arithmetic", () => {
		expect(evaluate("120*2")).toBe(240);
		expect(evaluate("100 - 20 + 5")).toBe(85);
		expect(evaluate("90/4")).toBe(22.5);
	});

	it("follows operator precedence", () => {
		expect(evaluate("2+3*4")).toBe(14);
		expect(evaluate("10-4/2")).toBe(8);
	});

	it("handles parentheses", () => {
		expect(evaluate("(10+5)/3")).toBe(5);
		expect(evaluate("2*(3+(4-1))")).toBe(12);
	});

	it("handles unary signs", () => {
		expect(evaluate("-4")).toBe(-4);
		expect(evaluate("+4")).toBe(4);
		expect(evaluate("10*-2")).toBe(-20);
		expect(evaluate("--3")).toBe(3);
		expect(evaluate("-(2+3)")).toBe(-5);
	});

	it("rejects anything it can't fully read", () => {
		expect(evaluate("")).toBeNull();
		expect(evaluate("abc")).toBeNull();
		expect(evaluate("12px")).toBeNull();
		expect(evaluate("2+")).toBeNull();
		expect(evaluate("(2+3")).toBeNull();
		expect(evaluate("2+3)")).toBeNull();
		expect(evaluate("1.2.3")).toBeNull();
		expect(evaluate("alert(1)")).toBeNull();
	});

	it("rejects division by zero", () => {
		expect(evaluate("1/0")).toBeNull();
		expect(evaluate("0/0")).toBeNull();
	});
});
