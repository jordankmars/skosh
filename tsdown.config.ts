import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		"react/index": "src/react/index.ts",
	},
	format: "esm",
	dts: true,
	clean: true,
	publint: true,
	attw: { profile: "esm-only", level: "error" },
	outputOptions: {
		// Server component frameworks need this on the built file itself.
		banner: '"use client";',
	},
});
