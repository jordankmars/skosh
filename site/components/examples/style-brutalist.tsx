"use client";

import { useState } from "react";
import { Skosh } from "skosh/react";

const field = [
	"flex h-11 items-center border-[3px] border-black bg-white text-sm font-bold text-black shadow-[4px_4px_0_#000]",
	"focus-within:bg-yellow-300 data-scrubbing:bg-cyan-300 data-scrubbing:shadow-[8px_8px_0_#000]",
	"*:data-skosh-label:grid *:data-skosh-label:h-full *:data-skosh-label:w-10 *:data-skosh-label:shrink-0 *:data-skosh-label:place-items-center *:data-skosh-label:border-r-[3px] *:data-skosh-label:border-black *:data-skosh-label:bg-pink-400 *:data-skosh-label:font-black",
	"*:data-skosh-input:w-full *:data-skosh-input:min-w-0 *:data-skosh-input:px-2 *:data-skosh-input:outline-none",
].join(" ");

export function StyleBrutalist() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<>
			<div className="absolute inset-0 rounded-xl bg-amber-100" />
			<div className="relative grid w-72 grid-cols-2 gap-4">
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
