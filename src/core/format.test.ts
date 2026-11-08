import { describe, expect, it } from "vitest";
import { formatValue, getSeparators, parseValue } from "./format";

const en = { locale: "en-US" };

describe("formatValue", () => {
	it("shows whole numbers without decimals", () => {
		expect(formatValue(120, en)).toBe("120");
		expect(formatValue(-45, en)).toBe("-45");
	});

	it("shows one decimal for a step of 1, like the lab", () => {
		expect(formatValue(12.5, en)).toBe("12.5");
		expect(formatValue(12.34, en)).toBe("12.3");
		expect(formatValue(12.04, en)).toBe("12");
	});

	it("follows the step", () => {
		expect(formatValue(0.125, { ...en, step: 0.01 })).toBe("0.125");
		expect(formatValue(0.1234, { ...en, step: 0.01 })).toBe("0.123");
	});

	it("uses an explicit precision", () => {
		expect(formatValue(1.23456, { ...en, precision: 2 })).toBe("1.23");
		expect(formatValue(3.7, { ...en, precision: 0 })).toBe("4");
	});

	it("never shows negative zero", () => {
		expect(formatValue(-0.01, en)).toBe("0");
	});

	it("does not group thousands", () => {
		expect(formatValue(12000, en)).toBe("12000");
	});
});

describe("parseValue", () => {
	it("reads plain numbers and math", () => {
		expect(parseValue("120", en)).toBe(120);
		expect(parseValue(" 120*2 ", en)).toBe(240);
	});

	it("ignores the field's unit", () => {
		expect(parseValue("120px", { ...en, unit: "px" })).toBe(120);
		expect(parseValue("120 px", { ...en, unit: "px" })).toBe(120);
		expect(parseValue("10px*2", { ...en, unit: "px" })).toBe(20);
		expect(parseValue("45°", { ...en, unit: "°" })).toBe(45);
		expect(parseValue("50%", { ...en, unit: "%" })).toBe(50);
	});

	it("rejects other units", () => {
		expect(parseValue("120em", { ...en, unit: "px" })).toBeNull();
		expect(parseValue("120px", en)).toBeNull();
	});

	it("returns null for junk", () => {
		expect(parseValue("", en)).toBeNull();
		expect(parseValue("wide", en)).toBeNull();
	});
});

describe("getSeparators", () => {
	it("reads separators from the locale", () => {
		expect(getSeparators("en-US")).toEqual({ decimal: ".", group: "," });
		expect(getSeparators("de-DE")).toEqual({ decimal: ",", group: "." });
	});
});

describe("locales", () => {
	it("formats with a decimal comma", () => {
		expect(formatValue(12.5, { locale: "de-DE" })).toBe("12,5");
		expect(formatValue(-1.5, { locale: "fr-FR" })).toBe("-1,5");
	});

	it("uses a plain hyphen and no direction marks for negatives", () => {
		expect(formatValue(-1.5, { locale: "sv-SE" })).toBe("-1,5");
		expect(formatValue(-1.5, { locale: "ar-EG" })).toBe("-1.5");
	});

	it("reads a decimal comma", () => {
		expect(parseValue("12,5", { locale: "de-DE" })).toBe(12.5);
		expect(parseValue("10,5*2", { locale: "de-DE" })).toBe(21);
		expect(parseValue("0,25px", { locale: "fr-FR", unit: "px" })).toBe(0.25);
	});

	it("still reads a decimal point in comma locales", () => {
		expect(parseValue("12.5", { locale: "de-DE" })).toBe(12.5);
	});

	it("drops thousands separators", () => {
		expect(parseValue("1,200", en)).toBe(1200);
		expect(parseValue("1’200", { locale: "de-CH" })).toBe(1200);
	});

	it("reads the Unicode minus sign", () => {
		expect(parseValue("−5", { locale: "sv-SE" })).toBe(-5);
	});

	it("round-trips what it formats", () => {
		for (const locale of [
			"en-US",
			"de-DE",
			"fr-FR",
			"sv-SE",
			"ar-EG",
			"de-CH",
		]) {
			expect(parseValue(formatValue(-1234.5, { locale }), { locale })).toBe(
				-1234.5,
			);
		}
	});
});
