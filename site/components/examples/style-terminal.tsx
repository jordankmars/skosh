"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";

const field = [
	"flex h-9 items-center border border-green-500/60 bg-black font-mono text-[13px] text-green-400",
	"focus-within:border-green-400 data-scrubbing:bg-green-400 data-scrubbing:text-black",
	"*:data-soupcon-label:grid *:data-soupcon-label:h-full *:data-soupcon-label:w-10 *:data-soupcon-label:shrink-0 *:data-soupcon-label:place-items-center",
	"*:data-soupcon-input:w-full *:data-soupcon-input:min-w-0 *:data-soupcon-input:pr-2 *:data-soupcon-input:caret-green-400 *:data-soupcon-input:outline-none",
].join(" ");

export function StyleTerminal() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<>
			<div className="absolute inset-0 rounded-xl bg-black" />
			<div className="relative grid w-64 grid-cols-2 gap-2">
				<Soupcon
					label="$w"
					aria-label="Width"
					value={width}
					onValueChange={setWidth}
					className={field}
				/>
				<Soupcon
					label="$h"
					aria-label="Height"
					value={height}
					onValueChange={setHeight}
					className={field}
				/>
			</div>
		</>
	);
}
