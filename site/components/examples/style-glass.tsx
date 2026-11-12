"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";

const field = [
	"flex h-10 items-center rounded-full border border-white/30 bg-white/20 text-sm text-white backdrop-blur-xl backdrop-saturate-150",
	"focus-within:border-white/70 data-scrubbing:bg-white/35",
	"*:data-soupcon-label:grid *:data-soupcon-label:h-full *:data-soupcon-label:w-9 *:data-soupcon-label:place-items-center *:data-soupcon-label:text-xs *:data-soupcon-label:text-white/70",
	"*:data-soupcon-input:w-full *:data-soupcon-input:min-w-0 *:data-soupcon-input:pr-4 *:data-soupcon-input:font-medium *:data-soupcon-input:outline-none",
].join(" ");

export function StyleGlass() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<>
			<div className="absolute inset-0 rounded-xl bg-linear-to-br from-fuchsia-500 via-violet-500 to-sky-400" />
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
