export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/** How many decimal places a step needs, so 0.1 → 1 and 0.25 → 2. */
export function decimalsOf(step: number): number {
	if (!Number.isFinite(step) || Number.isInteger(step)) return 0;
	const text = String(step);
	const exp = text.match(/e-(\d+)$/);
	if (exp) {
		const mantissa = text.slice(0, text.indexOf("e")).split(".")[1] ?? "";
		return Number(exp[1]) + mantissa.length;
	}
	return text.split(".")[1]?.length ?? 0;
}

/**
 * Snaps a value to the nearest multiple of `step`, then trims the float noise
 * that multiplying back can leave behind (0.30000000000000004 and friends).
 */
export function roundToStep(value: number, step: number): number {
	if (step <= 0) return value;
	const snapped = Math.round(value / step) * step;
	const rounded = Number(snapped.toFixed(decimalsOf(step)));
	return Object.is(rounded, -0) ? 0 : rounded;
}
