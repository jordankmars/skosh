// Dev playground: a small inspector built from the published component.
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Skosh, type SkoshProps } from "../src/react";

type FieldKey = "w" | "r" | "rot" | "op";

type FieldConfig = Pick<SkoshProps, "label" | "unit" | "min" | "max" | "perPx">;

const FIELDS: Record<FieldKey, FieldConfig> = {
	w: { label: "W", unit: "px", min: 40, max: 240, perPx: 1 },
	r: { label: "R", unit: "px", min: 0, max: 120, perPx: 0.5 },
	rot: { label: "Rot", unit: "°", min: -180, max: 180, perPx: 1 },
	op: { label: "Op", unit: "%", min: 0, max: 100, perPx: 0.5 },
};

const INITIAL: Record<FieldKey, number> = { w: 160, r: 20, rot: 0, op: 100 };

const LOCALES = ["en-US", "de-DE", "fr-FR"];

function App() {
	const [values, setValues] = useState(INITIAL);
	const [locale, setLocale] = useState(LOCALES[0]);
	const [lastCommit, setLastCommit] = useState<number | null>(null);
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
							<Skosh
								key={k}
								{...FIELDS[k]}
								locale={locale}
								value={values[k]}
								onValueChange={set(k)}
								onValueCommit={setLastCommit}
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
			<pre className="state">{JSON.stringify({ ...values, lastCommit })}</pre>
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
[data-skosh-root] { display: grid; grid-template-columns: 34px 1fr auto; align-items: center; gap: 4px; border-radius: 7px; padding: 2px 6px 2px 2px; }
[data-skosh-root]:focus-within { background: var(--stage); box-shadow: inset 0 0 0 1px var(--accent); }
[data-skosh-root][data-scrubbing] { background: var(--accent-soft); }
[data-skosh-label] { font-family: var(--mono); font-size: 11px; color: var(--muted); padding: 6px 0 6px 8px; border-radius: 6px; }
[data-skosh-label]:hover, [data-scrubbing] [data-skosh-label] { color: var(--accent); }
[data-skosh-input] { width: 100%; min-width: 0; border: 0; background: transparent; font-family: var(--mono); font-size: 13px; padding: 5px 2px; outline: none; font-variant-numeric: tabular-nums; caret-color: var(--accent); }
[data-skosh-input]::selection { background: var(--accent-soft); }
[data-skosh-unit] { font-family: var(--mono); font-size: 11px; color: var(--muted); }
/* Bigger targets for fingers, and 16px text so iOS doesn't zoom in on focus. */
@media (pointer: coarse) {
	[data-skosh-label] { padding-block: 12px; }
	[data-skosh-input] { font-size: 16px; }
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
