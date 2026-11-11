import { highlight } from "@/lib/highlight";
import { LOCALES, type Locale, localeCode } from "./examples/locale-code";
import { LocalePicker } from "./examples/locale-picker";

/** Highlights every variant at build time, so the picker can swap between them. */
export async function LocaleExample() {
	const entries = await Promise.all(
		LOCALES.map(async (locale) => {
			const code = localeCode(locale);
			return [locale, { html: await highlight(code), code }] as const;
		}),
	);
	return (
		<LocalePicker
			variants={
				Object.fromEntries(entries) as Record<
					Locale,
					{ html: string; code: string }
				>
			}
		/>
	);
}
