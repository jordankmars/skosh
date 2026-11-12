export const LOCALES = ["en-US", "de-DE", "fr-FR"] as const;
export type Locale = (typeof LOCALES)[number];

export const localeCode = (locale: Locale) => `import { useState } from "react";
import { Soupcon } from "soupcon/react";

export function Example() {
	const [size, setSize] = useState(12.5);
	return (
		<Soupcon
			label="S"
			locale="${locale}"
			step={0.1}
			unit="px"
			value={size}
			onValueChange={setSize}
		/>
	);
}`;
