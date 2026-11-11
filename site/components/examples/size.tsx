"use client";

import { useState } from "react";
import { Skosh } from "skosh/react";

const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 dark:bg-neutral-900",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"*:data-skosh-label:grid *:data-skosh-label:h-full *:data-skosh-label:w-7 *:data-skosh-label:place-items-center *:data-skosh-label:text-[11px] *:data-skosh-label:text-neutral-500",
	"*:data-skosh-input:w-full *:data-skosh-input:min-w-0 *:data-skosh-input:pr-2 *:data-skosh-input:font-mono *:data-skosh-input:text-xs *:data-skosh-input:outline-none",
].join(" ");

export function Size() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<div className="grid w-60 grid-cols-2 gap-2">
			<Skosh
				label="W"
				aria-label="Width"
				min={0}
				value={width}
				onValueChange={setWidth}
				className={field}
			/>
			<Skosh
				label="H"
				aria-label="Height"
				min={0}
				value={height}
				onValueChange={setHeight}
				className={field}
			/>
		</div>
	);
}
