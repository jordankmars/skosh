"use client";

import { useState } from "react";
import { Skosh } from "skosh/react";

const field = [
	"flex h-11 items-center rounded-full bg-white text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.12)]",
	"focus-within:shadow-[0_8px_24px_rgba(99,102,241,0.35)] data-scrubbing:shadow-[0_16px_40px_rgba(15,23,42,0.22)]",
	"*:data-skosh-label:grid *:data-skosh-label:h-full *:data-skosh-label:w-10 *:data-skosh-label:shrink-0 *:data-skosh-label:place-items-center *:data-skosh-label:text-slate-400",
	"*:data-skosh-input:w-full *:data-skosh-input:min-w-0 *:data-skosh-input:pr-4 *:data-skosh-input:outline-none",
].join(" ");

export function StyleSoft() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<>
			<div className="absolute inset-0 rounded-xl bg-indigo-50" />
			<div className="relative grid w-64 grid-cols-2 gap-3">
				<Skosh
					label="W"
					aria-label="Width"
					value={width}
					onValueChange={setWidth}
					className={field}
				/>
				<Skosh
					label="H"
					aria-label="Height"
					value={height}
					onValueChange={setHeight}
					className={field}
				/>
			</div>
		</>
	);
}
