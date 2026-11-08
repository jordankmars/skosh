import {
	type MouseEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	createDragIntent,
	createScrubSession,
	type DragIntent,
	dragThreshold,
	type Point,
	type ScrubOptions,
	type ScrubSession,
	wrapCursor,
} from "../core";
import { createGesture, type ValueGesture } from "./gesture";
import { createPointerLock, type PointerLock } from "./pointer-lock";
import { useLatest } from "./use-latest";

export interface ScrubOptionsForHook {
	value: number;
	scrubOptions: ScrubOptions;
	onChange: (value: number) => void;
	onCommit?: (value: number) => void;
	enabled: boolean;
	pointerLock: boolean;
	/** Applies any typed text first, and returns the new value if that changed it. */
	commitDraft: () => number | null;
	/** Called for a tap on the label. */
	onTap: () => void;
}

interface Press {
	el: HTMLElement;
	pointerId: number;
	pointerType: string;
	intent: DragIntent;
	start: Point;
	lastX: number;
	lockRequested: boolean;
	drag: { session: ScrubSession; gesture: ValueGesture } | null;
}

export function useScrub(options: ScrubOptionsForHook) {
	const { value, scrubOptions, onChange, enabled, commitDraft, onTap } =
		options;
	const pressRef = useRef<Press | null>(null);
	const [scrubbing, setScrubbing] = useState(false);
	const latest = useLatest(options);
	const lockRef = useRef<PointerLock | null>(null);
	const [locked, setLocked] = useState(false);
	const [cursorTarget, setCursorTarget] = useState<HTMLElement | null>(null);
	const cursorPosition = useRef<Point>({ x: 0, y: 0 });
	const cursorEl = useRef<HTMLDivElement | null>(null);

	const placeCursor = useCallback((el: HTMLDivElement | null) => {
		const { x, y } = cursorPosition.current;
		if (el) el.style.transform = `translate(${x}px, ${y}px)`;
	}, []);

	// The drawn cursor mounts a little after the lock arrives, and moves can land first.
	const cursorRef = useCallback(
		(el: HTMLDivElement | null) => {
			cursorEl.current = el;
			placeCursor(el);
		},
		[placeCursor],
	);

	// Safe to call twice: whatever fires second finds nothing left to end.
	const end = useCallback(() => {
		const press = pressRef.current;
		if (!press) return;
		pressRef.current = null;
		setScrubbing(false);
		setLocked(false);
		setCursorTarget(null);
		lockRef.current?.release();
		const final = press.drag?.gesture.finish() ?? null;
		if (final !== null) latest.current.onCommit?.(final);
	}, [latest]);

	// Created once, and only needs the stable `end`.
	lockRef.current ??= createPointerLock({
		onHeld: () => setLocked(true),
		onLost: end,
	});
	const lock = lockRef.current;

	useEffect(() => {
		if (!enabled) end();
	}, [enabled, end]);

	useEffect(() => end, [end]);

	/** Turns a press into a drag, from the press point so the threshold isn't lost. */
	const beginDrag = (press: Press) => {
		const start = commitDraft() ?? value;
		press.lastX = press.start.x;
		press.drag = {
			session: createScrubSession(start, scrubOptions),
			gesture: createGesture(start),
		};
		setScrubbing(true);
		if (press.pointerType === "mouse") {
			setCursorTarget(press.el.ownerDocument.body);
		}
	};

	const isCurrent = (e: PointerEvent) =>
		pressRef.current?.pointerId === e.pointerId;

	const handleProps = {
		onPointerDown: (e: PointerEvent<HTMLElement>) => {
			if (!enabled || e.button !== 0 || pressRef.current) return;
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			pressRef.current = {
				el: e.currentTarget,
				pointerId: e.pointerId,
				pointerType: e.pointerType,
				intent: createDragIntent(dragThreshold(e.pointerType)),
				start: { x: e.clientX, y: e.clientY },
				lastX: e.clientX,
				lockRequested: false,
				drag: null,
			};
		},
		onPointerMove: (e: PointerEvent<HTMLElement>) => {
			const press = pressRef.current;
			if (!press || !isCurrent(e)) return;
			if (!press.drag) {
				const intent = press.intent.move(
					e.clientX - press.start.x,
					e.clientY - press.start.y,
				);
				if (intent === "pending") return;
				// A vertical swipe on touch is the page scrolling, so let it go.
				// A mouse can't scroll this way, so any direction scrubs.
				if (intent === "scroll" && e.pointerType !== "mouse") {
					pressRef.current = null;
					return;
				}
				beginDrag(press);
			}
			const drag = press.drag;
			if (!drag) return;
			let dx: number;
			if (lock.held) {
				// clientX stops changing under lock, so read the raw movement instead.
				// Chrome sometimes reports one huge jump right after locking; skip it.
				const view = press.el.ownerDocument.defaultView;
				if (view && Math.abs(e.movementX) > view.innerWidth / 2) return;
				dx = e.movementX;
				if (view) {
					cursorPosition.current = wrapCursor(
						cursorPosition.current,
						{ x: e.movementX, y: e.movementY },
						{ width: view.innerWidth, height: view.innerHeight },
					);
				}
				placeCursor(cursorEl.current);
			} else {
				dx = e.clientX - press.lastX;
				press.lastX = e.clientX;
				cursorPosition.current = { x: e.clientX, y: e.clientY };
				// Lock once the drag actually moves, so a plain click never hides the cursor.
				if (
					options.pointerLock &&
					!press.lockRequested &&
					dx !== 0 &&
					e.pointerType === "mouse"
				) {
					press.lockRequested = true;
					lock.request(press.el);
				}
			}
			// Moving straight up or down shouldn't round a value nobody asked to change.
			if (dx === 0) return;
			const next = drag.session.move(dx, {
				shift: e.shiftKey,
				alt: e.altKey,
			});
			if (drag.gesture.update(next)) onChange(next);
		},
		onPointerUp: (e: PointerEvent<HTMLElement>) => {
			const press = pressRef.current;
			if (!press || !isCurrent(e)) return;
			if (press.intent.isTap) onTap();
			end();
		},
		onPointerCancel: (e: PointerEvent<HTMLElement>) => {
			if (isCurrent(e)) end();
		},
		onLostPointerCapture: (e: PointerEvent<HTMLElement>) => {
			// Chrome drops capture when the lock takes over, and that's not an ending.
			if (isCurrent(e) && lock.idle) end();
		},
		// The tap handling above does the focusing, so stop the <label> doing it too.
		onClick: (e: MouseEvent<HTMLElement>) => {
			if (enabled) e.preventDefault();
		},
	};

	return { handleProps, scrubbing, locked, cursorTarget, cursorRef };
}
