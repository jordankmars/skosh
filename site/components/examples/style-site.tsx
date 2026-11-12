"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";

const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 dark:bg-neutral-900",
	"focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-400)] dark:focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-600)]",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"*:data-soupcon-label:grid *:data-soupcon-label:h-full *:data-soupcon-label:w-7 *:data-soupcon-label:place-items-center *:data-soupcon-label:text-[11px] *:data-soupcon-label:text-neutral-500 dark:*:data-soupcon-label:text-neutral-400",
	"*:data-soupcon-input:w-full *:data-soupcon-input:min-w-0 *:data-soupcon-input:pr-2 *:data-soupcon-input:font-mono *:data-soupcon-input:text-xs *:data-soupcon-input:tabular-nums *:data-soupcon-input:outline-none",
].join(" ");

export function StyleSite() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<div className="grid w-60 grid-cols-2 gap-2">
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
	);
}
