"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";

const field = [
	"flex h-8 items-center rounded-md bg-neutral-100 dark:bg-neutral-900",
	"focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-400)] dark:focus-within:shadow-[inset_0_0_0_1px_var(--color-neutral-600)]",
	"data-scrubbing:bg-neutral-200 dark:data-scrubbing:bg-neutral-800",
	"*:data-soupcon-label:grid *:data-soupcon-label:h-full *:data-soupcon-label:w-7 *:data-soupcon-label:shrink-0 *:data-soupcon-label:place-items-center *:data-soupcon-label:text-[11px] *:data-soupcon-label:text-neutral-500 dark:*:data-soupcon-label:text-neutral-400",
	"*:data-soupcon-input:w-full *:data-soupcon-input:min-w-0 *:data-soupcon-input:pr-1 *:data-soupcon-input:font-mono *:data-soupcon-input:text-xs *:data-soupcon-input:tabular-nums *:data-soupcon-input:outline-none",
	"*:data-soupcon-unit:pr-2 *:data-soupcon-unit:font-mono *:data-soupcon-unit:text-[11px] *:data-soupcon-unit:text-neutral-500",
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
			<div className="relative h-56 w-full min-w-0 sm:flex-1 overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-900">
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
					<Soupcon
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
