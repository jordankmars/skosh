"use client";

import { useState } from "react";
import { Skosh } from "skosh/react";

const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 dark:bg-neutral-900",
	"focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-400)] dark:focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-600)]",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"*:data-skosh-label:grid *:data-skosh-label:h-full *:data-skosh-label:w-14 *:data-skosh-label:shrink-0 *:data-skosh-label:place-items-center *:data-skosh-label:text-[11px] *:data-skosh-label:text-neutral-500 dark:*:data-skosh-label:text-neutral-400",
	"*:data-skosh-input:w-full *:data-skosh-input:min-w-0 *:data-skosh-input:pr-1 *:data-skosh-input:font-mono *:data-skosh-input:text-xs *:data-skosh-input:tabular-nums *:data-skosh-input:outline-none",
	"*:data-skosh-unit:pr-2 *:data-skosh-unit:font-mono *:data-skosh-unit:text-[11px] *:data-skosh-unit:text-neutral-500",
].join(" ");

export function Typography() {
	const [size, setSize] = useState(28);
	const [leading, setLeading] = useState(1.2);
	const [tracking, setTracking] = useState(-0.02);
	return (
		<div className="flex w-full flex-col items-center gap-6 sm:flex-row">
			<p
				className="h-40 w-full min-w-0 flex-1 overflow-hidden font-semibold"
				style={{
					fontSize: size,
					lineHeight: leading,
					letterSpacing: `${tracking}em`,
				}}
			>
				Good type is mostly small adjustments.
			</p>
			<div className="grid w-full gap-2 sm:w-44 sm:shrink-0">
				<Skosh
					label="Size"
					aria-label="Font size"
					min={8}
					max={72}
					unit="px"
					value={size}
					onValueChange={setSize}
					className={field}
				/>
				<Skosh
					label="Line"
					aria-label="Line height"
					min={0.8}
					max={2.4}
					step={0.05}
					perPx={0.01}
					precision={2}
					value={leading}
					onValueChange={setLeading}
					className={field}
				/>
				<Skosh
					label="Track"
					aria-label="Letter spacing"
					min={-0.1}
					max={0.4}
					step={0.01}
					perPx={0.002}
					precision={2}
					unit="em"
					value={tracking}
					onValueChange={setTracking}
					className={field}
				/>
			</div>
		</div>
	);
}
