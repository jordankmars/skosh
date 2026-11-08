import { evaluate } from "./expression";
import { decimalsOf } from "./number";

export interface FormatOptions {
	/** Most decimal places to show. Defaults to one more than the step has, so Alt-scrubbed values still show. */
	precision?: number;
	step?: number;
	/** BCP 47 locale for the decimal separator, like `de-DE`. Defaults to the runtime's locale. */
	locale?: string;
}

export interface ParseOptions {
	/** A unit the user may type after the number, like `px` in `120px`. */
	unit?: string;
	locale?: string;
}

// Directional marks some locales add around numbers, plus the Unicode minus sign.
const BIDI_MARKS = /[\u200e\u200f\u061c]/g;
const UNICODE_MINUS = /\u2212/g;

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(
	locale: string | undefined,
	precision: number,
): Intl.NumberFormat {
	const key = `${locale ?? ""}|${precision}`;
	let formatter = formatters.get(key);
	if (!formatter) {
		formatter = new Intl.NumberFormat(locale, {
			maximumFractionDigits: precision,
			useGrouping: false,
			numberingSystem: "latn",
		});
		formatters.set(key, formatter);
	}
	return formatter;
}

export interface Separators {
	decimal: string;
	group: string;
}

/** The decimal and thousands separators a locale uses. */
export function getSeparators(locale?: string): Separators {
	const parts = new Intl.NumberFormat(locale, {
		numberingSystem: "latn",
	}).formatToParts(12345.6);
	return {
		decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
		group: parts.find((p) => p.type === "group")?.value ?? ",",
	};
}

function precisionFor(options: FormatOptions): number {
	return options.precision ?? decimalsOf(options.step ?? 1) + 1;
}

/**
 * Shows a value with up to `precision` decimals, dropping zeros at the end:
 * 12, 12.5, never 12.50. Uses the locale's decimal separator but no grouping,
 * and a plain hyphen for negatives, since the text is meant to be edited.
 */
export function formatValue(
	value: number,
	options: FormatOptions = {},
): string {
	const text = getFormatter(options.locale, precisionFor(options))
		.format(value)
		.replace(BIDI_MARKS, "")
		.replace(UNICODE_MINUS, "-");
	return text === "-0" ? "0" : text;
}

/**
 * Rewrites locale number text into the plain form `evaluate` reads.
 *
 * Where the decimal separator is a comma, both `,` and `.` count as decimal
 * points. Someone typing `12.5` into a German field almost always means
 * twelve and a half, not 125. Other group separators (`,` in English, spaces,
 * apostrophes) are dropped.
 */
function normalize(text: string, locale?: string): string {
	const { decimal, group } = getSeparators(locale);
	let out = text
		.replace(BIDI_MARKS, "")
		.replace(UNICODE_MINUS, "-")
		.replace(/\u066b/g, ".");
	if (decimal === ",") {
		if (group !== ".") out = out.split(group).join("");
		return out.replace(/,/g, ".");
	}
	return out.split(group).join("");
}

/** Turns typed text into a number, allowing a trailing unit, locale decimals and simple math. Returns null if it can't. */
export function parseValue(
	text: string,
	options: ParseOptions = {},
): number | null {
	let input = text.trim();
	const unit = options.unit?.trim();
	if (unit) input = input.split(unit).join("");
	return evaluate(normalize(input, options.locale));
}
