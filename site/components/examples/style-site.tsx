"use client";

import { useState } from "react";
import { Skosh } from "skosh/react";

const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 dark:bg-neutral-900",
	"focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-400)] dark:focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-600)]",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"*:data-skosh-label:grid *:data-skosh-label:h-full *:data-skosh-label:w-7 *:data-skosh-label:place-items-center *:data-skosh-label:text-[11px] *:data-skosh-label:text-neutral-500 dark:*:data-skosh-label:text-neutral-400",
	"*:data-skosh-input:w-full *:data-skosh-input:min-w-0 *:data-skosh-input:pr-2 *:data-skosh-input:font-mono *:data-skosh-input:text-xs *:data-skosh-input:tabular-nums *:data-skosh-input:outline-none",
].join(" ");

export function StyleSite() {
	const [width, setWidth] = useState(160);
	const [height, setHeight] = useState(120);
	return (
		<div className="grid w-60 grid-cols-2 gap-2">
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
	);
}
