// Dev playground for the core. Everything is wired by hand on this page so the
// core can be tried out before any adapter exists.
import {
	createRef,
	type KeyboardEvent,
	type PointerEvent,
	StrictMode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
	clamp,
	createDragIntent,
	createScrubSession,
	type DragIntent,
	dragThreshold,
	editKeyAction,
	formatValue,
	type Point,
	parseValue,
	type ScrubOptions,
	type ScrubSession,
	stepValue,
	wrapCursor,
} from "../src/core";

type FieldKey = "w" | "r" | "rot" | "op";

interface FieldConfig extends ScrubOptions {
	label: string;
	unit: string;
}

const FIELDS: Record<FieldKey, FieldConfig> = {
	w: { label: "W", unit: "px", min: 40, max: 240, perPx: 1 },
	r: { label: "R", unit: "px", min: 0, max: 120, perPx: 0.5 },
	rot: { label: "Rot", unit: "°", min: -180, max: 180, perPx: 1 },
	op: { label: "Op", unit: "%", min: 0, max: 100, perPx: 0.5 },
};

const INITIAL: Record<FieldKey, number> = { w: 160, r: 20, rot: 0, op: 100 };

const LOCALES = ["en-US", "de-DE", "fr-FR"];

// Under pointer lock the real cursor is hidden, so we draw one that wraps
// around the window edges instead. There's only ever one drag at a time.
const virtualCursor = createRef<HTMLDivElement>();

function placeCursor({ x, y }: Point) {
	const el = virtualCursor.current;
	if (el) el.style.transform = `translate(${x}px, ${y}px)`;
}

function showCursor(visible: boolean) {
	virtualCursor.current?.classList.toggle("visible", visible);
}

function requestLock(el: HTMLElement) {
	try {
		// Returns a promise in newer browsers, which rejects if the lock is refused.
		// Either way pointer capture is already running, so the drag keeps working.
		Promise.resolve(el.requestPointerLock()).catch(() => {});
	} catch {}
}

interface FieldProps {
	config: FieldConfig;
	locale: string;
	value: number;
	onChange: (value: number) => void;
}

function ScrubField({ config, locale, value, onChange }: FieldProps) {
	const session = useRef<ScrubSession | null>(null);
	const handle = useRef<HTMLSpanElement>(null);
	const input = useRef<HTMLInputElement>(null);
	const intent = useRef<DragIntent | null>(null);
	const start = useRef<Point>({ x: 0, y: 0 });
	const lastX = useRef(0);
	const cursor = useRef<Point>({ x: 0, y: 0 });
	const lockRequested = useRef(false);
	const reverting = useRef(false);
	const [scrubbing, setScrubbing] = useState(false);
	const [draft, setDraft] = useState<string | null>(null);

	const format = (v: number) => formatValue(v, { ...config, locale });
	const commit = (n: number) =>
		onChange(clamp(n, config.min ?? -Infinity, config.max ?? Infinity));

	const isLocked = () =>
		handle.current !== null && document.pointerLockElement === handle.current;

	const onPointerDown = (e: PointerEvent<HTMLSpanElement>) => {
		if (e.button !== 0) return;
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		intent.current = createDragIntent(dragThreshold(e.pointerType));
		start.current = { x: e.clientX, y: e.clientY };
		lockRequested.current = false;
	};

	const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
		const press = intent.current;
		if (!press) return;
		if (press.state === "pending") {
			const next = press.move(
				e.clientX - start.current.x,
				e.clientY - start.current.y,
			);
			if (next === "pending") return;
			// A vertical swipe on touch is the page scrolling, so let it go. The
			// browser takes over through touch-action: pan-y. A mouse can't
			// scroll this way, so any direction scrubs.
			if (next === "scroll" && e.pointerType !== "mouse") {
				intent.current = null;
				return;
			}
			// Start from the press point so the threshold distance isn't lost.
			session.current = createScrubSession(value, config);
			lastX.current = start.current.x;
			setScrubbing(true);
			document.body.classList.add("scrubbing");
		}
		if (!session.current) return;
		let dx: number;
		if (isLocked()) {
			// clientX stops changing under lock, so read the raw movement instead.
			// Chrome sometimes reports one huge jump right after locking; skip it.
			if (Math.abs(e.movementX) > window.innerWidth / 2) return;
			dx = e.movementX;
			cursor.current = wrapCursor(
				cursor.current,
				{ x: e.movementX, y: e.movementY },
				{ width: window.innerWidth, height: window.innerHeight },
			);
			placeCursor(cursor.current);
		} else {
			dx = e.clientX - lastX.current;
			lastX.current = e.clientX;
			cursor.current = { x: e.clientX, y: e.clientY };
			// Lock once the drag actually moves, so a plain click never hides the cursor.
			if (!lockRequested.current && dx !== 0 && e.pointerType === "mouse") {
				lockRequested.current = true;
				requestLock(e.currentTarget);
			}
		}
		onChange(session.current.move(dx, { shift: e.shiftKey, alt: e.altKey }));
	};

	const onPointerUp = () => {
		// A tap on the label goes to the input, which matters most on touch where
		// the label is the bigger target.
		if (intent.current?.isTap) {
			input.current?.focus();
			input.current?.select();
		}
		stop();
	};

	const stop = useCallback(() => {
		intent.current = null;
		session.current = null;
		setScrubbing(false);
		document.body.classList.remove("scrubbing");
		if (handle.current && document.pointerLockElement === handle.current) {
			document.exitPointerLock();
		}
	}, []);

	useEffect(() => {
		const onLockChange = () => {
			const locked =
				handle.current !== null &&
				document.pointerLockElement === handle.current;
			// The lock is granted asynchronously, so a quick flick can finish
			// before it arrives. Let it go straight away if so.
			if (locked && !session.current) {
				document.exitPointerLock();
				return;
			}
			if (locked) placeCursor(cursor.current);
			showCursor(document.pointerLockElement !== null);
			// Losing the lock mid-drag (Escape, switching tabs) ends the drag, since
			// the real cursor reappears somewhere else.
			if (!locked && session.current && lockRequested.current) stop();
		};
		document.addEventListener("pointerlockchange", onLockChange);
		return () =>
			document.removeEventListener("pointerlockchange", onLockChange);
	}, [stop]);

	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		const stepped = stepValue(
			value,
			e.key,
			{ shift: e.shiftKey, alt: e.altKey },
			config,
		);
		if (stepped !== null) {
			e.preventDefault();
			onChange(stepped);
			setDraft(format(stepped));
			return;
		}
		const action = editKeyAction(e.key);
		if (action === "revert") reverting.current = true;
		if (action) e.currentTarget.blur();
	};

	const onBlur = () => {
		if (draft !== null && !reverting.current) {
			const n = parseValue(draft, { unit: config.unit, locale });
			if (n !== null) commit(n);
		}
		reverting.current = false;
		setDraft(null);
	};

	return (
		<label className={`sf${scrubbing ? " scrubbing" : ""}`}>
			{/* The label is a pointer-only handle. Keyboard users step with the arrow keys in the input. */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: see above */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: the click handler only stops the label focusing the input */}
			<span
				ref={handle}
				className="sf-l"
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={stop}
				onClick={(e) => e.preventDefault()}
			>
				{config.label}
			</span>
			<input
				ref={input}
				inputMode="decimal"
				value={draft ?? format(value)}
				onFocus={() => setDraft(format(value))}
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={onKeyDown}
				onBlur={onBlur}
			/>
			<i>{config.unit}</i>
		</label>
	);
}

function App() {
	const [values, setValues] = useState(INITIAL);
	const [locale, setLocale] = useState(LOCALES[0]);
	const set = (k: FieldKey) => (v: number) =>
		setValues((prev) => ({ ...prev, [k]: v }));

	return (
		<main className="wrap">
			<style>{CSS}</style>
			<header className="top">
				<h1>skosh playground</h1>
				<p>
					Drag a field's label left or right to change it. Hold Shift for ×10
					and Alt for fine steps, or type a value or a bit of math like 120*2.
					Keep dragging past the edge of the window and the cursor wraps around.
				</p>
			</header>
			<section className="stage">
				<div className="scrub">
					<div className="preview">
						<div
							className="shape"
							style={{
								width: values.w,
								borderRadius: values.r,
								transform: `rotate(${values.rot}deg)`,
								opacity: values.op / 100,
							}}
						/>
					</div>
					<div className="panel">
						{(Object.keys(FIELDS) as FieldKey[]).map((k) => (
							<ScrubField
								key={k}
								config={FIELDS[k]}
								locale={locale}
								value={values[k]}
								onChange={set(k)}
							/>
						))}
					</div>
				</div>
			</section>
			<div className="bar">
				<span>Locale</span>
				{LOCALES.map((l) => (
					<button
						key={l}
						type="button"
						className="btn"
						aria-pressed={l === locale}
						onClick={() => setLocale(l)}
					>
						{l}
					</button>
				))}
			</div>
			<pre className="state">{JSON.stringify(values)}</pre>
			<div ref={virtualCursor} className="vcursor">
				<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
					<path
						d="M7 8 3 12l4 4M17 8l4 4-4 4M3 12h18"
						fill="none"
						stroke="#fff"
						strokeWidth="4"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M7 8 3 12l4 4M17 8l4 4-4 4M3 12h18"
						fill="none"
						stroke="#000"
						strokeWidth="1.75"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
		</main>
	);
}

const CSS = `
:root {
	--bg: #f6f6f8; --surface: #ffffff; --stage: #ececf0; --fg: #16161a; --muted: #6a6a75;
	--line: #e2e2e8; --accent: #2d55e0; --accent-soft: #dde4fc;
	--sans: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
	--mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
	color-scheme: light;
}
@media (prefers-color-scheme: dark) {
	:root {
		--bg: #0e0e11; --surface: #1a1a1f; --stage: #121216; --fg: #ececf1; --muted: #9b9ba8;
		--line: #2a2a31; --accent: #7390ff; --accent-soft: #202a50; color-scheme: dark;
	}
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 14px/1.5 var(--sans); -webkit-font-smoothing: antialiased; }
input { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.wrap { max-width: 720px; margin: 0 auto; padding: 0 16px 64px; }
.top { padding-block: 40px 24px; display: grid; gap: 8px; }
.top h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.025em; }
.top p { margin: 0; color: var(--muted); }
.stage { height: 320px; background: var(--stage); border-radius: 10px; overflow: hidden; display: flex; align-items: center; padding: 16px; }
.state { font: 11px var(--mono); color: var(--muted); }
.bar { display: flex; align-items: center; gap: 6px; margin-top: 12px; font-size: 12.5px; color: var(--muted); }
.bar span { margin-right: 4px; }
.btn { font: 12.5px var(--mono); color: var(--fg); padding: 5px 10px; border: 0; border-radius: 7px; background: var(--stage); cursor: pointer; }
.btn:hover { background: var(--line); }
.btn[aria-pressed="true"] { background: var(--accent); color: #fff; }

.scrub { display: grid; grid-template-columns: 1fr 168px; gap: 14px; width: 100%; height: 100%; align-items: center; }
.preview { display: grid; place-items: center; height: 100%; overflow: hidden; min-width: 0; }
.shape { width: 160px; aspect-ratio: 1 / 1; max-width: 100%; border-radius: 20px; background: linear-gradient(150deg, var(--accent), #8fb1ff); }
.panel { background: var(--surface); border-radius: 12px; padding: 8px; display: grid; gap: 4px; }
.sf { display: grid; grid-template-columns: 34px 1fr auto; align-items: center; gap: 4px; border-radius: 7px; padding: 2px 6px 2px 2px; }
.sf:focus-within { background: var(--stage); box-shadow: inset 0 0 0 1px var(--accent); }
.sf.scrubbing { background: var(--accent-soft); }
.sf-l { font-family: var(--mono); font-size: 11px; color: var(--muted); cursor: ew-resize; touch-action: pan-y; user-select: none; -webkit-user-select: none; padding: 6px 0 6px 8px; border-radius: 6px; }
.sf-l:hover, .sf.scrubbing .sf-l { color: var(--accent); }
.sf input { width: 100%; min-width: 0; border: 0; background: transparent; font-family: var(--mono); font-size: 13px; padding: 5px 2px; outline: none; font-variant-numeric: tabular-nums; caret-color: var(--accent); }
.sf input::selection { background: var(--accent-soft); }
.sf i { font-style: normal; font-family: var(--mono); font-size: 11px; color: var(--muted); }
body.scrubbing, body.scrubbing * { cursor: ew-resize !important; }
.vcursor { position: fixed; top: -11px; left: -11px; z-index: 10; pointer-events: none; display: none; }
.vcursor.visible { display: block; }
/* Bigger targets for fingers, and 16px text so iOS doesn't zoom in on focus. */
@media (pointer: coarse) {
	.sf-l { padding-block: 12px; }
	.sf input { font-size: 16px; }
}
@media (max-width: 420px) { .scrub { grid-template-columns: 1fr 150px; gap: 8px; } }
`;

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
