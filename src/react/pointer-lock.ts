export interface PointerLockCallbacks {
	/** The browser granted the lock and it's still wanted. */
	onHeld: () => void;
	/** The lock went away without being released, like the user pressing Escape. */
	onLost: () => void;
}

export interface PointerLock {
	/** Asks for the lock. A refusal is silent, since a drag works without it. */
	request(el: HTMLElement): void;
	/** Gives the lock up, or cancels a request still waiting on an answer. */
	release(): void;
	readonly held: boolean;
	readonly idle: boolean;
}

type State = "idle" | "pending" | "held" | "exiting";

/**
 * Tracks one element's pointer lock. Grants and exits both arrive late, so
 * listening has to last until the browser has answered, even if the drag that
 * asked is already over. Otherwise a late grant would leave the cursor hidden,
 * or the exit from one drag could end the next.
 */
export function createPointerLock(
	callbacks: PointerLockCallbacks,
): PointerLock {
	let state: State = "idle";
	let wanted = false;
	let target: HTMLElement | null = null;
	let requestId = 0;

	const owns = () =>
		target !== null && target.ownerDocument.pointerLockElement === target;

	const settle = () => {
		const doc = target?.ownerDocument;
		doc?.removeEventListener("pointerlockchange", onChange);
		doc?.removeEventListener("pointerlockerror", onError);
		state = "idle";
	};

	const exit = () => {
		state = "exiting";
		target?.ownerDocument.exitPointerLock();
	};

	function onChange() {
		if (state === "pending") {
			// Anything else is another element's lock, so keep waiting for ours.
			if (!owns()) return;
			if (wanted) {
				state = "held";
				callbacks.onHeld();
			} else {
				exit();
			}
			return;
		}
		if (owns()) return;
		if (state === "held") {
			settle();
			callbacks.onLost();
		} else if (state === "exiting") {
			settle();
			if (wanted && target) request(target);
		}
	}

	function onError() {
		if (state === "pending") settle();
	}

	function request(el: HTMLElement) {
		wanted = true;
		if (state !== "idle") return;
		target = el;
		state = "pending";
		const id = ++requestId;
		const refused = () => {
			if (id === requestId && state === "pending") settle();
		};
		el.ownerDocument.addEventListener("pointerlockchange", onChange);
		el.ownerDocument.addEventListener("pointerlockerror", onError);
		try {
			// A promise in newer browsers, nothing in older ones.
			Promise.resolve(el.requestPointerLock()).catch(refused);
		} catch {
			refused();
		}
	}

	return {
		request,
		release() {
			wanted = false;
			if (state === "held") exit();
		},
		get held() {
			return state === "held";
		},
		get idle() {
			return state === "idle";
		},
	};
}
