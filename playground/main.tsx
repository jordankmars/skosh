// Dev playground for the core. Everything is wired by hand on this page so the
// core can be tried out before any adapter exists.
import {
	type KeyboardEvent,
	type PointerEvent,
	StrictMode,
	useRef,
	useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
	clamp,
	createScrubSession,
	editKeyAction,
	type ScrubOptions,
	type ScrubSession,
	stepValue,
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

// Whole numbers stay whole and anything else shows one decimal place.
const format = (v: number) => {
	const tenth = Math.round(v * 10) / 10;
	return Number.isInteger(tenth) ? String(Math.round(v)) : tenth.toFixed(1);
};

interface FieldProps {
	config: FieldConfig;
	value: number;
	onChange: (value: number) => void;
}

function ScrubField({ config, value, onChange }: FieldProps) {
	const session = useRef<ScrubSession | null>(null);
	const lastX = useRef(0);
	const reverting = useRef(false);
	const [scrubbing, setScrubbing] = useState(false);
	const [draft, setDraft] = useState<string | null>(null);

	const commit = (n: number) =>
		onChange(clamp(n, config.min ?? -Infinity, config.max ?? Infinity));

	const onPointerDown = (e: PointerEvent<HTMLSpanElement>) => {
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		session.current = createScrubSession(value, config);
		lastX.current = e.clientX;
		setScrubbing(true);
		document.body.classList.add("scrubbing");
	};

	const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
		if (!session.current) return;
		const dx = e.clientX - lastX.current;
		lastX.current = e.clientX;
		onChange(session.current.move(dx, { shift: e.shiftKey, alt: e.altKey }));
	};

	const stop = () => {
		session.current = null;
		setScrubbing(false);
		document.body.classList.remove("scrubbing");
	};

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
			const n = Number.parseFloat(draft);
			if (!Number.isNaN(n)) commit(n);
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
				className="sf-l"
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={stop}
				onPointerCancel={stop}
				onClick={(e) => e.preventDefault()}
			>
				{config.label}
			</span>
			<input
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
	const set = (k: FieldKey) => (v: number) =>
		setValues((prev) => ({ ...prev, [k]: v }));

	return (
		<main className="wrap">
			<style>{CSS}</style>
			<header className="top">
				<h1>skosh playground</h1>
				<p>
					Drag a field's label left or right to change it. Hold Shift for ×10
					and Alt for fine steps, or type a value.
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
								value={values[k]}
								onChange={set(k)}
							/>
						))}
					</div>
				</div>
			</section>
			<pre className="state">{JSON.stringify(values)}</pre>
		</main>
	);
}

const CSS = `
:root {
	--bg: #f6f6f8; --surface: #ffffff; --stage: #ececf0; --fg: #16161a; --muted: #6a6a75;
	--line: #e2e2e8; --accent: #2d55e0;
	--sans: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
	--mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
	color-scheme: light;
}
@media (prefers-color-scheme: dark) {
	:root {
		--bg: #0e0e11; --surface: #1a1a1f; --stage: #121216; --fg: #ececf1; --muted: #9b9ba8;
		--line: #2a2a31; --accent: #7390ff; color-scheme: dark;
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

.scrub { display: grid; grid-template-columns: 1fr 168px; gap: 14px; width: 100%; height: 100%; align-items: center; }
.preview { display: grid; place-items: center; height: 100%; overflow: hidden; min-width: 0; }
.shape { width: 160px; aspect-ratio: 1 / 1; max-width: 100%; border-radius: 20px; background: linear-gradient(150deg, var(--accent), #8fb1ff); }
.panel { background: var(--surface); border-radius: 12px; padding: 8px; display: grid; gap: 4px; }
.sf { display: grid; grid-template-columns: 34px 1fr auto; align-items: center; gap: 4px; border-radius: 7px; padding: 2px 6px 2px 2px; }
.sf:focus-within { background: var(--stage); }
.sf-l { font-family: var(--mono); font-size: 11px; color: var(--muted); cursor: ew-resize; touch-action: none; user-select: none; -webkit-user-select: none; padding: 6px 0 6px 8px; border-radius: 6px; }
.sf-l:hover, .sf.scrubbing .sf-l { color: var(--accent); }
.sf input { width: 100%; min-width: 0; border: 0; background: transparent; font-family: var(--mono); font-size: 13px; padding: 5px 2px; outline: none; font-variant-numeric: tabular-nums; }
.sf i { font-style: normal; font-family: var(--mono); font-size: 11px; color: var(--muted); }
body.scrubbing, body.scrubbing * { cursor: ew-resize !important; }
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
