import { evaluate } from "./expression";
import { decimalsOf } from "./number";

export interface FormatOptions {
	/** Most decimal places to show. Defaults to one more than the step has, so Alt-scrubbed values still show. */
	precision?: number;
	step?: number;
}

export interface ParseOptions {
	/** A unit the user may type after the number, like `px` in `120px`. */
	unit?: string;
}

function precisionFor(options: FormatOptions): number {
	return options.precision ?? decimalsOf(options.step ?? 1) + 1;
}

/** Shows a value with up to `precision` decimals, dropping zeros at the end: 12, 12.5, never 12.50. */
export function formatValue(
	value: number,
	options: FormatOptions = {},
): string {
	const text = new Intl.NumberFormat("en-US", {
		maximumFractionDigits: precisionFor(options),
		useGrouping: false,
	}).format(value);
	return text === "-0" ? "0" : text;
}

/** Turns typed text into a number, allowing a trailing unit and simple math. Returns null if it can't. */
export function parseValue(
	text: string,
	options: ParseOptions = {},
): number | null {
	let input = text.trim();
	const unit = options.unit?.trim();
	if (unit) input = input.split(unit).join("");
	return evaluate(input);
}
