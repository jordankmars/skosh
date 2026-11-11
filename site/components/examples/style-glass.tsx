"use client";

import { useState } from "react";
import { Skosh } from "skosh/react";

const field = [
	"flex h-10 items-center rounded-full border border-white/30 bg-white/20 text-sm text-white backdrop-blur-xl backdrop-saturate-150",
	"focus-within:border-white/70 data-scrubbing:bg-white/35",
	"*:data-skosh-label:grid *:data-skosh-label:h-full *:data-skosh-label:w-9 *:data-skosh-label:place-items-center *:data-skosh-label:text-xs *:data-skosh-label:text-white/70",
	"*:data-skosh-input:w-full *:data-skosh-input:min-w-0 *:data-skosh-input:pr-4 *:data-skosh-input:font-medium *:data-skosh-input:outline-none",
].join(" ");

export function StyleGlass() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<>
			<div className="absolute inset-0 rounded-xl bg-linear-to-br from-fuchsia-500 via-violet-500 to-sky-400" />
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
