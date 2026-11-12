"use client";

import { useState } from "react";
import { Soupcon } from "soupcon/react";
import { ExampleTabs } from "../example-tabs";
import { LOCALES, type Locale } from "./locale-code";
import { Options } from "./options";
import { siteField } from "./site-field";

export function LocalePicker({
	variants,
}: {
	variants: Record<Locale, { html: string; code: string }>;
}) {
	const [locale, setLocale] = useState<Locale>("de-DE");
	const [size, setSize] = useState(12.5);

	const view = (
		<>
			<Soupcon
				label="S"
				aria-label="Size"
				locale={locale}
				step={0.1}
				unit="px"
				value={size}
				onValueChange={setSize}
				className={siteField}
			/>
			<Options
				legend="Locale"
				values={LOCALES}
				value={locale}
				onChange={setLocale}
			/>
		</>
	);

	return <ExampleTabs view={view} {...variants[locale]} />;
}
