"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";
import { ExampleTabs } from "../example-tabs";
import { Options } from "./options";
import { PER_PX, type PerPx } from "./per-px-code";
import { siteField } from "./site-field";

export function PerPxPicker({
	variants,
}: {
	variants: Record<PerPx, { html: string; code: string }>;
}) {
	const [perPx, setPerPx] = useState<PerPx>(1);
	const [x, setX] = useState(120);

	const view = (
		<>
			<Soupcon
				label="X"
				aria-label="X position"
				perPx={perPx}
				value={x}
				onValueChange={setX}
				className={siteField}
			/>
			<Options
				legend="perPx"
				values={PER_PX}
				value={perPx}
				onChange={setPerPx}
			/>
		</>
	);

	return <ExampleTabs view={view} {...variants[perPx]} />;
}
