export type DragIntentState = "pending" | "scrub" | "scroll";

export interface DragIntent {
	/** Feed the total offset from where the press started. Once decided, the answer sticks. */
	move(dx: number, dy: number): DragIntentState;
	readonly state: DragIntentState;
	/** True if the press ended before it moved far enough to count as a drag. */
	readonly isTap: boolean;
}

/**
 * How far a pointer has to move before a press counts as a drag. Mice are
 * precise enough for a hair-trigger. Fingers wobble, so they get more room.
 */
export function dragThreshold(pointerType: string): number {
	return pointerType === "mouse" ? 2 : 8;
}

/**
 * Works out what a press on the label is for. Until it passes the threshold
 * it could still be a tap. After that a mostly horizontal move is a scrub,
 * and a mostly vertical one is the page scrolling, which a touch user
 * expects to keep working.
 */
export function createDragIntent(threshold: number): DragIntent {
	let state: DragIntentState = "pending";
	return {
		move(dx, dy) {
			if (state === "pending" && Math.hypot(dx, dy) >= threshold) {
				state = Math.abs(dx) >= Math.abs(dy) ? "scrub" : "scroll";
			}
			return state;
		},
		get state() {
			return state;
		},
		get isTap() {
			return state === "pending";
		},
	};
}
