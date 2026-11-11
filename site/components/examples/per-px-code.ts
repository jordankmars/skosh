export const PER_PX = [0.1, 0.5, 1, 5] as const;
export type PerPx = (typeof PER_PX)[number];

export const perPxCode = (perPx: PerPx) => `import { useState } from "react";
import { Skosh } from "skosh/react";

export function Example() {
	const [x, setX] = useState(120);
	return <Skosh label="X" perPx={${perPx}} value={x} onValueChange={setX} />;
}`;
