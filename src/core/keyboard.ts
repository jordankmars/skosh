import { clamp, roundToStep } from "./number";
import { FINE, modifierMultiplier } from "./session";
import type { Modifiers, ScrubOptions } from "./types";

const DIRECTION: Record<string, number> = { ArrowUp: 1, ArrowDown: -1 };

/** How far a key press should move the value, or null if the key doesn't step. */
export function stepFromKey(
	key: string,
	mods: Modifiers = {},
	step = 1,
): number | null {
	const direction = DIRECTION[key];
	if (direction === undefined) return null;
	return direction * step * modifierMultiplier(mods);
}

/** Applies a key press to a value, respecting the range and step. Returns null for other keys. */
export function stepValue(
	value: number,
	key: string,
	mods: Modifiers = {},
	options: ScrubOptions = {},
): number | null {
	const step = options.step ?? 1;
	const delta = stepFromKey(key, mods, step);
	if (delta === null) return null;
	const min = options.min ?? Number.NEGATIVE_INFINITY;
	const max = options.max ?? Number.POSITIVE_INFINITY;
	const next = roundToStep(
		value + delta,
		mods.alt && !mods.shift ? step * FINE : step,
	);
	return clamp(next, min, max);
}

export type EditAction = "commit" | "revert";

/** What a key should do to a value being typed: Enter keeps it, Escape throws it away. */
export function editKeyAction(key: string): EditAction | null {
	if (key === "Enter") return "commit";
	if (key === "Escape") return "revert";
	return null;
}
