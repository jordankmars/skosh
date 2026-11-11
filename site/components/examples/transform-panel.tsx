"use client";

import { useState } from "react";
import { Skosh } from "skosh/react";

const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 dark:bg-neutral-900",
	"focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-400)] dark:focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-600)]",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"*:data-skosh-label:grid *:data-skosh-label:h-full *:data-skosh-label:w-7 *:data-skosh-label:shrink-0 *:data-skosh-label:place-items-center *:data-skosh-label:text-[11px] *:data-skosh-label:text-neutral-500 dark:*:data-skosh-label:text-neutral-400",
	"*:data-skosh-input:w-full *:data-skosh-input:min-w-0 *:data-skosh-input:pr-1 *:data-skosh-input:font-mono *:data-skosh-input:text-xs *:data-skosh-input:tabular-nums *:data-skosh-input:outline-none",
	"*:data-skosh-unit:pr-2 *:data-skosh-unit:font-mono *:data-skosh-unit:text-[11px] *:data-skosh-unit:text-neutral-500",
].join(" ");

const FIELDS = [
	{ key: "x", label: "X", name: "X position" },
	{ key: "y", label: "Y", name: "Y position" },
	{ key: "w", label: "W", name: "Width", min: 8, max: 240 },
	{ key: "h", label: "H", name: "Height", min: 8, max: 200 },
	{
		key: "rotate",
		label: "∠",
		name: "Rotation",
		min: -180,
		max: 180,
		unit: "°",
	},
	{ key: "radius", label: "R", name: "Radius", min: 0, max: 100 },
] as const;

export function TransformPanel() {
	const [shape, setShape] = useState({
		x: 48,
		y: 56,
		w: 112,
		h: 96,
		rotate: 0,
		radius: 12,
	});
	return (
		<div className="flex w-full flex-col items-center gap-4 sm:flex-row">
			<div className="relative h-56 w-full min-w-0 flex-1 overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-900">
				<div
					className="absolute bg-neutral-900 dark:bg-neutral-100"
					style={{
						left: shape.x,
						top: shape.y,
						width: shape.w,
						height: shape.h,
						rotate: `${shape.rotate}deg`,
						borderRadius: shape.radius,
					}}
				/>
			</div>
			<div className="grid w-full grid-cols-2 gap-2 sm:w-52 sm:shrink-0">
				{FIELDS.map(({ key, name, ...props }) => (
					<Skosh
						key={key}
						{...props}
						aria-label={name}
						value={shape[key]}
						onValueChange={(value) => setShape((s) => ({ ...s, [key]: value }))}
						className={field}
					/>
				))}
			</div>
		</div>
	);
}
