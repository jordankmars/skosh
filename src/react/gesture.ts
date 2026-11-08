export interface ValueGesture {
	/** Records the latest value. Returns true if it's different from the one before. */
	update(value: number): boolean;
	/** Ends the gesture. Returns the final value if it moved overall, and null otherwise or if already ended. */
	finish(): number | null;
}

/**
 * One continuous change to a value, like a drag or a held arrow key. It keeps
 * repeat values from being reported and makes sure the end is only reported once.
 */
export function createGesture(start: number): ValueGesture {
	let last = start;
	let finished = false;
	return {
		update(value) {
			const changed = value !== last;
			last = value;
			return changed;
		},
		finish() {
			if (finished) return null;
			finished = true;
			return last === start ? null : last;
		},
	};
}
