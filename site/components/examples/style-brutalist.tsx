"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";

const field = [
	"flex h-11 items-center border-[3px] border-black bg-white text-sm font-bold text-black shadow-[4px_4px_0_#000]",
	"focus-within:bg-yellow-300 data-scrubbing:bg-cyan-300 data-scrubbing:shadow-[8px_8px_0_#000]",
	"*:data-soupcon-label:grid *:data-soupcon-label:h-full *:data-soupcon-label:w-10 *:data-soupcon-label:shrink-0 *:data-soupcon-label:place-items-center *:data-soupcon-label:border-r-[3px] *:data-soupcon-label:border-black *:data-soupcon-label:bg-pink-400 *:data-soupcon-label:font-black",
	"*:data-soupcon-input:w-full *:data-soupcon-input:min-w-0 *:data-soupcon-input:px-2 *:data-soupcon-input:outline-none",
].join(" ");

export function StyleBrutalist() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<>
			<div className="absolute inset-0 rounded-xl bg-amber-100" />
			<div className="relative grid w-72 grid-cols-2 gap-4">
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
