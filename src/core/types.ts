export interface Modifiers {
	/** Coarse: moves ten times faster. */
	shift?: boolean;
	/** Fine: moves ten times slower and allows one more decimal place. */
	alt?: boolean;
}

export interface ScrubOptions {
	min?: number;
	max?: number;
	/** Smallest change the value snaps to. Defaults to 1. */
	step?: number;
	/** Most decimal places the value should have. Fine steps never go past this. */
	precision?: number;
	/** How much the value changes per pixel dragged. Defaults to `step`. */
	perPx?: number;
}
