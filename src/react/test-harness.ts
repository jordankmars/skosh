// Test helpers. jsdom has no pointer lock or pointer capture, and it needs help
// with the pointer fields we read, so these stand in for the browser.
import { act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

export interface FakeBrowser {
	/** Elements still waiting on a lock answer, oldest first. */
	readonly pendingLocks: Element[];
	/** How many times the page has asked to leave pointer lock. */
	readonly exitRequests: number;
	readonly captured: Set<number>;
	/** Answers the oldest lock request with a grant. */
	grantLock(): void;
	/** Answers the oldest lock request with a refusal. */
	denyLock(): void;
	/** Leaves pointer lock, as Escape or a finished exit request would. */
	exitLock(): void;
	/** Puts the lock on any element without going through a request. */
	forceLock(el: Element): void;
}

export interface PointerInit {
	pointerId?: number;
	pointerType?: string;
	button?: number;
	clientX?: number;
	clientY?: number;
	movementX?: number;
	movementY?: number;
	shiftKey?: boolean;
	altKey?: boolean;
}

function install(): { browser: FakeBrowser; restore: () => void } {
	const pendingLocks: Element[] = [];
	const captured = new Set<number>();
	let locked: Element | null = null;
	let exitRequests = 0;

	const proto = Element.prototype as unknown as Record<string, unknown>;
	const docProto = Document.prototype as unknown as Record<string, unknown>;
	const saved = {
		setCapture: proto.setPointerCapture,
		releaseCapture: proto.releasePointerCapture,
		hasCapture: proto.hasPointerCapture,
		requestLock: proto.requestPointerLock,
		exitLock: docProto.exitPointerLock,
	};

	proto.setPointerCapture = (id: number) => {
		captured.add(id);
	};
	proto.releasePointerCapture = (id: number) => {
		captured.delete(id);
	};
	proto.hasPointerCapture = (id: number) => captured.has(id);
	proto.requestPointerLock = function (this: Element) {
		pendingLocks.push(this);
		return Promise.resolve();
	};
	docProto.exitPointerLock = () => {
		exitRequests += 1;
	};
	Object.defineProperty(Document.prototype, "pointerLockElement", {
		configurable: true,
		get: () => locked,
	});

	const notify = (el: Element | null, type: string) => {
		act(() => {
			(el?.ownerDocument ?? document).dispatchEvent(new Event(type));
		});
	};

	const browser: FakeBrowser = {
		pendingLocks,
		captured,
		get exitRequests() {
			return exitRequests;
		},
		grantLock() {
			const el = pendingLocks.shift();
			if (!el) throw new Error("No lock request is waiting");
			locked = el;
			notify(el, "pointerlockchange");
		},
		denyLock() {
			const el = pendingLocks.shift();
			if (!el) throw new Error("No lock request is waiting");
			notify(el, "pointerlockerror");
		},
		exitLock() {
			const el = locked;
			locked = null;
			notify(el, "pointerlockchange");
		},
		forceLock(el) {
			locked = el;
			notify(el, "pointerlockchange");
		},
	};

	const restore = () => {
		proto.setPointerCapture = saved.setCapture;
		proto.releasePointerCapture = saved.releaseCapture;
		proto.hasPointerCapture = saved.hasCapture;
		proto.requestPointerLock = saved.requestLock;
		docProto.exitPointerLock = saved.exitLock;
		Reflect.deleteProperty(Document.prototype, "pointerLockElement");
	};

	return { browser, restore };
}

/** Sets up the fake browser around each test in the file and hands back the current one. */
export function useFakeBrowser(): () => FakeBrowser {
	let current: ReturnType<typeof install> | null = null;
	beforeEach(() => {
		current = install();
	});
	afterEach(() => {
		cleanup();
		current?.restore();
		current = null;
	});
	return () => {
		if (!current) throw new Error("Only available inside a test");
		return current.browser;
	};
}

/** Dispatches a pointer event with every field set, wrapped so React flushes it. */
export function firePointer(
	el: Element,
	type: string,
	init: PointerInit = {},
): Event {
	const event = new MouseEvent(type, {
		bubbles: true,
		cancelable: true,
		button: init.button ?? 0,
		clientX: init.clientX ?? 0,
		clientY: init.clientY ?? 0,
		shiftKey: init.shiftKey ?? false,
		altKey: init.altKey ?? false,
	});
	for (const [key, value] of Object.entries({
		pointerId: init.pointerId ?? 1,
		pointerType: init.pointerType ?? "mouse",
		movementX: init.movementX ?? 0,
		movementY: init.movementY ?? 0,
	})) {
		Object.defineProperty(event, key, { value });
	}
	act(() => {
		el.dispatchEvent(event);
	});
	return event;
}
