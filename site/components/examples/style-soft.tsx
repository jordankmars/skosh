"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";

const field = [
	"flex h-11 items-center rounded-full bg-white text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.12)]",
	"focus-within:shadow-[0_8px_24px_rgba(99,102,241,0.35)] data-scrubbing:shadow-[0_16px_40px_rgba(15,23,42,0.22)]",
	"*:data-soupcon-label:grid *:data-soupcon-label:h-full *:data-soupcon-label:w-10 *:data-soupcon-label:shrink-0 *:data-soupcon-label:place-items-center *:data-soupcon-label:text-slate-400",
	"*:data-soupcon-input:w-full *:data-soupcon-input:min-w-0 *:data-soupcon-input:pr-4 *:data-soupcon-input:outline-none",
].join(" ");

export function StyleSoft() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<>
			<div className="absolute inset-0 rounded-xl bg-indigo-50" />
			<div className="relative grid w-64 grid-cols-2 gap-3">
				<Soupcon
					label="W"
					aria-label="Width"
					value={width}
					onValueChange={setWidth}
					className={field}
				/>
				<Soupcon
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
