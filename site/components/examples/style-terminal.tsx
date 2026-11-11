"use client";

import { useState } from "react";
import { Skosh } from "skosh/react";

const field = [
	"flex h-9 items-center border border-green-500/60 bg-black font-mono text-[13px] text-green-400",
	"focus-within:border-green-400 data-scrubbing:bg-green-400 data-scrubbing:text-black",
	"*:data-skosh-label:grid *:data-skosh-label:h-full *:data-skosh-label:w-10 *:data-skosh-label:shrink-0 *:data-skosh-label:place-items-center",
	"*:data-skosh-input:w-full *:data-skosh-input:min-w-0 *:data-skosh-input:pr-2 *:data-skosh-input:caret-green-400 *:data-skosh-input:outline-none",
].join(" ");

export function StyleTerminal() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<>
			<div className="absolute inset-0 rounded-xl bg-black" />
			<div className="relative grid w-64 grid-cols-2 gap-2">
				<Skosh
					label="$w"
					aria-label="Width"
					value={width}
					onValueChange={setWidth}
					className={field}
				/>
				<Skosh
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
