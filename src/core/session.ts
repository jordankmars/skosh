import { clamp, roundToStep } from "./number";
import type { Modifiers, ScrubOptions } from "./types";

export const COARSE = 10;
export const FINE = 0.1;

export function modifierMultiplier(mods: Modifiers = {}): number {
	if (mods.shift) return COARSE;
	if (mods.alt) return FINE;
	return 1;
}

/** What a value snaps to for the modifiers held. Fine steps stop at `precision` if it's set. */
export function snapStep(
	mods: Modifiers = {},
	options: ScrubOptions = {},
): number {
	const step = options.step ?? 1;
	if (!mods.alt || mods.shift) return step;
	const fine = Number((step * FINE).toPrecision(12));
	if (options.precision === undefined) return fine;
	return Math.min(step, Math.max(fine, 10 ** -options.precision));
}

export interface ScrubSession {
	/** Feed a horizontal pointer delta in pixels and get the new value back. */
	move(dx: number, mods?: Modifiers): number;
	/** The current value, snapped to the step. */
	readonly value: number;
}

/**
 * Tracks one drag. Each move adds to an unrounded running total using the
 * modifiers held at that moment, and only the output is rounded. That way
 * pressing or releasing Shift or Alt halfway through a drag changes the speed
 * from that point on, without the value jumping.
 */
export function createScrubSession(
	start: number,
	options: ScrubOptions = {},
): ScrubSession {
	const min = options.min ?? Number.NEGATIVE_INFINITY;
	const max = options.max ?? Number.POSITIVE_INFINITY;
	const step = options.step ?? 1;
	const perPx = options.perPx ?? step;

	let total = clamp(start, min, max);
	let value = total;

	return {
		move(dx, mods = {}) {
			total = clamp(total + dx * perPx * modifierMultiplier(mods), min, max);
			value = clamp(roundToStep(total, snapStep(mods, options)), min, max);
			return value;
		},
		get value() {
			return value;
		},
	};
}
