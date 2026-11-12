import type { CSSProperties, Ref } from "react";
import { createPortal } from "react-dom";

const TOP = 2147483647;

const overlayStyle: CSSProperties = {
	position: "fixed",
	inset: 0,
	zIndex: TOP - 1,
	cursor: "ew-resize",
};

const virtualStyle: CSSProperties = {
	position: "fixed",
	top: -11,
	left: -11,
	zIndex: TOP,
	pointerEvents: "none",
};

const ARROWS = "M7 8 3 12l4 4M17 8l4 4-4 4M3 12h18";

function Arrows() {
	const shared = {
		d: ARROWS,
		fill: "none",
		strokeLinecap: "round",
		strokeLinejoin: "round",
	} as const;
	return (
		<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
			<path {...shared} stroke="#fff" strokeWidth="4" />
			<path {...shared} stroke="#000" strokeWidth="1.75" />
		</svg>
	);
}

interface ScrubCursorProps {
	target: HTMLElement;
	locked: boolean;
	cursorRef: Ref<HTMLDivElement>;
}

/**
 * What the pointer looks like during a mouse drag. The overlay holds the
 * resize cursor wherever the pointer goes, without needing a stylesheet. Under
 * pointer lock the real cursor is hidden, so one is drawn in its place.
 */
export function ScrubCursor({ target, locked, cursorRef }: ScrubCursorProps) {
	return createPortal(
		<>
			<div data-soupcon-cursor="overlay" style={overlayStyle} />
			{locked ? (
				<div data-soupcon-cursor="virtual" ref={cursorRef} style={virtualStyle}>
					<Arrows />
				</div>
			) : null}
		</>,
		target,
	);
}
