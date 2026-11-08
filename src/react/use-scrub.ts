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
} from "../core";
import { createGesture, type ValueGesture } from "./gesture";
import { useLatest } from "./use-latest";

export interface ScrubOptionsForHook {
	value: number;
	scrubOptions: ScrubOptions;
	onChange: (value: number) => void;
	onCommit?: (value: number) => void;
	enabled: boolean;
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
	drag: { session: ScrubSession; gesture: ValueGesture } | null;
}

export function useScrub(options: ScrubOptionsForHook) {
	const { value, scrubOptions, onChange, enabled, commitDraft, onTap } =
		options;
	const pressRef = useRef<Press | null>(null);
	const [scrubbing, setScrubbing] = useState(false);
	const latest = useLatest(options);

	// Safe to call twice: whatever fires second finds nothing left to end.
	const end = useCallback(() => {
		const press = pressRef.current;
		if (!press) return;
		pressRef.current = null;
		setScrubbing(false);
		const final = press.drag?.gesture.finish() ?? null;
		if (final !== null) latest.current.onCommit?.(final);
	}, [latest]);

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
			const dx = e.clientX - press.lastX;
			press.lastX = e.clientX;
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
			if (isCurrent(e)) end();
		},
		// The tap handling above does the focusing, so stop the <label> doing it too.
		onClick: (e: MouseEvent<HTMLElement>) => {
			if (enabled) e.preventDefault();
		},
	};

	return { handleProps, scrubbing };
}
