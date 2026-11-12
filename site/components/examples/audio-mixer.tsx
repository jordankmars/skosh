"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";

const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 dark:bg-neutral-900",
	"focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-400)] dark:focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-600)]",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"*:data-soupcon-label:grid *:data-soupcon-label:h-full *:data-soupcon-label:w-14 *:data-soupcon-label:shrink-0 *:data-soupcon-label:place-items-center *:data-soupcon-label:text-[11px] *:data-soupcon-label:text-neutral-500 dark:*:data-soupcon-label:text-neutral-400",
	"*:data-soupcon-input:w-full *:data-soupcon-input:min-w-0 *:data-soupcon-input:pr-1 *:data-soupcon-input:font-mono *:data-soupcon-input:text-xs *:data-soupcon-input:tabular-nums *:data-soupcon-input:outline-none",
	"*:data-soupcon-unit:pr-2 *:data-soupcon-unit:font-mono *:data-soupcon-unit:text-[11px] *:data-soupcon-unit:text-neutral-500",
].join(" ");

/** A bell around `freq`, across 20 Hz to 20 kHz on a log scale. */
function curve(freq: number, gain: number, q: number) {
	return Array.from({ length: 97 }, (_, i) => {
		const hz = 20 * 1000 ** (i / 96);
		const db = gain * Math.exp(-((Math.log2(hz / freq) * q) ** 2));
		return `${i * 2.5},${48 - db * 1.75}`;
	}).join(" ");
}

export function AudioMixer() {
	const [freq, setFreq] = useState(1000);
	const [gain, setGain] = useState(9);
	const [q, setQ] = useState(1.4);
	return (
		<div className="flex w-full flex-col items-center gap-4 sm:flex-row">
			<svg
				viewBox="0 0 240 96"
				aria-hidden="true"
				className="h-40 w-full min-w-0 sm:flex-1 rounded-lg bg-neutral-50 dark:bg-neutral-900"
			>
				<line
					x1="0"
					y1="48"
					x2="240"
					y2="48"
					className="stroke-neutral-300 dark:stroke-neutral-700"
				/>
				<polyline
					points={curve(freq, gain, q)}
					fill="none"
					strokeWidth="2"
					className="stroke-neutral-900 dark:stroke-neutral-100"
				/>
			</svg>
			<div className="grid w-full gap-2 sm:w-44 sm:shrink-0">
				<Soupcon
					label="Freq"
					aria-label="Frequency"
					min={20}
					max={20000}
					perPx={10}
					unit="Hz"
					value={freq}
					onValueChange={setFreq}
					className={field}
				/>
				<Soupcon
					label="Gain"
					min={-24}
					max={24}
					step={0.1}
					precision={1}
					unit="dB"
					value={gain}
					onValueChange={setGain}
					className={field}
				/>
				<Soupcon
					label="Q"
					aria-label="Bandwidth"
					min={0.1}
					max={10}
					step={0.1}
					perPx={0.02}
					precision={1}
					value={q}
					onValueChange={setQ}
					className={field}
				/>
			</div>
		</div>
	);
}
