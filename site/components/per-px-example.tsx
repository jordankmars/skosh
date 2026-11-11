import { highlight } from "@/lib/highlight";
import { PER_PX, type PerPx, perPxCode } from "./examples/per-px-code";
import { PerPxPicker } from "./examples/per-px-picker";

/** Highlights every variant at build time, so the picker can swap between them. */
export async function PerPxExample() {
	const entries = await Promise.all(
		PER_PX.map(async (perPx) => {
			const code = perPxCode(perPx);
			return [perPx, { html: await highlight(code), code }] as const;
		}),
	);
	return (
		<PerPxPicker
			variants={
				Object.fromEntries(entries) as Record<
					PerPx,
					{ html: string; code: string }
				>
			}
		/>
	);
}
