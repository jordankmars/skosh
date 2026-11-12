"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";

// The playground's inspector, cut down to a width and height pair laid out
// like Figma's: a muted letter you drag, then the value, no unit. It's styled
// through soupcon's data attributes in the site's neutral palette.
const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 text-left transition-colors dark:bg-neutral-900",
	"focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-400)] dark:focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-600)]",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"[&_[data-soupcon-label]]:grid [&_[data-soupcon-label]]:h-full [&_[data-soupcon-label]]:w-7 [&_[data-soupcon-label]]:shrink-0 [&_[data-soupcon-label]]:place-items-center [&_[data-soupcon-label]]:text-[11px] [&_[data-soupcon-label]]:text-neutral-500 dark:[&_[data-soupcon-label]]:text-neutral-400",
	"[&_[data-soupcon-label]:hover]:text-neutral-900 data-scrubbing:[&_[data-soupcon-label]]:text-neutral-900 dark:[&_[data-soupcon-label]:hover]:text-neutral-100 dark:data-scrubbing:[&_[data-soupcon-label]]:text-neutral-100",
	"[&_[data-soupcon-input]]:h-full [&_[data-soupcon-input]]:w-full [&_[data-soupcon-input]]:min-w-0 [&_[data-soupcon-input]]:bg-transparent [&_[data-soupcon-input]]:pr-2 [&_[data-soupcon-input]]:font-mono [&_[data-soupcon-input]]:text-[12px] [&_[data-soupcon-input]]:tabular-nums [&_[data-soupcon-input]]:outline-none",
	// Bigger targets for fingers, and 16px text so iOS doesn't zoom in on focus.
	"pointer-coarse:h-10 pointer-coarse:[&_[data-soupcon-input]]:text-base",
].join(" ");

export function SizeFields() {
	const [size, setSize] = useState({ w: 160, h: 120 });
	return (
		<div className="grid w-[248px] grid-cols-2 gap-2">
			<Soupcon
				label="W"
				aria-label="Width"
				min={0}
				value={size.w}
				onValueChange={(w) => setSize((s) => ({ ...s, w }))}
				className={field}
			/>
			<Soupcon
				label="H"
				aria-label="Height"
				min={0}
				value={size.h}
				onValueChange={(h) => setSize((s) => ({ ...s, h }))}
				className={field}
			/>
		</div>
	);
}
